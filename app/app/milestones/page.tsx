"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { ArrowLeft, CheckCircle2, Circle, Pencil, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { BrandHeader } from "@/src/components/brand/SkillMapBrand";
import { MilestoneFormDialog } from "@/src/components/milestones/MilestoneFormDialog";
import { usePlanner } from "@/src/context/PlannerContext";
import { useListAnimation } from "@/src/hooks/useListAnimation";
import { usePageAnimation } from "@/src/hooks/usePageAnimation";
import { animateCardOut } from "@/src/lib/animations";
import type { Goal, Milestone } from "@/src/types/schema";

const STATUS_STYLES: Record<Milestone["status"], string> = {
  not_started: "border-[var(--sm-muted)] text-[var(--sm-muted)]",
  in_progress: "border-[var(--sm-accent)] text-[var(--sm-accent)]",
  completed: "border-[var(--sm-green)] text-[var(--sm-green)]",
};

function isOverdue(milestone: Milestone): boolean {
  if (milestone.status === "completed" || !milestone.due_date) return false;
  return new Date(milestone.due_date) < new Date();
}

function MilestoneRow({
  milestone,
  goal,
  onEdit,
}: Readonly<{
  milestone: Milestone;
  goal?: Goal;
  onEdit: () => void;
}>) {
  const { toggleMilestoneComplete, deleteMilestone } = usePlanner();
  const completed = milestone.status === "completed";
  const overdue = isOverdue(milestone);

  async function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    const row = event.currentTarget.closest("[data-milestone-row]");
    if (row instanceof HTMLElement) {
      await animateCardOut(row);
    }
    await deleteMilestone(milestone.id);
  }

  return (
    <article
      data-animate-item
      data-milestone-row
      className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
      style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}
    >
      <div className="flex w-fit items-center gap-2">
        <Checkbox
          checked={completed}
          onCheckedChange={() => void toggleMilestoneComplete(milestone.id)}
          aria-label={completed ? "Mark milestone incomplete" : "Mark milestone complete"}
        />
        {completed ? (
          <CheckCircle2 className="size-4" style={{ color: "var(--sm-green)" }} aria-hidden="true" />
        ) : (
          <Circle className="size-4" style={{ color: "var(--sm-muted)" }} aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            className={`text-sm font-semibold ${completed ? "line-through opacity-60" : ""}`}
            style={{ color: "var(--sm-text)" }}
          >
            {milestone.title}
          </h2>
          <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLES[milestone.status]}`}>
            {milestone.status.replaceAll("_", " ")}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
          {goal ? goal.title : "Missing goal"}
          {milestone.due_date ? (
            <span style={{ color: overdue ? "var(--sm-red)" : "var(--sm-muted)" }}>
              {" · "}Due {new Date(milestone.due_date).toLocaleDateString()}
              {overdue ? " · overdue" : ""}
            </span>
          ) : null}
        </p>
        {milestone.description ? (
          <p className="mt-2 line-clamp-2 text-sm" style={{ color: "var(--sm-muted)" }}>
            {milestone.description}
          </p>
        ) : null}
      </div>

      <div className="flex gap-2 sm:shrink-0">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          <Pencil aria-hidden="true" />
          Edit
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={(event) => void handleDelete(event)}>
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      </div>
    </article>
  );
}

export default function MilestonesPage() {
  const { data, loadData } = usePlanner();
  const pageRef = usePageAnimation();
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => { void loadData(); }, [loadData]);

  const goals = useMemo(() => data?.goals ?? [], [data?.goals]);
  const goalById = useMemo(() => new Map(goals.map((goal) => [goal.id, goal])), [goals]);
  const milestones = useMemo(
    () =>
      [...(data?.milestones ?? [])].sort((a, b) => {
        const goalCompare = (goalById.get(a.goal_id)?.title ?? "").localeCompare(
          goalById.get(b.goal_id)?.title ?? "",
        );
        return goalCompare || a.order - b.order;
      }),
    [data?.milestones, goalById],
  );
  const listRef = useListAnimation([milestones.length]);

  function openCreate() {
    setEditingMilestone(null);
    setIsFormOpen(true);
  }

  function openEdit(milestone: Milestone) {
    setEditingMilestone(milestone);
    setIsFormOpen(true);
  }

  return (
    <main className="skillmap-background min-h-screen px-4 py-6 sm:px-6 lg:px-8" style={{ color: "var(--sm-text)" }}>
      <div ref={pageRef} className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <BrandHeader compact />

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
              Goal checkpoints
            </p>
            <h1 className="mt-1 text-3xl font-bold">Milestones</h1>
          </div>
          <Button
            type="button"
            onClick={openCreate}
            disabled={!data || goals.length === 0}
            style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}
            className="font-semibold"
          >
            <Plus aria-hidden="true" />
            Add Milestone
          </Button>
        </section>

        {goals.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}
          >
            <p className="font-semibold" style={{ color: "var(--sm-text)" }}>Create a goal first</p>
            <p className="mt-1 text-sm" style={{ color: "var(--sm-muted)" }}>
              Milestones belong to goals, so add a goal before creating milestones.
            </p>
            <Link
              href="/app/goals"
              className={cn(buttonVariants(), "mt-4")}
              style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}
            >
              Go to Goals
            </Link>
          </div>
        ) : milestones.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}
          >
            <p className="font-semibold" style={{ color: "var(--sm-text)" }}>No milestones yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--sm-muted)" }}>
              Add a milestone to break a goal into an actionable checkpoint.
            </p>
            <Button
              type="button"
              onClick={openCreate}
              className="mt-4"
              style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}
            >
              <Plus aria-hidden="true" />
              Add Milestone
            </Button>
          </div>
        ) : (
          <section ref={listRef} className="flex flex-col gap-3" aria-label="Milestones">
            {milestones.map((milestone) => (
              <MilestoneRow
                key={milestone.id}
                milestone={milestone}
                goal={goalById.get(milestone.goal_id)}
                onEdit={() => openEdit(milestone)}
              />
            ))}
          </section>
        )}

        <MilestoneFormDialog
          milestone={editingMilestone}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
        />
      </div>
    </main>
  );
}
