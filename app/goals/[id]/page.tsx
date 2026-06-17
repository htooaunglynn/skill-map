"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedProgress } from "@/src/components/ui/AnimatedProgress";
import { GoalFormDialog } from "@/src/components/goals/GoalFormDialog";
import { MilestoneList } from "@/src/components/milestones/MilestoneList";
import { SessionCard } from "@/src/components/sessions/SessionCard";
import { SessionFormDialog } from "@/src/components/sessions/SessionFormDialog";
import { ProgressNoteCard } from "@/src/components/progress-notes/ProgressNoteCard";
import { ProgressNoteFormDialog } from "@/src/components/progress-notes/ProgressNoteFormDialog";
import { usePlanner } from "@/src/context/PlannerContext";
import { usePageAnimation } from "@/src/hooks/usePageAnimation";
import { useListAnimation } from "@/src/hooks/useListAnimation";
import {
  getGoalProgress,
  getNotesForGoal,
  getSessionsForGoal,
  getTotalPracticeMinutes,
} from "@/src/lib/goalHelpers";
import type { PracticeSession, ProgressNote } from "@/src/types/schema";

type Tab = "milestones" | "sessions" | "notes";
const TABS: Tab[] = ["milestones", "sessions", "notes"];

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
    deletePracticeSession,
    updateSessionStatus,
    deleteProgressNote,
  } = usePlanner();
  const pageRef = usePageAnimation();
  const [tab, setTab] = useState<Tab>("milestones");
  const [isGoalEditOpen, setIsGoalEditOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<PracticeSession | null>(null);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ProgressNote | null>(null);
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);

  useEffect(() => { void loadData(); }, [loadData]);

  const goal = data?.goals.find((g) => g.id === id) ?? null;
  const milestones = useMemo(() => data?.milestones ?? [], [data?.milestones]);
  const milestoneById = useMemo(() => new Map(milestones.map((m) => [m.id, m])), [milestones]);

  const sessions = useMemo(
    () => getSessionsForGoal(data?.practice_sessions ?? [], id),
    [data?.practice_sessions, id],
  );
  const notes = useMemo(
    () => getNotesForGoal(data?.progress_notes ?? [], id),
    [data?.progress_notes, id],
  );
  const sessionById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

  const progress = getGoalProgress(milestones, id);
  const totalMinutes = getTotalPracticeMinutes(data?.practice_sessions ?? [], id);

  const tabListRef = useListAnimation([tab, sessions.length, notes.length]);

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
                <dd>{milestones.filter((m) => m.goal_id === id).length}</dd>
              </div>
            </dl>

            <Button type="button" variant="outline" size="sm" onClick={() => setIsGoalEditOpen(true)}>
              <Pencil aria-hidden="true" />
              Edit Goal
            </Button>
          </aside>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2" aria-label="Goal detail tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors"
                  style={
                    tab === t
                      ? { backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }
                      : { backgroundColor: "var(--sm-surface2)", color: "var(--sm-muted)", border: "1px solid var(--sm-border)" }
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "milestones" ? <MilestoneList goalId={id} /> : null}

            {tab === "sessions" ? (
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Sessions</h2>
                  <Button type="button" size="sm" onClick={() => { setEditingSession(null); setIsSessionFormOpen(true); }} style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}>
                    <Plus aria-hidden="true" />
                    New Session
                  </Button>
                </div>
                {sessions.length === 0 ? (
                  <div className="rounded-lg border p-6 text-center text-sm" style={{ borderColor: "var(--sm-border)", color: "var(--sm-muted)" }}>
                    No sessions for this goal yet.
                  </div>
                ) : (
                  <div ref={tabListRef} className="grid gap-4 sm:grid-cols-2">
                    {sessions.map((s) => (
                      <SessionCard
                        key={s.id}
                        session={s}
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
            ) : null}

            {tab === "notes" ? (
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Notes</h2>
                  <Button type="button" size="sm" onClick={() => { setEditingNote(null); setIsNoteFormOpen(true); }} style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}>
                    <Plus aria-hidden="true" />
                    New Note
                  </Button>
                </div>
                {notes.length === 0 ? (
                  <div className="rounded-lg border p-6 text-center text-sm" style={{ borderColor: "var(--sm-border)", color: "var(--sm-muted)" }}>
                    No progress notes for this goal yet.
                  </div>
                ) : (
                  <div ref={tabListRef} className="grid gap-4 sm:grid-cols-2">
                    {notes.map((n) => (
                      <ProgressNoteCard
                        key={n.id}
                        note={n}
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
            ) : null}
          </div>
        </div>

        <GoalFormDialog goal={goal} open={isGoalEditOpen} onOpenChange={setIsGoalEditOpen} />
        <SessionFormDialog session={editingSession} defaultGoalId={id} open={isSessionFormOpen} onOpenChange={setIsSessionFormOpen} />
        <ProgressNoteFormDialog note={editingNote} defaultGoalId={id} open={isNoteFormOpen} onOpenChange={setIsNoteFormOpen} />
      </div>
    </main>
  );
}
