"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Goal,
  Milestone,
  Plan,
  PlanSection,
  PracticeSession,
  ProgressNote,
  SessionStatus,
  SkillMapData,
  SyncDevice,
} from "@/src/types/schema";
import { getOrCreateDeviceIdentity } from "@/src/lib/storage/device";
import {
  clearSavedFileHandle,
  getSavedFileHandle,
  saveFileHandle,
} from "@/src/lib/storage/indexeddb";
import {
  getDirtySinceExport,
  loadPlannerDataFromDb,
  markCleanAfterExport,
  markDirtySinceExport,
  replacePlannerDataInDb,
  updateSyncMetadataInDb,
} from "@/src/lib/storage/dexie";
import {
  createPlannerFile,
  openPlannerFile,
  readPlannerFile,
  verifyPermission,
  writePlannerFile,
  FileSystemAccessError,
} from "@/src/lib/storage/fileSystem";
import {
  downloadJsonBackup,
  importJsonFile,
} from "@/src/lib/storage/exportImport";
import { parseSkillMapData } from "@/src/lib/skillMapData";

export type PlannerSyncStatus =
  | "not_connected"
  | "connected"
  | "permission_required"
  | "sync_unsupported";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type PlannerDataUpdate =
  | SkillMapData
  | ((currentData: SkillMapData) => SkillMapData);

interface PlannerContextValue {
  data: SkillMapData | null;
  fileHandle: FileSystemFileHandle | null;
  syncStatus: PlannerSyncStatus;
  saveStatus: SaveStatus;
  isLoading: boolean;
  loadData: () => Promise<void>;
  createFileForSync: () => Promise<void>;
  connectFileForSync: () => Promise<void>;
  disconnectFile: () => Promise<void>;
  grantWritePermission: () => Promise<void>;
  updateData: (nextData: PlannerDataUpdate) => Promise<void>;
  saveData: () => Promise<void>;
  exportJsonBackup: () => void;
  importJsonBackup: (file: File) => Promise<void>;
  createGoal: (data: Omit<Goal, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateGoal: (id: string, data: Partial<Omit<Goal, "id" | "created_at">>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  createMilestone: (data: Omit<Milestone, "id" | "created_at" | "updated_at" | "completed_at">) => Promise<void>;
  updateMilestone: (id: string, data: Partial<Omit<Milestone, "id" | "created_at">>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  toggleMilestoneComplete: (id: string) => Promise<void>;
  reorderMilestones: (goalId: string, orderedIds: string[]) => Promise<void>;
  createPracticeSession: (data: Omit<PracticeSession, "id" | "created_at" | "updated_at" | "completed_at">) => Promise<void>;
  updatePracticeSession: (id: string, data: Partial<Omit<PracticeSession, "id" | "created_at">>) => Promise<void>;
  deletePracticeSession: (id: string) => Promise<void>;
  updateSessionStatus: (id: string, status: SessionStatus) => Promise<void>;
  createProgressNote: (data: Omit<ProgressNote, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateProgressNote: (id: string, data: Partial<Omit<ProgressNote, "id" | "created_at">>) => Promise<void>;
  deleteProgressNote: (id: string) => Promise<void>;
  createPlan: (plan: Omit<Plan, "id" | "sections" | "created_at" | "updated_at">) => Promise<void>;
  updatePlan: (id: string, plan: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  createPlanSection: (planId: string, section: Omit<PlanSection, "id" | "plan_id" | "created_at" | "updated_at">) => Promise<void>;
  updatePlanSection: (planId: string, sectionId: string, section: Partial<PlanSection>) => Promise<void>;
  deletePlanSection: (planId: string, sectionId: string) => Promise<void>;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

function isFileSystemAccessSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "showOpenFilePicker" in window &&
    "showSaveFilePicker" in window
  );
}

function normalizeSkillMapData(data: SkillMapData): SkillMapData {
  return parseSkillMapData({
    ...data,
    topics: (data.topics ?? []).map((topic) => ({
      ...topic,
      milestone_id: topic.milestone_id ?? null,
    })),
    courses: Array.isArray(data.courses) ? data.courses : [],
    modules: Array.isArray(data.modules) ? data.modules : [],
    notes: Array.isArray(data.notes) ? data.notes : [],
    bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : [],
    goals: Array.isArray(data.goals) ? data.goals : [],
    milestones: Array.isArray(data.milestones) ? data.milestones : [],
    practice_sessions: Array.isArray(data.practice_sessions) ? data.practice_sessions : [],
    progress_notes: Array.isArray(data.progress_notes) ? data.progress_notes : [],
    plans: Array.isArray(data.plans) ? data.plans : [],
  });
}

function withUpdatedSyncMetadata(data: SkillMapData): SkillMapData {
  const now = new Date().toISOString();
  const device = getOrCreateDeviceIdentity();
  const existingDevice = data.sync.devices.find((d) => d.id === device.device_id);
  const currentDevice: SyncDevice = {
    id: device.device_id,
    name: device.device_name,
    last_opened_at: now,
  };
  const devices = existingDevice
    ? data.sync.devices.map((d) => (d.id === device.device_id ? currentDevice : d))
    : [...data.sync.devices, currentDevice];

  return {
    ...data,
    sync: {
      ...data.sync,
      last_saved_at: now,
      last_opened_at: now,
      last_device_id: device.device_id,
      last_device_name: device.device_name,
      devices,
    },
  };
}

function createId(prefix: string): string {
  if (typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SkillMapData | null>(null);
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [syncStatus, setSyncStatus] = useState<PlannerSyncStatus>("not_connected");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isDirtySinceExport, setIsDirtySinceExport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dataRef = useRef<SkillMapData | null>(null);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { fileHandleRef.current = fileHandle; }, [fileHandle]);

  useEffect(() => {
    if (saveStatus !== "saved") return;

    const timeoutId = window.setTimeout(() => {
      setSaveStatus("idle");
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [saveStatus]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (syncStatus !== "sync_unsupported" || !isDirtySinceExport) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [syncStatus, isDirtySinceExport]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const plannerData = normalizeSkillMapData(await loadPlannerDataFromDb());
      dataRef.current = plannerData;
      setData(plannerData);
      setIsDirtySinceExport(await getDirtySinceExport());

      if (!isFileSystemAccessSupported()) {
        setFileHandle(null);
        setSyncStatus("sync_unsupported");
        return;
      }

      const savedFileHandle = await getSavedFileHandle();
      if (!savedFileHandle) {
        setFileHandle(null);
        setSyncStatus("not_connected");
        return;
      }

      let hasPermission = false;
      try {
        hasPermission = await verifyPermission(savedFileHandle, "readwrite", {
          requestPermission: false,
        });
      } catch (error) {
        if (error instanceof FileSystemAccessError) {
          await clearSavedFileHandle();
          setFileHandle(null);
          setSyncStatus("not_connected");
          return;
        }
        throw error;
      }

      setFileHandle(savedFileHandle);
      setSyncStatus(hasPermission ? "connected" : "permission_required");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadData]);

  const persistData = useCallback(async (nextData: SkillMapData) => {
    setSaveStatus("saving");

    let normalizedData: SkillMapData;
    try {
      normalizedData = normalizeSkillMapData(nextData);
      await replacePlannerDataInDb(normalizedData);
    } catch (error) {
      setSaveStatus("error");
      throw error;
    }

    dataRef.current = normalizedData;
    setData(normalizedData);
    setSaveStatus("saved");

    const currentFileHandle = fileHandleRef.current;
    if (!currentFileHandle) {
      if (syncStatus === "sync_unsupported") {
        await markDirtySinceExport();
        setIsDirtySinceExport(true);
      }
      return;
    }

    try {
      const hasPermission = await verifyPermission(currentFileHandle, "readwrite", {
        requestPermission: false,
      });
      if (!hasPermission) {
        setSyncStatus("permission_required");
        return;
      }

      const dataWithSync = withUpdatedSyncMetadata(normalizedData);
      await writePlannerFile(currentFileHandle, dataWithSync);
      await updateSyncMetadataInDb(dataWithSync.sync);
      dataRef.current = dataWithSync;
      setData(dataWithSync);
      setSyncStatus("connected");
      await markCleanAfterExport();
      setIsDirtySinceExport(false);
    } catch {
      setSyncStatus("permission_required");
    }
  }, [syncStatus]);

  const updateData = useCallback(async (nextData: PlannerDataUpdate) => {
    const base = dataRef.current ?? (await loadPlannerDataFromDb());
    const resolved = typeof nextData === "function" ? nextData(base) : nextData;
    await persistData(resolved);
  }, [persistData]);

  const createFileForSync = useCallback(async () => {
    setIsLoading(true);
    try {
      const newFileHandle = await createPlannerFile();
      await saveFileHandle(newFileHandle);
      setFileHandle(newFileHandle);

      const currentData = dataRef.current ?? (await loadPlannerDataFromDb());
      const dataWithSync = withUpdatedSyncMetadata(currentData);
      await writePlannerFile(newFileHandle, dataWithSync);
      await replacePlannerDataInDb(dataWithSync);
      await markCleanAfterExport();
      dataRef.current = dataWithSync;
      setData(dataWithSync);
      setIsDirtySinceExport(false);
      setSyncStatus("connected");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectFileForSync = useCallback(async () => {
    setIsLoading(true);
    try {
      const selectedFileHandle = await openPlannerFile();
      const hasPermission = await verifyPermission(selectedFileHandle, "readwrite");
      if (!hasPermission) {
        setFileHandle(selectedFileHandle);
        setSyncStatus("permission_required");
        return;
      }

      const fileData = normalizeSkillMapData(await readPlannerFile(selectedFileHandle));
      await replacePlannerDataInDb(fileData);
      await markCleanAfterExport();
      await saveFileHandle(selectedFileHandle);
      dataRef.current = fileData;
      setData(fileData);
      setFileHandle(selectedFileHandle);
      setIsDirtySinceExport(false);
      setSyncStatus("connected");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectFile = useCallback(async () => {
    await clearSavedFileHandle();
    setFileHandle(null);
    setSyncStatus(isFileSystemAccessSupported() ? "not_connected" : "sync_unsupported");
  }, []);

  const grantWritePermission = useCallback(async () => {
    if (!fileHandle) {
      setSyncStatus(isFileSystemAccessSupported() ? "not_connected" : "sync_unsupported");
      return;
    }

    setIsLoading(true);
    try {
      const hasPermission = await verifyPermission(fileHandle, "readwrite");
      if (!hasPermission) {
        setSyncStatus("permission_required");
        return;
      }

      await saveFileHandle(fileHandle);
      const currentData = dataRef.current ?? (await loadPlannerDataFromDb());
      const dataWithSync = withUpdatedSyncMetadata(currentData);
      await writePlannerFile(fileHandle, dataWithSync);
      await replacePlannerDataInDb(dataWithSync);
      await markCleanAfterExport();
      dataRef.current = dataWithSync;
      setData(dataWithSync);
      setIsDirtySinceExport(false);
      setSyncStatus("connected");
    } finally {
      setIsLoading(false);
    }
  }, [fileHandle]);

  const saveData = useCallback(async () => {
    if (!dataRef.current) return;
    await persistData(dataRef.current);
  }, [persistData]);

  const exportJsonBackup = useCallback(() => {
    if (!dataRef.current) return;
    downloadJsonBackup(dataRef.current);
    void markCleanAfterExport();
    setIsDirtySinceExport(false);
  }, []);

  const importJsonBackup = useCallback(async (file: File) => {
    const imported = normalizeSkillMapData(await importJsonFile(file));
    await persistData(imported);
    await markCleanAfterExport();
    setIsDirtySinceExport(false);
  }, [persistData]);

  const createGoal = useCallback(async (goalData: Omit<Goal, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString();
    const newGoal: Goal = { ...goalData, id: createId("goal"), created_at: now, updated_at: now };
    await updateData((cur) => ({ ...cur, goals: [...cur.goals, newGoal] }));
  }, [updateData]);

  const updateGoal = useCallback(async (id: string, goalData: Partial<Omit<Goal, "id" | "created_at">>) => {
    const now = new Date().toISOString();
    await updateData((cur) => ({
      ...cur,
      goals: cur.goals.map((g) => g.id === id ? { ...g, ...goalData, id, updated_at: now } : g),
    }));
  }, [updateData]);

  const deleteGoal = useCallback(async (id: string) => {
    await updateData((cur) => ({
      ...cur,
      goals: cur.goals.filter((g) => g.id !== id),
      milestones: cur.milestones.filter((m) => m.goal_id !== id),
      practice_sessions: cur.practice_sessions.filter((s) => s.goal_id !== id),
      progress_notes: cur.progress_notes.filter((n) => n.goal_id !== id),
    }));
  }, [updateData]);

  const createMilestone = useCallback(async (milestoneData: Omit<Milestone, "id" | "created_at" | "updated_at" | "completed_at">) => {
    const now = new Date().toISOString();
    const newMilestone: Milestone = {
      ...milestoneData,
      id: createId("milestone"),
      completed_at: null,
      created_at: now,
      updated_at: now,
    };
    await updateData((cur) => ({ ...cur, milestones: [...cur.milestones, newMilestone] }));
  }, [updateData]);

  const updateMilestone = useCallback(async (id: string, milestoneData: Partial<Omit<Milestone, "id" | "created_at">>) => {
    const now = new Date().toISOString();
    await updateData((cur) => ({
      ...cur,
      milestones: cur.milestones.map((m) =>
        m.id === id ? { ...m, ...milestoneData, id, updated_at: now } : m
      ),
    }));
  }, [updateData]);

  const deleteMilestone = useCallback(async (id: string) => {
    await updateData((cur) => ({
      ...cur,
      milestones: cur.milestones.filter((m) => m.id !== id),
      practice_sessions: cur.practice_sessions.map((s) =>
        s.milestone_id === id ? { ...s, milestone_id: null } : s
      ),
      progress_notes: cur.progress_notes.map((n) =>
        n.milestone_id === id ? { ...n, milestone_id: null } : n
      ),
      topics: cur.topics.map((t) =>
        t.milestone_id === id ? { ...t, milestone_id: null } : t
      ),
    }));
  }, [updateData]);

  const toggleMilestoneComplete = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    await updateData((cur) => ({
      ...cur,
      milestones: cur.milestones.map((m) => {
        if (m.id !== id) return m;
        const completing = m.status !== "completed";
        return {
          ...m,
          status: completing ? "completed" : "in_progress",
          completed_at: completing ? now : null,
          updated_at: now,
        };
      }),
    }));
  }, [updateData]);

  const reorderMilestones = useCallback(async (goalId: string, orderedIds: string[]) => {
    const now = new Date().toISOString();
    await updateData((cur) => ({
      ...cur,
      milestones: cur.milestones.map((m) => {
        if (m.goal_id !== goalId) return m;
        const idx = orderedIds.indexOf(m.id);
        return idx === -1 ? m : { ...m, order: idx + 1, updated_at: now };
      }),
    }));
  }, [updateData]);

  const createPracticeSession = useCallback(async (sessionData: Omit<PracticeSession, "id" | "created_at" | "updated_at" | "completed_at">) => {
    const now = new Date().toISOString();
    const newSession: PracticeSession = {
      ...sessionData,
      id: createId("session"),
      completed_at: null,
      created_at: now,
      updated_at: now,
    };
    await updateData((cur) => ({ ...cur, practice_sessions: [...cur.practice_sessions, newSession] }));
  }, [updateData]);

  const updatePracticeSession = useCallback(async (id: string, sessionData: Partial<Omit<PracticeSession, "id" | "created_at">>) => {
    const now = new Date().toISOString();
    await updateData((cur) => ({
      ...cur,
      practice_sessions: cur.practice_sessions.map((s) =>
        s.id === id ? { ...s, ...sessionData, id, updated_at: now } : s
      ),
    }));
  }, [updateData]);

  const deletePracticeSession = useCallback(async (id: string) => {
    await updateData((cur) => ({
      ...cur,
      practice_sessions: cur.practice_sessions.filter((s) => s.id !== id),
      progress_notes: cur.progress_notes.map((n) =>
        n.session_id === id ? { ...n, session_id: null } : n
      ),
    }));
  }, [updateData]);

  const updateSessionStatus = useCallback(async (id: string, status: SessionStatus) => {
    const now = new Date().toISOString();
    await updateData((cur) => ({
      ...cur,
      practice_sessions: cur.practice_sessions.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          status,
          completed_at: status === "completed" ? now : null,
          updated_at: now,
        };
      }),
    }));
  }, [updateData]);

  const createProgressNote = useCallback(async (noteData: Omit<ProgressNote, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString();
    const newNote: ProgressNote = {
      ...noteData,
      id: createId("note"),
      created_at: now,
      updated_at: now,
    };
    await updateData((cur) => ({ ...cur, progress_notes: [...cur.progress_notes, newNote] }));
  }, [updateData]);

  const updateProgressNote = useCallback(async (id: string, noteData: Partial<Omit<ProgressNote, "id" | "created_at">>) => {
    const now = new Date().toISOString();
    await updateData((cur) => ({
      ...cur,
      progress_notes: cur.progress_notes.map((n) =>
        n.id === id ? { ...n, ...noteData, id, updated_at: now } : n
      ),
    }));
  }, [updateData]);

  const deleteProgressNote = useCallback(async (id: string) => {
    await updateData((cur) => ({
      ...cur,
      progress_notes: cur.progress_notes.filter((n) => n.id !== id),
    }));
  }, [updateData]);

  const createPlan = useCallback(async (plan: Omit<Plan, "id" | "sections" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString();
    const newPlan: Plan = { ...plan, id: createId("plan"), sections: [], created_at: now, updated_at: now };
    await updateData((cur) => ({ ...cur, plans: [...cur.plans, newPlan] }));
  }, [updateData]);

  const updatePlan = useCallback(async (id: string, plan: Partial<Plan>) => {
    const now = new Date().toISOString();
    await updateData((cur) => ({
      ...cur,
      plans: cur.plans.map((p) => p.id === id ? { ...p, ...plan, id, updated_at: now } : p),
    }));
  }, [updateData]);

  const deletePlan = useCallback(async (id: string) => {
    await updateData((cur) => ({
      ...cur,
      plans: cur.plans.filter((p) => p.id !== id),
    }));
  }, [updateData]);

  const createPlanSection = useCallback(async (
    planId: string,
    section: Omit<PlanSection, "id" | "plan_id" | "created_at" | "updated_at">
  ) => {
    const now = new Date().toISOString();
    const newSection: PlanSection = { ...section, id: createId("plan_section"), plan_id: planId, created_at: now, updated_at: now };
    await updateData((cur) => ({
      ...cur,
      plans: cur.plans.map((p) =>
        p.id === planId ? { ...p, sections: [...p.sections, newSection], updated_at: now } : p
      ),
    }));
  }, [updateData]);

  const updatePlanSection = useCallback(async (
    planId: string,
    sectionId: string,
    section: Partial<PlanSection>
  ) => {
    const now = new Date().toISOString();
    await updateData((cur) => ({
      ...cur,
      plans: cur.plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              sections: p.sections.map((s) =>
                s.id === sectionId ? { ...s, ...section, id: sectionId, plan_id: planId, updated_at: now } : s
              ),
              updated_at: now,
            }
          : p
      ),
    }));
  }, [updateData]);

  const deletePlanSection = useCallback(async (planId: string, sectionId: string) => {
    const now = new Date().toISOString();
    await updateData((cur) => ({
      ...cur,
      plans: cur.plans.map((p) =>
        p.id === planId
          ? { ...p, sections: p.sections.filter((s) => s.id !== sectionId), updated_at: now }
          : p
      ),
    }));
  }, [updateData]);

  const value = useMemo<PlannerContextValue>(
    () => ({
      data,
      fileHandle,
      syncStatus,
      saveStatus,
      isLoading,
      loadData,
      createFileForSync,
      connectFileForSync,
      disconnectFile,
      grantWritePermission,
      updateData,
      saveData,
      exportJsonBackup,
      importJsonBackup,
      createGoal,
      updateGoal,
      deleteGoal,
      createMilestone,
      updateMilestone,
      deleteMilestone,
      toggleMilestoneComplete,
      reorderMilestones,
      createPracticeSession,
      updatePracticeSession,
      deletePracticeSession,
      updateSessionStatus,
      createProgressNote,
      updateProgressNote,
      deleteProgressNote,
      createPlan,
      updatePlan,
      deletePlan,
      createPlanSection,
      updatePlanSection,
      deletePlanSection,
    }),
    [
      data, fileHandle, syncStatus, saveStatus, isLoading,
      loadData, createFileForSync, connectFileForSync, disconnectFile, grantWritePermission,
      updateData, saveData, exportJsonBackup, importJsonBackup,
      createGoal, updateGoal, deleteGoal,
      createMilestone, updateMilestone, deleteMilestone, toggleMilestoneComplete, reorderMilestones,
      createPracticeSession, updatePracticeSession, deletePracticeSession, updateSessionStatus,
      createProgressNote, updateProgressNote, deleteProgressNote,
      createPlan, updatePlan, deletePlan, createPlanSection, updatePlanSection, deletePlanSection,
    ]
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner(): PlannerContextValue {
  const context = useContext(PlannerContext);
  if (!context) throw new Error("usePlanner must be used within a PlannerProvider.");
  return context;
}
