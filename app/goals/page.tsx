"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoalCard } from "@/src/components/goals/GoalCard";
import { GoalFormDialog } from "@/src/components/goals/GoalFormDialog";
import { usePlanner } from "@/src/context/PlannerContext";
import { useListAnimation } from "@/src/hooks/useListAnimation";
import { usePageAnimation } from "@/src/hooks/usePageAnimation";
import { searchGoals } from "@/src/lib/goalHelpers";
import type { Goal } from "@/src/types/schema";

type Filter = "all" | Goal["status"];
const FILTERS: Filter[] = ["all", "not_started", "in_progress", "completed", "archived"];

export default function GoalsPage() {
  const { data, loadData, deleteGoal } = usePlanner();
  const pageRef = usePageAnimation();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => { void loadData(); }, [loadData]);

  const goals = useMemo(() => {
    const all = data?.goals ?? [];
    const filtered = filter === "all" ? all : all.filter((g) => g.status === filter);
    return searchGoals(filtered, query);
  }, [data?.goals, filter, query]);

  const milestones = data?.milestones ?? [];
  const listRef = useListAnimation([goals.length, filter, query]);

  function openCreate() { setEditingGoal(null); setIsFormOpen(true); }
  function openEdit(goal: Goal) { setEditingGoal(goal); setIsFormOpen(true); }

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

        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--sm-accent)" }}>
              Learning outcomes
            </p>
            <h1 className="mt-1 text-3xl font-bold" style={{ color: "var(--sm-text)" }}>Goals</h1>
          </div>
          <Button type="button" onClick={openCreate} disabled={!data}
            style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}
            className="font-semibold"
          >
            <Plus aria-hidden="true" />
            New Goal
          </Button>
        </section>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--sm-muted)" }} aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search goals…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            style={{ backgroundColor: "var(--sm-surface)", borderColor: "var(--sm-border)", color: "var(--sm-text)" }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2" aria-label="Goal filters">
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
              {f.replaceAll("_", " ")}
            </button>
          ))}
        </div>

        {/* Goal list */}
        {goals.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}
          >
            <p className="font-semibold" style={{ color: "var(--sm-text)" }}>No goals here</p>
            <p className="mt-1 text-sm" style={{ color: "var(--sm-muted)" }}>
              {query ? "No goals match your search." : "Create a goal to get started."}
            </p>
            {!query && (
              <Button type="button" onClick={openCreate} disabled={!data} className="mt-4"
                style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}
              >
                <Plus aria-hidden="true" />
                New Goal
              </Button>
            )}
          </div>
        ) : (
          <section ref={listRef} className="grid gap-4 md:grid-cols-2" aria-label="Goals">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                milestones={milestones}
                onEdit={() => openEdit(goal)}
                onDelete={() => deleteGoal(goal.id)}
              />
            ))}
          </section>
        )}

        <GoalFormDialog goal={editingGoal} open={isFormOpen} onOpenChange={setIsFormOpen} />
      </div>
    </main>
  );
}
