"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatedProgress } from "@/src/components/ui/AnimatedProgress";
import { animateCardIn, animateCardOut } from "@/src/lib/animations";
import { getGoalProgress } from "@/src/lib/goalHelpers";
import type { Goal, Milestone } from "@/src/types/schema";

const STATUS_STYLES: Record<Goal["status"], string> = {
  not_started: "border-[var(--sm-muted)] text-[var(--sm-muted)]",
  in_progress: "border-[var(--sm-accent)] text-[var(--sm-accent)]",
  completed: "border-[var(--sm-green)] text-[var(--sm-green)]",
  archived: "border-[var(--sm-muted)] text-[var(--sm-muted)] opacity-60",
};

export function GoalCard({
  goal,
  milestones,
  onEdit,
  onDelete,
}: Readonly<{
  goal: Goal;
  milestones: Milestone[];
  onEdit: () => void;
  onDelete: () => Promise<void>;
}>) {
  const cardRef = useRef<HTMLDivElement>(null);
  const progress = getGoalProgress(milestones, goal.id);
  const milestoneCount = milestones.filter((m) => m.goal_id === goal.id).length;

  useEffect(() => {
    if (cardRef.current) animateCardIn(cardRef.current);
  }, []);

  async function handleDelete() {
    if (cardRef.current) await animateCardOut(cardRef.current);
    await onDelete();
  }

  return (
    <div
      ref={cardRef}
      data-animate-item
      className="skillmap-motion-card flex flex-col gap-4 rounded-xl border p-5"
      style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            className={`mb-2 inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLES[goal.status]}`}
          >
            {goal.status.replaceAll("_", " ")}
          </span>
          <h3 className="truncate text-base font-semibold" style={{ color: "var(--sm-text)" }}>
            {goal.title}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" size="icon-sm" variant="ghost" />}>
            <MoreHorizontal aria-hidden="true" className="size-4" style={{ color: "var(--sm-muted)" }} />
            <span className="sr-only">Goal actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => void handleDelete()}>
              <Trash2 aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {goal.description ? (
        <p className="line-clamp-2 text-sm" style={{ color: "var(--sm-muted)" }}>
          {goal.description}
        </p>
      ) : null}

      <AnimatedProgress value={progress} showLabel className="w-full" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
            {milestoneCount} milestone{milestoneCount === 1 ? "" : "s"}
          </span>
          {goal.target_date ? (
            <span className="flex items-center gap-1 font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
              <Calendar className="size-3" aria-hidden="true" />
              {new Date(goal.target_date).toLocaleDateString()}
            </span>
          ) : null}
        </div>
        <Link
          href={`/app/goals/${goal.id}`}
          className="rounded px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-colors hover:opacity-80"
          style={{ color: "var(--sm-accent)", borderColor: "var(--sm-accent)", border: "1px solid" }}
        >
          Open
        </Link>
      </div>
    </div>
  );
}
