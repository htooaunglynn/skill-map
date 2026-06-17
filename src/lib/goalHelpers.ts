import type { Goal, Milestone, PracticeSession, ProgressNote } from "@/src/types/schema";

// ── Milestone helpers ─────────────────────────────────────────────────────────

export function getMilestonesForGoal(milestones: Milestone[], goalId: string): Milestone[] {
  return milestones.filter((m) => m.goal_id === goalId).sort((a, b) => a.order - b.order);
}

export function getGoalProgress(milestones: Milestone[], goalId: string): number {
  const all = getMilestonesForGoal(milestones, goalId);
  if (all.length === 0) return 0;
  const done = all.filter((m) => m.status === "completed").length;
  return Math.round((done / all.length) * 100);
}

export function getOverdueMilestones(milestones: Milestone[]): Milestone[] {
  const now = new Date();
  return milestones.filter((m) => {
    if (m.status === "completed") return false;
    if (!m.due_date) return false;
    return new Date(m.due_date) < now;
  });
}

// ── Session helpers ───────────────────────────────────────────────────────────

export function getSessionsForGoal(
  sessions: PracticeSession[],
  goalId: string,
  milestoneId?: string | null,
): PracticeSession[] {
  return sessions.filter((s) => {
    if (s.goal_id !== goalId) return false;
    if (milestoneId !== undefined) return s.milestone_id === milestoneId;
    return true;
  });
}

export function getUpcomingSessions(sessions: PracticeSession[]): PracticeSession[] {
  const now = new Date();
  return sessions
    .filter((s) => s.status === "scheduled" && new Date(s.scheduled_at) > now)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
}

export function getMissedSessions(sessions: PracticeSession[]): PracticeSession[] {
  const now = new Date();
  return sessions.filter((s) => s.status === "scheduled" && new Date(s.scheduled_at) < now);
}

export function getTotalPracticeMinutes(sessions: PracticeSession[], goalId: string): number {
  return sessions
    .filter((s) => s.goal_id === goalId && s.status === "completed")
    .reduce((sum, s) => sum + s.duration_minutes, 0);
}

// ── Progress note helpers ─────────────────────────────────────────────────────

export function getNotesForGoal(notes: ProgressNote[], goalId: string): ProgressNote[] {
  return notes
    .filter((n) => n.goal_id === goalId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getRecentNotes(notes: ProgressNote[], limit = 5): ProgressNote[] {
  return [...notes]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

// ── Search helpers ────────────────────────────────────────────────────────────

export function searchGoals(goals: Goal[], query: string): Goal[] {
  const q = query.toLowerCase().trim();
  if (!q) return goals;
  return goals.filter(
    (g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q),
  );
}

export function searchSessions(sessions: PracticeSession[], query: string): PracticeSession[] {
  const q = query.toLowerCase().trim();
  if (!q) return sessions;
  return sessions.filter(
    (s) => s.title.toLowerCase().includes(q) || s.notes.toLowerCase().includes(q),
  );
}

export function searchNotes(notes: ProgressNote[], query: string): ProgressNote[] {
  const q = query.toLowerCase().trim();
  if (!q) return notes;
  return notes.filter(
    (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
  );
}
