"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, NotebookText, Target, Timer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DeviceSetupModal } from "@/src/components/DeviceSetupModal";
import { FileConnectionStatus } from "@/src/components/FileConnectionStatus";
import { AnimatedProgress } from "@/src/components/ui/AnimatedProgress";
import { usePlanner } from "@/src/context/PlannerContext";
import { usePageAnimation } from "@/src/hooks/usePageAnimation";
import { useProgressAnimation } from "@/src/hooks/useProgressAnimation";
import { animateDashboardSections } from "@/src/lib/animations";
import { getDeviceName } from "@/src/lib/storage/device";
import {
  getGoalProgress,
  getMissedSessions,
  getOverdueMilestones,
  getRecentNotes,
  getUpcomingSessions,
} from "@/src/lib/goalHelpers";
import type { SessionStatus } from "@/src/types/schema";

const SESSION_STATUSES: SessionStatus[] = ["scheduled", "completed", "cancelled", "missed"];

function daysOverdue(due: string): number {
  const ms = Date.now() - new Date(due).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

function Counter({ label, value, total }: Readonly<{ label: string; value: number; total?: number }>) {
  const display = useProgressAnimation(value);
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}>
      <p className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--sm-muted)" }}>{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color: "var(--sm-text)" }}>
        {display}
        {total !== undefined ? <span className="text-lg" style={{ color: "var(--sm-muted)" }}> / {total}</span> : null}
      </p>
    </div>
  );
}

const sectionCard = "flex flex-col gap-3 rounded-xl border p-5";
const sectionStyle = { borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" };
const linkClass = "font-mono text-xs uppercase tracking-wider transition-opacity hover:opacity-70";
const navLinkClass = cn(buttonVariants({ variant: "outline", size: "sm" }), "justify-start");

export function GoalsDashboard() {
  const { data, loadData, updateSessionStatus, toggleMilestoneComplete } = usePlanner();
  const pageRef = usePageAnimation();
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [hasCheckedDevice, setHasCheckedDevice] = useState(false);

  useEffect(() => { void loadData(); }, [loadData]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDeviceName(getDeviceName());
      setHasCheckedDevice(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const goals = useMemo(() => data?.goals ?? [], [data?.goals]);
  const milestones = useMemo(() => data?.milestones ?? [], [data?.milestones]);
  const sessions = useMemo(() => data?.practice_sessions ?? [], [data?.practice_sessions]);
  const notes = useMemo(() => data?.progress_notes ?? [], [data?.progress_notes]);
  const goalById = useMemo(() => new Map(goals.map((g) => [g.id, g])), [goals]);

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "in_progress"),
    [goals],
  );
  const upcoming = useMemo(
    () => getUpcomingSessions(sessions).slice(0, 5),
    [sessions],
  );
  const overdue = useMemo(
    () =>
      getOverdueMilestones(milestones)
        .sort((a, b) => new Date(a.due_date ?? 0).getTime() - new Date(b.due_date ?? 0).getTime()),
    [milestones],
  );
  const recentNotes = useMemo(
    () => getRecentNotes(notes),
    [notes],
  );

  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const completedSessions = sessions.filter((s) => s.status === "completed").length;
  const practiceHours = Math.round(
    (sessions.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.duration_minutes, 0) / 60) * 10,
  ) / 10;
  const missedCount = getMissedSessions(sessions).length;

  useEffect(() => {
    if (!sectionsRef.current) return;
    const els = sectionsRef.current.querySelectorAll<HTMLElement>("[data-dashboard-section]");
    if (els.length) animateDashboardSections(els);
  }, [data]);

  if (!hasCheckedDevice || !deviceName) {
    return (
      <DeviceSetupModal
        required
        onComplete={(nextDeviceName) => setDeviceName(nextDeviceName)}
      />
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--sm-bg)", color: "var(--sm-text)" }}>
      <div ref={pageRef} className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-xl border p-5 md:flex-row md:items-center md:justify-between" style={sectionStyle}>
          <nav className="grid gap-2 sm:grid-cols-2" aria-label="Dashboard navigation">
            <Link href="/goals" className={navLinkClass} style={{ borderColor: "var(--sm-border)", color: "var(--sm-text)" }}>
              <Target aria-hidden="true" />
              Goals
            </Link>
            <Link href="/milestones" className={navLinkClass} style={{ borderColor: "var(--sm-border)", color: "var(--sm-text)" }}>
              <Flag aria-hidden="true" />
              Milestones
            </Link>
            <Link href="/progress-notes" className={navLinkClass} style={{ borderColor: "var(--sm-border)", color: "var(--sm-text)" }}>
              <NotebookText aria-hidden="true" />
              Progress Notes
            </Link>
            <Link href="/sessions" className={navLinkClass} style={{ borderColor: "var(--sm-border)", color: "var(--sm-text)" }}>
              <Timer aria-hidden="true" />
              Sessions
            </Link>
          </nav>
          <div className="flex flex-col gap-1 text-left md:text-right">
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--sm-accent)" }}>Overview</p>
            <h1 className="text-3xl font-bold">Goals Dashboard - {deviceName}</h1>
          </div>
        </section>

        <FileConnectionStatus />

        <div ref={sectionsRef} className="flex flex-col gap-6">
          <section data-dashboard-section className={sectionCard} style={sectionStyle}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Goals</h2>
              <Link href="/goals" className={linkClass} style={{ color: "var(--sm-accent)" }}>View all goals</Link>
            </div>
            {activeGoals.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--sm-muted)" }}>No active goals.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {activeGoals.map((g) => {
                  const overdueCount = overdue.filter((m) => m.goal_id === g.id).length;
                  return (
                    <li key={g.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-3">
                        <Link href={`/goals/${g.id}`} className="text-sm font-medium hover:opacity-80" style={{ color: "var(--sm-text)" }}>{g.title}</Link>
                        <span className="font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
                          {g.target_date ? new Date(g.target_date).toLocaleDateString() : "-"}
                        </span>
                      </div>
                      <AnimatedProgress value={getGoalProgress(milestones, g.id)} className="w-full" />
                      {overdueCount > 0 ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--sm-red)" }}>
                          {overdueCount} overdue milestone{overdueCount === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section data-dashboard-section className={sectionCard} style={sectionStyle}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
              <Link href="/sessions" className={linkClass} style={{ color: "var(--sm-accent)" }}>View all sessions</Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--sm-muted)" }}>No upcoming sessions.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {upcoming.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-b-0" style={{ borderColor: "var(--sm-border)" }}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: "var(--sm-text)" }}>{s.title}</p>
                      <p className="font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
                        {goalById.get(s.goal_id)?.title ?? "-"} · {new Date(s.scheduled_at).toLocaleString()} · {s.duration_minutes} min
                      </p>
                    </div>
                    <select
                      aria-label="Update session status"
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      value={s.status}
                      onChange={(e) => void updateSessionStatus(s.id, e.target.value as SessionStatus)}
                    >
                      {SESSION_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section data-dashboard-section className={sectionCard} style={sectionStyle}>
            <h2 className="text-lg font-semibold">Overdue Milestones</h2>
            {overdue.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--sm-muted)" }}>Nothing overdue. Nice work.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {overdue.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 border-b pb-2 last:border-b-0" style={{ borderColor: "var(--sm-border)" }}>
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => void toggleMilestoneComplete(m.id)}
                      aria-label="Mark milestone complete"
                    />
                    <div className="min-w-0 flex-1">
                      <Link href={`/goals/${m.goal_id}`} className="truncate text-sm font-medium hover:opacity-80" style={{ color: "var(--sm-text)" }}>{m.title}</Link>
                      <p className="font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
                        {goalById.get(m.goal_id)?.title ?? "-"}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs" style={{ color: "var(--sm-red)" }}>
                      {m.due_date ? `${daysOverdue(m.due_date)}d overdue` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section data-dashboard-section className={sectionCard} style={sectionStyle}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Progress Notes</h2>
              <Link href="/progress-notes" className={linkClass} style={{ color: "var(--sm-accent)" }}>View all notes</Link>
            </div>
            {recentNotes.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--sm-muted)" }}>No notes yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentNotes.map((n) => (
                  <li key={n.id} className="border-b pb-2 last:border-b-0" style={{ borderColor: "var(--sm-border)" }}>
                    <Link href={`/progress-notes/${n.id}`} className="text-sm font-medium hover:opacity-80" style={{ color: "var(--sm-text)" }}>{n.title}</Link>
                    <p className="font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
                      {goalById.get(n.goal_id)?.title ?? "-"} · {new Date(n.created_at).toLocaleDateString()}
                    </p>
                    {n.content ? (
                      <p className="mt-1 line-clamp-1 text-xs" style={{ color: "var(--sm-muted)" }}>{n.content.slice(0, 80)}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section data-dashboard-section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Completion Summary</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Counter label="Goals completed" value={completedGoals} total={goals.length} />
              <Counter label="Milestones completed" value={completedMilestones} total={milestones.length} />
              <Counter label="Sessions completed" value={completedSessions} total={sessions.length} />
              <Counter label="Practice hours" value={practiceHours} />
            </div>
            {missedCount > 0 ? (
              <p className="font-mono text-xs" style={{ color: "var(--sm-red)" }}>{missedCount} session(s) missed and need rescheduling.</p>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
