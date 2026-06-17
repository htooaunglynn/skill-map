export interface SyncDevice {
  id: string;
  name: string;
  last_opened_at: string;
}

export interface SyncMetadata {
  last_saved_at: string;
  last_opened_at: string;
  last_device_id: string;
  last_device_name: string;
  devices: SyncDevice[];
}

export interface SkillMapAppInfo {
  name: string;
  version: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  goal: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  module_id: string;
  milestone_id?: string | null;
  title: string;
  description: string;
  completed: boolean;
  completed_at: string | null;
  prerequisites: string[];
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  topic_id: string;
  content: string;
  format: string;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  topic_id: string;
  title: string;
  url: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// ── Goal ─────────────────────────────────────────────────────────────────────

export type GoalStatus = "not_started" | "in_progress" | "completed" | "archived";

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

// ── Milestone ─────────────────────────────────────────────────────────────────

export type MilestoneStatus = "not_started" | "in_progress" | "completed";

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  order: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Practice Session ──────────────────────────────────────────────────────────

export type SessionStatus = "scheduled" | "completed" | "cancelled" | "missed";

export interface PracticeSession {
  id: string;
  goal_id: string;
  milestone_id: string | null;
  title: string;
  notes: string;
  status: SessionStatus;
  scheduled_at: string;
  duration_minutes: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Progress Note ─────────────────────────────────────────────────────────────

export interface ProgressNote {
  id: string;
  goal_id: string;
  milestone_id: string | null;
  session_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ── Plan (kept for backward compat) ──────────────────────────────────────────

export interface PlanSection {
  id: string;
  plan_id: string;
  title: string;
  notes: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  status: "draft" | "active" | "completed" | "archived";
  start_date: string | null;
  end_date: string | null;
  course_ids: string[];
  sections: PlanSection[];
  created_at: string;
  updated_at: string;
}

// ── Root data shape ───────────────────────────────────────────────────────────

export interface SkillMapData {
  version: string;
  app: SkillMapAppInfo;
  sync: SyncMetadata;
  courses: Course[];
  modules: Module[];
  topics: Topic[];
  notes: Note[];
  bookmarks: Bookmark[];
  goals: Goal[];
  milestones: Milestone[];
  practice_sessions: PracticeSession[];
  progress_notes: ProgressNote[];
  plans: Plan[];
}
