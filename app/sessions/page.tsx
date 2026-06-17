"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionCard } from "@/src/components/sessions/SessionCard";
import { SessionFormDialog } from "@/src/components/sessions/SessionFormDialog";
import { usePlanner } from "@/src/context/PlannerContext";
import { useListAnimation } from "@/src/hooks/useListAnimation";
import { usePageAnimation } from "@/src/hooks/usePageAnimation";
import { searchSessions } from "@/src/lib/goalHelpers";
import type { PracticeSession, SessionStatus } from "@/src/types/schema";

type Filter = "all" | SessionStatus;
const FILTERS: Filter[] = ["all", "scheduled", "completed", "cancelled", "missed"];
type Sort = "date" | "duration" | "goal";

export default function SessionsPage() {
  const { data, loadData, deletePracticeSession, updateSessionStatus } = usePlanner();
  const pageRef = usePageAnimation();
  const [filter, setFilter] = useState<Filter>("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [sort, setSort] = useState<Sort>("date");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<PracticeSession | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => { void loadData(); }, [loadData]);

  const goals = useMemo(() => data?.goals ?? [], [data?.goals]);
  const goalById = useMemo(() => new Map(goals.map((g) => [g.id, g])), [goals]);
  const milestoneById = useMemo(
    () => new Map((data?.milestones ?? []).map((m) => [m.id, m])),
    [data?.milestones],
  );

  const sessions = useMemo(() => {
    let list = data?.practice_sessions ?? [];
    if (filter !== "all") list = list.filter((s) => s.status === filter);
    if (goalFilter !== "all") list = list.filter((s) => s.goal_id === goalFilter);
    list = searchSessions(list, query);
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "duration") return b.duration_minutes - a.duration_minutes;
      if (sort === "goal") {
        return (goalById.get(a.goal_id)?.title ?? "").localeCompare(
          goalById.get(b.goal_id)?.title ?? "",
        );
      }
      return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    });
    return sorted;
  }, [data?.practice_sessions, filter, goalFilter, query, sort, goalById]);

  const listRef = useListAnimation([sessions.length, filter, goalFilter, sort, query]);

  function openCreate() { setEditing(null); setIsFormOpen(true); }
  function openEdit(session: PracticeSession) { setEditing(session); setIsFormOpen(true); }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--sm-bg)", color: "var(--sm-text)" }}>
      <div ref={pageRef} className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link
          href="/"
          className="inline-flex h-9 w-fit items-center gap-1.5 px-3 font-mono text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ color: "var(--sm-muted)" }}
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Dashboard
        </Link>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--sm-accent)" }}>
              Focused practice time
            </p>
            <h1 className="mt-1 text-3xl font-bold">Practice Sessions</h1>
          </div>
          <Button type="button" onClick={openCreate} disabled={!data || goals.length === 0}
            style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }} className="font-semibold">
            <Plus aria-hidden="true" />
            New Session
          </Button>
        </section>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--sm-muted)" }} aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search sessions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            style={{ backgroundColor: "var(--sm-surface)", borderColor: "var(--sm-border)", color: "var(--sm-text)" }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2" aria-label="Session filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors"
              style={
                filter === f
                  ? { backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }
                  : { backgroundColor: "var(--sm-surface2)", color: "var(--sm-muted)", border: "1px solid var(--sm-border)" }
              }
            >
              {f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <select
              aria-label="Filter by goal"
              className="h-9 rounded-md border border-input bg-background px-2 text-xs"
              value={goalFilter}
              onChange={(e) => setGoalFilter(e.target.value)}
            >
              <option value="all">All Goals</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
            <select
              aria-label="Sort sessions"
              className="h-9 rounded-md border border-input bg-background px-2 text-xs"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="date">By date</option>
              <option value="duration">By duration</option>
              <option value="goal">By goal</option>
            </select>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-xl border p-8 text-center" style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}>
            <p className="font-semibold">No sessions here</p>
            <p className="mt-1 text-sm" style={{ color: "var(--sm-muted)" }}>
              {goals.length === 0 ? "Create a goal first, then schedule practice sessions." : "Schedule a session to start tracking practice time."}
            </p>
          </div>
        ) : (
          <section ref={listRef} className="grid gap-4 md:grid-cols-2" aria-label="Sessions">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                goal={goalById.get(session.goal_id)}
                milestone={session.milestone_id ? milestoneById.get(session.milestone_id) : undefined}
                onEdit={() => openEdit(session)}
                onDelete={() => deletePracticeSession(session.id)}
                onStatusChange={(status) => void updateSessionStatus(session.id, status)}
              />
            ))}
          </section>
        )}

        <SessionFormDialog session={editing} open={isFormOpen} onOpenChange={setIsFormOpen} />
      </div>
    </main>
  );
}
