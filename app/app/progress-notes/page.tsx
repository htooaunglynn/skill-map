"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressNoteCard } from "@/src/components/progress-notes/ProgressNoteCard";
import { ProgressNoteFormDialog } from "@/src/components/progress-notes/ProgressNoteFormDialog";
import { usePlanner } from "@/src/context/PlannerContext";
import { useListAnimation } from "@/src/hooks/useListAnimation";
import { usePageAnimation } from "@/src/hooks/usePageAnimation";
import { getMilestonesForGoal, searchNotes } from "@/src/lib/goalHelpers";
import type { ProgressNote } from "@/src/types/schema";

type Sort = "newest" | "oldest";

export default function ProgressNotesPage() {
  const { data, loadData, deleteProgressNote } = usePlanner();
  const pageRef = usePageAnimation();
  const [goalFilter, setGoalFilter] = useState("all");
  const [milestoneFilter, setMilestoneFilter] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ProgressNote | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => { void loadData(); }, [loadData]);

  const goals = useMemo(() => data?.goals ?? [], [data?.goals]);
  const goalById = useMemo(() => new Map(goals.map((g) => [g.id, g])), [goals]);
  const milestoneById = useMemo(
    () => new Map((data?.milestones ?? []).map((m) => [m.id, m])),
    [data?.milestones],
  );
  const sessionById = useMemo(
    () => new Map((data?.practice_sessions ?? []).map((s) => [s.id, s])),
    [data?.practice_sessions],
  );
  const milestoneOptions = useMemo(
    () => (goalFilter === "all" ? [] : getMilestonesForGoal(data?.milestones ?? [], goalFilter)),
    [data?.milestones, goalFilter],
  );

  const notes = useMemo(() => {
    let list = data?.progress_notes ?? [];
    if (goalFilter !== "all") list = list.filter((n) => n.goal_id === goalFilter);
    if (milestoneFilter !== "all") list = list.filter((n) => n.milestone_id === milestoneFilter);
    list = searchNotes(list, query);
    const sorted = [...list];
    sorted.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sort === "newest" ? -diff : diff;
    });
    return sorted;
  }, [data?.progress_notes, goalFilter, milestoneFilter, query, sort]);

  const listRef = useListAnimation([notes.length, goalFilter, milestoneFilter, sort, query]);

  function openCreate() { setEditing(null); setIsFormOpen(true); }
  function openEdit(note: ProgressNote) { setEditing(note); setIsFormOpen(true); }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--sm-bg)", color: "var(--sm-text)" }}>
      <div ref={pageRef} className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link
          href="/app"
          className="inline-flex h-9 w-fit items-center gap-1.5 px-3 font-mono text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ color: "var(--sm-muted)" }}
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Dashboard
        </Link>

        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--sm-accent)" }}>
              Reflections &amp; progress
            </p>
            <h1 className="mt-1 text-3xl font-bold">Progress Notes</h1>
          </div>
          <Button type="button" onClick={openCreate} disabled={!data || goals.length === 0}
            style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }} className="font-semibold">
            <Plus aria-hidden="true" />
            New Note
          </Button>
        </section>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--sm-muted)" }} aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            style={{ backgroundColor: "var(--sm-surface)", borderColor: "var(--sm-border)", color: "var(--sm-text)" }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by goal"
            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
            value={goalFilter}
            onChange={(e) => { setGoalFilter(e.target.value); setMilestoneFilter("all"); }}
          >
            <option value="all">All Goals</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <select
            aria-label="Filter by milestone"
            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
            value={milestoneFilter}
            onChange={(e) => setMilestoneFilter(e.target.value)}
            disabled={milestoneOptions.length === 0}
          >
            <option value="all">All Milestones</option>
            {milestoneOptions.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
          <select
            aria-label="Sort notes"
            className="ml-auto h-9 rounded-md border border-input bg-background px-2 text-xs"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {notes.length === 0 ? (
          <div className="rounded-xl border p-8 text-center" style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}>
            <p className="font-semibold">No notes here</p>
            <p className="mt-1 text-sm" style={{ color: "var(--sm-muted)" }}>
              {goals.length === 0 ? "Create a goal first, then capture progress notes." : "Write a note to capture your progress."}
            </p>
          </div>
        ) : (
          <section ref={listRef} className="grid gap-4 md:grid-cols-2" aria-label="Progress notes">
            {notes.map((note, index) => (
              <ProgressNoteCard
                key={note.id}
                note={note}
                entityLabel={`N-${String(index + 1).padStart(2, "0")}`}
                goal={goalById.get(note.goal_id)}
                milestone={note.milestone_id ? milestoneById.get(note.milestone_id) : undefined}
                session={note.session_id ? sessionById.get(note.session_id) : undefined}
                onEdit={() => openEdit(note)}
                onDelete={() => deleteProgressNote(note.id)}
              />
            ))}
          </section>
        )}

        <ProgressNoteFormDialog note={editing} open={isFormOpen} onOpenChange={setIsFormOpen} />
      </div>
    </main>
  );
}
