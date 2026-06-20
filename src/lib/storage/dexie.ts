"use client";

import Dexie, { type EntityTable } from "dexie";
import type {
  Bookmark,
  Course,
  Goal,
  Milestone,
  Module,
  Note,
  Plan,
  PlanSection,
  PracticeSession,
  ProgressNote,
  SkillMapData,
  Topic,
} from "@/src/types/schema";
import { createDefaultSkillMapData, parseSkillMapData } from "@/src/lib/skillMapData";

interface PlannerSettings {
  id: "singleton";
  version: string;
  app: SkillMapData["app"];
  sync: SkillMapData["sync"];
  dirty_since_export: boolean;
}

type StoredPlan = Omit<Plan, "sections">;

class SkillMapDexie extends Dexie {
  settings!: EntityTable<PlannerSettings, "id">;
  goals!: EntityTable<Goal, "id">;
  milestones!: EntityTable<Milestone, "id">;
  practice_sessions!: EntityTable<PracticeSession, "id">;
  progress_notes!: EntityTable<ProgressNote, "id">;
  plans!: EntityTable<StoredPlan, "id">;
  plan_sections!: EntityTable<PlanSection, "id">;
  courses!: EntityTable<Course, "id">;
  modules!: EntityTable<Module, "id">;
  topics!: EntityTable<Topic, "id">;
  notes!: EntityTable<Note, "id">;
  bookmarks!: EntityTable<Bookmark, "id">;

  constructor() {
    super("skillmap-db");

    this.version(1).stores({
      settings: "id",
      goals: "id, status, created_at",
      milestones: "id, goal_id, status, order",
      practice_sessions: "id, goal_id, milestone_id, status",
      progress_notes: "id, goal_id, milestone_id, session_id",
      plans: "id, created_at",
      plan_sections: "id, plan_id",
      courses: "id",
      modules: "id, course_id",
      topics: "id, module_id, milestone_id",
      notes: "id, topic_id",
      bookmarks: "id, topic_id",
    });
  }
}

export const db = new SkillMapDexie();

function defaultSettings(): PlannerSettings {
  const data = createDefaultSkillMapData();

  return {
    id: "singleton",
    version: data.version,
    app: data.app,
    sync: data.sync,
    dirty_since_export: false,
  };
}

interface BulkAddTable<T> {
  bulkAdd(rows: T[]): Promise<unknown>;
}

async function bulkAddIfAny<T>(
  table: BulkAddTable<T>,
  rows: T[],
): Promise<void> {
  if (rows.length > 0) {
    await table.bulkAdd(rows);
  }
}

export async function loadPlannerDataFromDb(): Promise<SkillMapData> {
  const [
    settings,
    goals,
    milestones,
    practice_sessions,
    progress_notes,
    plans,
    plan_sections,
    courses,
    modules,
    topics,
    notes,
    bookmarks,
  ] = await Promise.all([
    db.settings.get("singleton"),
    db.goals.toArray(),
    db.milestones.toArray(),
    db.practice_sessions.toArray(),
    db.progress_notes.toArray(),
    db.plans.toArray(),
    db.plan_sections.toArray(),
    db.courses.toArray(),
    db.modules.toArray(),
    db.topics.toArray(),
    db.notes.toArray(),
    db.bookmarks.toArray(),
  ]);

  const resolvedSettings = settings ?? defaultSettings();

  if (!settings) {
    await db.settings.put(resolvedSettings);
  }

  const plansWithSections: Plan[] = plans.map((plan) => ({
    ...plan,
    sections: plan_sections.filter((section) => section.plan_id === plan.id),
  }));

  return parseSkillMapData({
    version: resolvedSettings.version,
    app: resolvedSettings.app,
    sync: resolvedSettings.sync,
    courses,
    modules,
    topics,
    notes,
    bookmarks,
    goals,
    milestones,
    practice_sessions,
    progress_notes,
    plans: plansWithSections,
  });
}

export async function replacePlannerDataInDb(data: SkillMapData): Promise<void> {
  const parsed = parseSkillMapData(data);
  const flatSections = parsed.plans.flatMap((plan) => plan.sections);
  const storedPlans = parsed.plans.map((plan) => ({
    id: plan.id,
    title: plan.title,
    description: plan.description,
    status: plan.status,
    start_date: plan.start_date,
    end_date: plan.end_date,
    course_ids: plan.course_ids,
    created_at: plan.created_at,
    updated_at: plan.updated_at,
  }));

  await db.transaction(
    "rw",
    [
      db.settings,
      db.goals,
      db.milestones,
      db.practice_sessions,
      db.progress_notes,
      db.plans,
      db.plan_sections,
      db.courses,
      db.modules,
      db.topics,
      db.notes,
      db.bookmarks,
    ],
    async () => {
      const existingSettings = await db.settings.get("singleton");

      await Promise.all([
        db.goals.clear(),
        db.milestones.clear(),
        db.practice_sessions.clear(),
        db.progress_notes.clear(),
        db.plans.clear(),
        db.plan_sections.clear(),
        db.courses.clear(),
        db.modules.clear(),
        db.topics.clear(),
        db.notes.clear(),
        db.bookmarks.clear(),
      ]);

      await db.settings.put({
        id: "singleton",
        version: parsed.version,
        app: parsed.app,
        sync: parsed.sync,
        dirty_since_export: existingSettings?.dirty_since_export ?? false,
      });
      await bulkAddIfAny(db.goals, parsed.goals);
      await bulkAddIfAny(db.milestones, parsed.milestones);
      await bulkAddIfAny(db.practice_sessions, parsed.practice_sessions);
      await bulkAddIfAny(db.progress_notes, parsed.progress_notes);
      await bulkAddIfAny(db.plans, storedPlans);
      await bulkAddIfAny(db.plan_sections, flatSections);
      await bulkAddIfAny(db.courses, parsed.courses);
      await bulkAddIfAny(db.modules, parsed.modules);
      await bulkAddIfAny(db.topics, parsed.topics);
      await bulkAddIfAny(db.notes, parsed.notes);
      await bulkAddIfAny(db.bookmarks, parsed.bookmarks);
    },
  );
}

export async function updateSyncMetadataInDb(sync: SkillMapData["sync"]): Promise<void> {
  const existing = await db.settings.get("singleton");

  await db.settings.put({
    ...(existing ?? defaultSettings()),
    sync,
  });
}

export async function getDirtySinceExport(): Promise<boolean> {
  const existing = await db.settings.get("singleton");
  return existing?.dirty_since_export ?? false;
}

export async function markDirtySinceExport(): Promise<void> {
  const existing = await db.settings.get("singleton");

  await db.settings.put({
    ...(existing ?? defaultSettings()),
    dirty_since_export: true,
  });
}

export async function markCleanAfterExport(): Promise<void> {
  const existing = await db.settings.get("singleton");

  await db.settings.put({
    ...(existing ?? defaultSettings()),
    dirty_since_export: false,
  });
}

export async function clearPlannerDataInDb(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.settings,
      db.goals,
      db.milestones,
      db.practice_sessions,
      db.progress_notes,
      db.plans,
      db.plan_sections,
      db.courses,
      db.modules,
      db.topics,
      db.notes,
      db.bookmarks,
    ],
    async () => {
      await Promise.all([
        db.settings.clear(),
        db.goals.clear(),
        db.milestones.clear(),
        db.practice_sessions.clear(),
        db.progress_notes.clear(),
        db.plans.clear(),
        db.plan_sections.clear(),
        db.courses.clear(),
        db.modules.clear(),
        db.topics.clear(),
        db.notes.clear(),
        db.bookmarks.clear(),
      ]);
    },
  );
}
