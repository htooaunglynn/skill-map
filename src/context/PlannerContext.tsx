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
  clearTemporaryJsonDraft,
  getSavedFileHandle,
  getTemporaryJsonDraft,
  saveFileHandle,
  saveTemporaryJsonDraft,
} from "@/src/lib/storage/indexeddb";
import {
  createPlannerFile,
  openPlannerFile,
  readPlannerFile,
  verifyPermission,
  writePlannerFile,
  FileSystemAccessError,
} from "@/src/lib/storage/fileSystem";

export type PlannerConnectionStatus =
  | "no_file"
  | "connected"
  | "permission_required"
  | "fallback_mode";

type PlannerDataUpdate =
  | SkillMapData
  | ((currentData: SkillMapData | null) => SkillMapData);

interface PlannerContextValue {
  data: SkillMapData | null;
  fileHandle: FileSystemFileHandle | null;
  connectionStatus: PlannerConnectionStatus;
  isLoading: boolean;
  loadData: () => Promise<void>;
  createNewPlanner: () => Promise<void>;
  openExistingPlanner: () => Promise<void>;
  grantWritePermission: () => Promise<void>;
  updateData: (nextData: PlannerDataUpdate) => Promise<void>;
  saveData: () => Promise<void>;
  exportJsonBackup: () => void;
  // Goals
  createGoal: (data: Omit<Goal, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateGoal: (id: string, data: Partial<Omit<Goal, "id" | "created_at">>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  // Milestones
  createMilestone: (data: Omit<Milestone, "id" | "created_at" | "updated_at" | "completed_at">) => Promise<void>;
  updateMilestone: (id: string, data: Partial<Omit<Milestone, "id" | "created_at">>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  toggleMilestoneComplete: (id: string) => Promise<void>;
  reorderMilestones: (goalId: string, orderedIds: string[]) => Promise<void>;
  // Practice Sessions
  createPracticeSession: (data: Omit<PracticeSession, "id" | "created_at" | "updated_at" | "completed_at">) => Promise<void>;
  updatePracticeSession: (id: string, data: Partial<Omit<PracticeSession, "id" | "created_at">>) => Promise<void>;
  deletePracticeSession: (id: string) => Promise<void>;
  updateSessionStatus: (id: string, status: SessionStatus) => Promise<void>;
  // Progress Notes
  createProgressNote: (data: Omit<ProgressNote, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateProgressNote: (id: string, data: Partial<Omit<ProgressNote, "id" | "created_at">>) => Promise<void>;
  deleteProgressNote: (id: string) => Promise<void>;
  // Plans (legacy)
  createPlan: (plan: Omit<Plan, "id" | "sections" | "created_at" | "updated_at">) => Promise<void>;
  updatePlan: (id: string, plan: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  createPlanSection: (planId: string, section: Omit<PlanSection, "id" | "plan_id" | "created_at" | "updated_at">) => Promise<void>;
  updatePlanSection: (planId: string, sectionId: string, section: Partial<PlanSection>) => Promise<void>;
  deletePlanSection: (planId: string, sectionId: string) => Promise<void>;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

function isFileSystemAccessSupported(): boolean {
  return "showOpenFilePicker" in window && "showSaveFilePicker" in window;
}

function isSkillMapData(value: unknown): value is SkillMapData {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Partial<SkillMapData>;
  return (
    typeof data.version === "string" &&
    typeof data.app === "object" &&
    data.app !== null &&
    typeof data.sync === "object" &&
    data.sync !== null &&
    Array.isArray(data.courses) &&
    Array.isArray(data.modules) &&
    Array.isArray(data.topics) &&
    Array.isArray(data.notes) &&
    Array.isArray(data.bookmarks) &&
    Array.isArray(data.goals)
  );
}

function normalizeSkillMapData(data: SkillMapData): SkillMapData {
  return {
    ...data,
    topics: (data.topics ?? []).map((topic) => ({
      ...topic,
      milestone_id: topic.milestone_id ?? null,
    })),
    goals: Array.isArray(data.goals) ? data.goals : [],
    milestones: Array.isArray(data.milestones) ? data.milestones : [],
    practice_sessions: Array.isArray(data.practice_sessions) ? data.practice_sessions : [],
    progress_notes: Array.isArray(data.progress_notes) ? data.progress_notes : [],
    plans: Array.isArray(data.plans) ? data.plans : [],
  };
}

function validateSkillMapData(data: SkillMapData): void {
  if (!isSkillMapData(normalizeSkillMapData(data))) {
    throw new Error("Planner data is not a valid SkillMapData object.");
  }
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

function downloadJsonBackup(data: SkillMapData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "skillmap-backup.json";
  link.click();
  URL.revokeObjectURL(url);
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
  const [connectionStatus, setConnectionStatus] = useState<PlannerConnectionStatus>("no_file");
  const [isLoading, setIsLoading] = useState(false);
  const dataRef = useRef<SkillMapData | null>(null);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { fileHandleRef.current = fileHandle; }, [fileHandle]);

  const persistData = useCallback(async (nextData: SkillMapData) => {
    const normalizedData = normalizeSkillMapData(nextData);
    validateSkillMapData(normalizedData);
    dataRef.current = normalizedData;
    setData(normalizedData);
    await saveTemporaryJsonDraft(normalizedData);

    const currentFileHandle = fileHandleRef.current;
    if (!currentFileHandle) return;

    const hasPermission = await verifyPermission(currentFileHandle, "readwrite");
    if (!hasPermission) {
      setConnectionStatus("permission_required");
      return;
    }

    const dataWithSync = withUpdatedSyncMetadata(normalizedData);
    validateSkillMapData(dataWithSync);
    await writePlannerFile(currentFileHandle, dataWithSync);
    await clearTemporaryJsonDraft();
    dataRef.current = dataWithSync;
    setData(dataWithSync);
    setConnectionStatus("connected");
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!isFileSystemAccessSupported()) {
        const draft = await getTemporaryJsonDraft();
        const normalized = draft ? normalizeSkillMapData(draft) : draft;
        dataRef.current = normalized;
        setData(normalized);
        setFileHandle(null);
        setConnectionStatus("fallback_mode");
        return;
      }

      const savedFileHandle = await getSavedFileHandle();
      if (!savedFileHandle) {
        const draft = await getTemporaryJsonDraft();
        const normalized = draft ? normalizeSkillMapData(draft) : draft;
        dataRef.current = normalized;
        setData(normalized);
        setFileHandle(null);
        setConnectionStatus("no_file");
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
          const draft = await getTemporaryJsonDraft();
          const normalized = draft ? normalizeSkillMapData(draft) : draft;
          dataRef.current = normalized;
          setData(normalized);
          setFileHandle(null);
          setConnectionStatus(draft ? "fallback_mode" : "no_file");
          return;
        }

        throw error;
      }

      if (!hasPermission) {
        setFileHandle(savedFileHandle);
        setConnectionStatus("permission_required");
        return;
      }

      const plannerData = await readPlannerFile(savedFileHandle);
      const normalizedData = normalizeSkillMapData(plannerData);
      validateSkillMapData(normalizedData);
      dataRef.current = normalizedData;
      setData(normalizedData);
      setFileHandle(savedFileHandle);
      setConnectionStatus("connected");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewPlanner = useCallback(async () => {
    setIsLoading(true);
    try {
      const newFileHandle = await createPlannerFile();
      const plannerData = await readPlannerFile(newFileHandle);
      const normalizedData = normalizeSkillMapData(plannerData);
      validateSkillMapData(normalizedData);
      await saveFileHandle(newFileHandle);
      await clearTemporaryJsonDraft();
      dataRef.current = normalizedData;
      setData(normalizedData);
      setFileHandle(newFileHandle);
      setConnectionStatus("connected");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openExistingPlanner = useCallback(async () => {
    setIsLoading(true);
    try {
      const selectedFileHandle = await openPlannerFile();
      const hasPermission = await verifyPermission(selectedFileHandle, "readwrite");
      if (!hasPermission) {
        setFileHandle(selectedFileHandle);
        setConnectionStatus("permission_required");
        return;
      }
      const plannerData = await readPlannerFile(selectedFileHandle);
      const normalizedData = normalizeSkillMapData(plannerData);
      validateSkillMapData(normalizedData);
      await saveFileHandle(selectedFileHandle);
      await clearTemporaryJsonDraft();
      dataRef.current = normalizedData;
      setData(normalizedData);
      setFileHandle(selectedFileHandle);
      setConnectionStatus("connected");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const grantWritePermission = useCallback(async () => {
    if (!fileHandle) {
      setConnectionStatus("no_file");
      return;
    }
    setIsLoading(true);
    try {
      const hasPermission = await verifyPermission(fileHandle, "readwrite");
      if (!hasPermission) {
        setConnectionStatus("permission_required");
        return;
      }
      const plannerData = await readPlannerFile(fileHandle);
      const normalizedData = normalizeSkillMapData(plannerData);
      validateSkillMapData(normalizedData);
      await saveFileHandle(fileHandle);
      dataRef.current = normalizedData;
      setData(normalizedData);
      setConnectionStatus("connected");
    } finally {
      setIsLoading(false);
    }
  }, [fileHandle]);

  const updateData = useCallback(async (nextData: PlannerDataUpdate) => {
    const resolved = typeof nextData === "function" ? nextData(dataRef.current) : nextData;
    await persistData(resolved);
  }, [persistData]);

  // ── Goals ──────────────────────────────────────────────────────────────────

  const createGoal = useCallback(async (goalData: Omit<Goal, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString();
    const newGoal: Goal = { ...goalData, id: createId("goal"), created_at: now, updated_at: now };
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return { ...cur, goals: [...cur.goals, newGoal] };
    });
  }, [updateData]);

  const updateGoal = useCallback(async (id: string, goalData: Partial<Omit<Goal, "id" | "created_at">>) => {
    const now = new Date().toISOString();
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
        ...cur,
        goals: cur.goals.map((g) => g.id === id ? { ...g, ...goalData, id, updated_at: now } : g),
      };
    });
  }, [updateData]);

  const deleteGoal = useCallback(async (id: string) => {
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
        ...cur,
        goals: cur.goals.filter((g) => g.id !== id),
        milestones: cur.milestones.filter((m) => m.goal_id !== id),
        practice_sessions: cur.practice_sessions.filter((s) => s.goal_id !== id),
        progress_notes: cur.progress_notes.filter((n) => n.goal_id !== id),
      };
    });
  }, [updateData]);

  // ── Milestones ─────────────────────────────────────────────────────────────

  const createMilestone = useCallback(async (milestoneData: Omit<Milestone, "id" | "created_at" | "updated_at" | "completed_at">) => {
    const now = new Date().toISOString();
    const newMilestone: Milestone = {
      ...milestoneData,
      id: createId("milestone"),
      completed_at: null,
      created_at: now,
      updated_at: now,
    };
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return { ...cur, milestones: [...cur.milestones, newMilestone] };
    });
  }, [updateData]);

  const updateMilestone = useCallback(async (id: string, milestoneData: Partial<Omit<Milestone, "id" | "created_at">>) => {
    const now = new Date().toISOString();
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
        ...cur,
        milestones: cur.milestones.map((m) =>
          m.id === id ? { ...m, ...milestoneData, id, updated_at: now } : m
        ),
      };
    });
  }, [updateData]);

  const deleteMilestone = useCallback(async (id: string) => {
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
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
      };
    });
  }, [updateData]);

  const toggleMilestoneComplete = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
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
      };
    });
  }, [updateData]);

  const reorderMilestones = useCallback(async (goalId: string, orderedIds: string[]) => {
    const now = new Date().toISOString();
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
        ...cur,
        milestones: cur.milestones.map((m) => {
          if (m.goal_id !== goalId) return m;
          const idx = orderedIds.indexOf(m.id);
          return idx === -1 ? m : { ...m, order: idx + 1, updated_at: now };
        }),
      };
    });
  }, [updateData]);

  // ── Practice Sessions ──────────────────────────────────────────────────────

  const createPracticeSession = useCallback(async (sessionData: Omit<PracticeSession, "id" | "created_at" | "updated_at" | "completed_at">) => {
    const now = new Date().toISOString();
    const newSession: PracticeSession = {
      ...sessionData,
      id: createId("session"),
      completed_at: null,
      created_at: now,
      updated_at: now,
    };
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return { ...cur, practice_sessions: [...cur.practice_sessions, newSession] };
    });
  }, [updateData]);

  const updatePracticeSession = useCallback(async (id: string, sessionData: Partial<Omit<PracticeSession, "id" | "created_at">>) => {
    const now = new Date().toISOString();
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
        ...cur,
        practice_sessions: cur.practice_sessions.map((s) =>
          s.id === id ? { ...s, ...sessionData, id, updated_at: now } : s
        ),
      };
    });
  }, [updateData]);

  const deletePracticeSession = useCallback(async (id: string) => {
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
        ...cur,
        practice_sessions: cur.practice_sessions.filter((s) => s.id !== id),
        progress_notes: cur.progress_notes.map((n) =>
          n.session_id === id ? { ...n, session_id: null } : n
        ),
      };
    });
  }, [updateData]);

  const updateSessionStatus = useCallback(async (id: string, status: SessionStatus) => {
    const now = new Date().toISOString();
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
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
      };
    });
  }, [updateData]);

  // ── Progress Notes ─────────────────────────────────────────────────────────

  const createProgressNote = useCallback(async (noteData: Omit<ProgressNote, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString();
    const newNote: ProgressNote = {
      ...noteData,
      id: createId("note"),
      created_at: now,
      updated_at: now,
    };
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return { ...cur, progress_notes: [...cur.progress_notes, newNote] };
    });
  }, [updateData]);

  const updateProgressNote = useCallback(async (id: string, noteData: Partial<Omit<ProgressNote, "id" | "created_at">>) => {
    const now = new Date().toISOString();
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
        ...cur,
        progress_notes: cur.progress_notes.map((n) =>
          n.id === id ? { ...n, ...noteData, id, updated_at: now } : n
        ),
      };
    });
  }, [updateData]);

  const deleteProgressNote = useCallback(async (id: string) => {
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return { ...cur, progress_notes: cur.progress_notes.filter((n) => n.id !== id) };
    });
  }, [updateData]);

  // ── Plans (legacy) ─────────────────────────────────────────────────────────

  const createPlan = useCallback(async (plan: Omit<Plan, "id" | "sections" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString();
    const newPlan: Plan = { ...plan, id: createId("plan"), sections: [], created_at: now, updated_at: now };
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return { ...cur, plans: [...cur.plans, newPlan] };
    });
  }, [updateData]);

  const updatePlan = useCallback(async (id: string, plan: Partial<Plan>) => {
    const now = new Date().toISOString();
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
        ...cur,
        plans: cur.plans.map((p) => p.id === id ? { ...p, ...plan, id, updated_at: now } : p),
      };
    });
  }, [updateData]);

  const deletePlan = useCallback(async (id: string) => {
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return { ...cur, plans: cur.plans.filter((p) => p.id !== id) };
    });
  }, [updateData]);

  const createPlanSection = useCallback(async (
    planId: string,
    section: Omit<PlanSection, "id" | "plan_id" | "created_at" | "updated_at">
  ) => {
    const now = new Date().toISOString();
    const newSection: PlanSection = { ...section, id: createId("plan_section"), plan_id: planId, created_at: now, updated_at: now };
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
        ...cur,
        plans: cur.plans.map((p) =>
          p.id === planId ? { ...p, sections: [...p.sections, newSection], updated_at: now } : p
        ),
      };
    });
  }, [updateData]);

  const updatePlanSection = useCallback(async (
    planId: string,
    sectionId: string,
    section: Partial<PlanSection>
  ) => {
    const now = new Date().toISOString();
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
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
      };
    });
  }, [updateData]);

  const deletePlanSection = useCallback(async (planId: string, sectionId: string) => {
    const now = new Date().toISOString();
    await updateData((cur) => {
      if (!cur) throw new Error("Open or create a planner file first.");
      return {
        ...cur,
        plans: cur.plans.map((p) =>
          p.id === planId
            ? { ...p, sections: p.sections.filter((s) => s.id !== sectionId), updated_at: now }
            : p
        ),
      };
    });
  }, [updateData]);

  // ── Save / Export ──────────────────────────────────────────────────────────

  const saveData = useCallback(async () => {
    if (!data) return;
    validateSkillMapData(data);
    if (!fileHandle) {
      await saveTemporaryJsonDraft(data);
      setConnectionStatus("fallback_mode");
      return;
    }
    const hasPermission = await verifyPermission(fileHandle, "readwrite");
    if (!hasPermission) {
      setConnectionStatus("permission_required");
      return;
    }
    const dataWithSync = withUpdatedSyncMetadata(data);
    validateSkillMapData(dataWithSync);
    await writePlannerFile(fileHandle, dataWithSync);
    await clearTemporaryJsonDraft();
    dataRef.current = dataWithSync;
    setData(dataWithSync);
    setConnectionStatus("connected");
  }, [data, fileHandle]);

  const exportJsonBackup = useCallback(() => {
    if (!data) return;
    validateSkillMapData(data);
    downloadJsonBackup(data);
  }, [data]);

  const value = useMemo<PlannerContextValue>(
    () => ({
      data,
      fileHandle,
      connectionStatus,
      isLoading,
      loadData,
      createNewPlanner,
      openExistingPlanner,
      grantWritePermission,
      updateData,
      saveData,
      exportJsonBackup,
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
      data, fileHandle, connectionStatus, isLoading,
      loadData, createNewPlanner, openExistingPlanner, grantWritePermission,
      updateData, saveData, exportJsonBackup,
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
