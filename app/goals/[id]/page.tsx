"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedProgress } from "@/src/components/ui/AnimatedProgress";
import { GoalFormDialog } from "@/src/components/goals/GoalFormDialog";
import { MilestoneFormDialog } from "@/src/components/milestones/MilestoneFormDialog";
import { MilestoneItem } from "@/src/components/milestones/MilestoneItem";
import { SessionCard } from "@/src/components/sessions/SessionCard";
import { SessionFormDialog } from "@/src/components/sessions/SessionFormDialog";
import { ProgressNoteCard } from "@/src/components/progress-notes/ProgressNoteCard";
import { ProgressNoteFormDialog } from "@/src/components/progress-notes/ProgressNoteFormDialog";
import { usePlanner } from "@/src/context/PlannerContext";
import { usePageAnimation } from "@/src/hooks/usePageAnimation";
import { useListAnimation } from "@/src/hooks/useListAnimation";
import {
  getMilestonesForGoal,
  getGoalProgress,
  getNotesForGoal,
  getSessionsForGoal,
  getTotalPracticeMinutes,
} from "@/src/lib/goalHelpers";
import type { Milestone, PracticeSession, ProgressNote } from "@/src/types/schema";

const STATUS_STYLES: Record<string, string> = {
  not_started: "border-[var(--sm-muted)] text-[var(--sm-muted)]",
  in_progress: "border-[var(--sm-accent)] text-[var(--sm-accent)]",
  completed: "border-[var(--sm-green)] text-[var(--sm-green)]",
  archived: "border-[var(--sm-muted)] text-[var(--sm-muted)] opacity-60",
};

export default function GoalDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const {
    data,
    loadData,
    reorderMilestones,
    deletePracticeSession,
    updateSessionStatus,
    deleteProgressNote,
  } = usePlanner();
  const pageRef = usePageAnimation();
  const [isGoalEditOpen, setIsGoalEditOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<PracticeSession | null>(null);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ProgressNote | null>(null);
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);

  useEffect(() => { void loadData(); }, [loadData]);

  const goal = data?.goals.find((g) => g.id === id) ?? null;
  const allMilestones = useMemo(() => data?.milestones ?? [], [data?.milestones]);
  const milestones = useMemo(() => getMilestonesForGoal(allMilestones, id), [allMilestones, id]);
  const milestoneById = useMemo(() => new Map(allMilestones.map((m) => [m.id, m])), [allMilestones]);

  const sessions = useMemo(
    () => getSessionsForGoal(data?.practice_sessions ?? [], id),
    [data?.practice_sessions, id],
  );
  const notes = useMemo(
    () => getNotesForGoal(data?.progress_notes ?? [], id),
    [data?.progress_notes, id],
  );
  const sessionById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

  const progress = getGoalProgress(allMilestones, id);
  const totalMinutes = getTotalPracticeMinutes(data?.practice_sessions ?? [], id);

  const lanesRef = useListAnimation([milestones.length, sessions.length, notes.length]);

  function moveMilestone(index: number, direction: -1 | 1) {
    const next = [...milestones];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    void reorderMilestones(id, next.map((m) => m.id));
  }

  if (!goal) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--sm-bg)", color: "var(--sm-text)" }}>
        <div ref={pageRef} className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <Link href="/goals" className="inline-flex h-9 w-fit items-center gap-1.5 px-3 font-mono text-xs font-semibold uppercase tracking-widest hover:opacity-70" style={{ color: "var(--sm-muted)" }}>
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Goals
          </Link>
          <div className="rounded-xl border p-8 text-center" style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}>
            <p className="font-semibold">Goal not found</p>
            <p className="mt-1 text-sm" style={{ color: "var(--sm-muted)" }}>Open a planner file or choose another goal.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--sm-bg)", color: "var(--sm-text)" }}>
      <div ref={pageRef} className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link href="/goals" className="inline-flex h-9 w-fit items-center gap-1.5 px-3 font-mono text-xs font-semibold uppercase tracking-widest hover:opacity-70" style={{ color: "var(--sm-muted)" }}>
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Goals
        </Link>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left column */}
          <aside className="flex flex-col gap-4 rounded-xl border p-5 lg:sticky lg:top-6 lg:self-start" style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}>
            <span className={`inline-block w-fit rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLES[goal.status]}`}>
              {goal.status.replaceAll("_", " ")}
            </span>
            <h1 className="text-2xl font-bold" style={{ color: "var(--sm-text)" }}>{goal.title}</h1>
            {goal.description ? (
              <p className="text-sm leading-relaxed" style={{ color: "var(--sm-muted)" }}>{goal.description}</p>
            ) : null}

            <AnimatedProgress value={progress} showLabel className="w-full" />

            <dl className="flex flex-col gap-2 font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
              <div className="flex items-center justify-between">
                <dt>Target date</dt>
                <dd>{goal.target_date ? new Date(goal.target_date).toLocaleDateString() : "—"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1"><Clock className="size-3" aria-hidden="true" />Practice time</dt>
                <dd>{Math.round((totalMinutes / 60) * 10) / 10} h</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Milestones</dt>
                <dd>{milestones.length}</dd>
              </div>
            </dl>

            <Button type="button" variant="outline" size="sm" onClick={() => setIsGoalEditOpen(true)}>
              <Pencil aria-hidden="true" />
              Edit Goal
            </Button>
          </aside>

          <div ref={lanesRef} className="flex flex-col gap-5">
            <section className="flex flex-col gap-4 border-l-2 pl-4" style={{ borderColor: "var(--sm-accent2)" }}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--sm-accent2)" }}>Milestones</p>
                <Button type="button" size="sm" onClick={() => { setEditingMilestone(null); setIsMilestoneFormOpen(true); }} style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}>
                  <Plus aria-hidden="true" />
                  Add Milestone
                </Button>
              </div>
              {milestones.length === 0 ? (
                <div className="rounded-lg border p-6 text-sm" style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)", color: "var(--sm-muted)" }}>
                  Nothing here yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {milestones.map((milestone, index) => (
                    <MilestoneItem
                      key={milestone.id}
                      milestone={milestone}
                      entityLabel={`M-${String(index + 1).padStart(2, "0")}`}
                      onEdit={() => { setEditingMilestone(milestone); setIsMilestoneFormOpen(true); }}
                      onMoveUp={() => moveMilestone(index, -1)}
                      onMoveDown={() => moveMilestone(index, 1)}
                      canMoveUp={index > 0}
                      canMoveDown={index < milestones.length - 1}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-4 border-l-2 pl-4" style={{ borderColor: "var(--sm-accent)" }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--sm-accent)" }}>Sessions</p>
                  <Button type="button" size="sm" onClick={() => { setEditingSession(null); setIsSessionFormOpen(true); }} style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}>
                    <Plus aria-hidden="true" />
                    New Session
                  </Button>
                </div>
                {sessions.length === 0 ? (
                  <div className="rounded-lg border p-6 text-sm" style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)", color: "var(--sm-muted)" }}>
                    Nothing here yet.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    {sessions.map((s, index) => (
                      <SessionCard
                        key={s.id}
                        session={s}
                        entityLabel={`S-${String(index + 1).padStart(2, "0")}`}
                        goal={goal}
                        milestone={s.milestone_id ? milestoneById.get(s.milestone_id) : undefined}
                        onEdit={() => { setEditingSession(s); setIsSessionFormOpen(true); }}
                        onDelete={() => deletePracticeSession(s.id)}
                        onStatusChange={(status) => void updateSessionStatus(s.id, status)}
                      />
                    ))}
                  </div>
                )}
              </section>

            <section className="flex flex-col gap-4 border-l-2 pl-4" style={{ borderColor: "var(--sm-rose)" }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--sm-rose)" }}>Progress Notes</p>
                  <Button type="button" size="sm" onClick={() => { setEditingNote(null); setIsNoteFormOpen(true); }} style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}>
                    <Plus aria-hidden="true" />
                    New Note
                  </Button>
                </div>
                {notes.length === 0 ? (
                  <div className="rounded-lg border p-6 text-sm" style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)", color: "var(--sm-muted)" }}>
                    Nothing here yet.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    {notes.map((n, index) => (
                      <ProgressNoteCard
                        key={n.id}
                        note={n}
                        entityLabel={`N-${String(index + 1).padStart(2, "0")}`}
                        goal={goal}
                        milestone={n.milestone_id ? milestoneById.get(n.milestone_id) : undefined}
                        session={n.session_id ? sessionById.get(n.session_id) : undefined}
                        onEdit={() => { setEditingNote(n); setIsNoteFormOpen(true); }}
                        onDelete={() => deleteProgressNote(n.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
          </div>
        </div>

        <GoalFormDialog goal={goal} open={isGoalEditOpen} onOpenChange={setIsGoalEditOpen} />
        <MilestoneFormDialog goalId={id} milestone={editingMilestone} nextOrder={milestones.length + 1} open={isMilestoneFormOpen} onOpenChange={setIsMilestoneFormOpen} />
        <SessionFormDialog session={editingSession} defaultGoalId={id} open={isSessionFormOpen} onOpenChange={setIsSessionFormOpen} />
        <ProgressNoteFormDialog note={editingNote} defaultGoalId={id} open={isNoteFormOpen} onOpenChange={setIsNoteFormOpen} />
      </div>
    </main>
  );
}
