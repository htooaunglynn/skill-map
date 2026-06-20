"use client";

import { z } from "zod";
import type { SkillMapData } from "@/src/types/schema";

const nullableStringSchema = z.string().nullable();

const syncDeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  last_opened_at: z.string(),
});

const syncMetadataSchema = z.object({
  last_saved_at: z.string(),
  last_opened_at: z.string(),
  last_device_id: z.string(),
  last_device_name: z.string(),
  devices: z.array(syncDeviceSchema),
});

const appInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
});

const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  goal: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const moduleSchema = z.object({
  id: z.string(),
  course_id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

const topicSchema = z.object({
  id: z.string(),
  module_id: z.string(),
  milestone_id: nullableStringSchema.optional().default(null),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  completed_at: nullableStringSchema,
  prerequisites: z.array(z.string()),
  order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

const noteSchema = z.object({
  id: z.string(),
  topic_id: z.string(),
  content: z.string(),
  format: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const bookmarkSchema = z.object({
  id: z.string(),
  topic_id: z.string(),
  title: z.string(),
  url: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const goalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["not_started", "in_progress", "completed", "archived"]),
  target_date: nullableStringSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

const milestoneSchema = z.object({
  id: z.string(),
  goal_id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  order: z.number(),
  due_date: nullableStringSchema,
  completed_at: nullableStringSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

const practiceSessionSchema = z.object({
  id: z.string(),
  goal_id: z.string(),
  milestone_id: nullableStringSchema,
  title: z.string(),
  notes: z.string(),
  status: z.enum(["scheduled", "completed", "cancelled", "missed"]),
  scheduled_at: z.string(),
  duration_minutes: z.number(),
  completed_at: nullableStringSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

const progressNoteSchema = z.object({
  id: z.string(),
  goal_id: z.string(),
  milestone_id: nullableStringSchema,
  session_id: nullableStringSchema,
  title: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const planSectionSchema = z.object({
  id: z.string(),
  plan_id: z.string(),
  title: z.string(),
  notes: z.string(),
  order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

const planSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["draft", "active", "completed", "archived"]),
  start_date: nullableStringSchema,
  end_date: nullableStringSchema,
  course_ids: z.array(z.string()),
  sections: z.array(planSectionSchema).default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

const skillMapDataSchema = z.object({
  version: z.string(),
  app: appInfoSchema,
  sync: syncMetadataSchema,
  courses: z.array(courseSchema).default([]),
  modules: z.array(moduleSchema).default([]),
  topics: z.array(topicSchema).default([]),
  notes: z.array(noteSchema).default([]),
  bookmarks: z.array(bookmarkSchema).default([]),
  goals: z.array(goalSchema).default([]),
  milestones: z.array(milestoneSchema).default([]),
  practice_sessions: z.array(practiceSessionSchema).default([]),
  progress_notes: z.array(progressNoteSchema).default([]),
  plans: z.array(planSchema).default([]),
});

export function createDefaultSkillMapData(): SkillMapData {
  const now = new Date().toISOString();

  return {
    version: "1",
    app: {
      name: "SkillMap",
      version: "0.1.0",
    },
    sync: {
      last_saved_at: now,
      last_opened_at: now,
      last_device_id: "",
      last_device_name: "",
      devices: [],
    },
    courses: [],
    modules: [],
    topics: [],
    notes: [],
    bookmarks: [],
    goals: [],
    milestones: [],
    practice_sessions: [],
    progress_notes: [],
    plans: [],
  };
}

export function parseSkillMapData(value: unknown): SkillMapData {
  return skillMapDataSchema.parse(value) as SkillMapData;
}

export function validateSkillMapData(value: unknown): asserts value is SkillMapData {
  parseSkillMapData(value);
}

