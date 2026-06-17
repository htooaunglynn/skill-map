"use client";

import { useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlanner } from "@/src/context/PlannerContext";
import {
  animateCardOut,
  animateMilestoneToggle,
  animateStatusChange,
} from "@/src/lib/animations";
import type { Milestone } from "@/src/types/schema";

const STATUS_STYLES: Record<Milestone["status"], string> = {
  not_started: "border-[var(--sm-muted)] text-[var(--sm-muted)]",
  in_progress: "border-[var(--sm-accent)] text-[var(--sm-accent)]",
  completed: "border-[var(--sm-green)] text-[var(--sm-green)]",
};

function isOverdue(milestone: Milestone): boolean {
  if (milestone.status === "completed" || !milestone.due_date) return false;
  return new Date(milestone.due_date) < new Date();
}

export function MilestoneItem({
  milestone,
  onEdit,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: Readonly<{
  milestone: Milestone;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}>) {
  const { toggleMilestoneComplete, deleteMilestone } = usePlanner();
  const rowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<Milestone["status"]>(milestone.status);

  useEffect(() => {
    if (statusRef.current !== milestone.status) {
      statusRef.current = milestone.status;
      if (badgeRef.current) animateStatusChange(badgeRef.current);
    }
  }, [milestone.status]);

  function handleToggle() {
    if (rowRef.current) animateMilestoneToggle(rowRef.current);
    void toggleMilestoneComplete(milestone.id);
  }

  async function handleDelete() {
    if (rowRef.current) await animateCardOut(rowRef.current);
    await deleteMilestone(milestone.id);
  }

  const completed = milestone.status === "completed";
  const overdue = isOverdue(milestone);

  return (
    <div
      ref={rowRef}
      data-animate-item
      className="flex items-center gap-3 rounded-lg border px-4 py-3"
      style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}
    >
      <div className="flex flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          aria-label="Move milestone up"
          className="text-[var(--sm-muted)] transition-opacity hover:opacity-70 disabled:opacity-20"
        >
          <ChevronUp className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          aria-label="Move milestone down"
          className="text-[var(--sm-muted)] transition-opacity hover:opacity-70 disabled:opacity-20"
        >
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <Checkbox
        checked={completed}
        onCheckedChange={handleToggle}
        aria-label={completed ? "Mark milestone incomplete" : "Mark milestone complete"}
      />

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${completed ? "line-through opacity-60" : ""}`}
          style={{ color: "var(--sm-text)" }}
        >
          {milestone.title}
        </p>
        {milestone.due_date ? (
          <p
            className="font-mono text-xs"
            style={{ color: overdue ? "var(--sm-red)" : "var(--sm-muted)" }}
          >
            Due {new Date(milestone.due_date).toLocaleDateString()}
            {overdue ? " · overdue" : ""}
          </p>
        ) : null}
      </div>

      <span
        ref={badgeRef}
        className={`hidden shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider sm:inline-block ${STATUS_STYLES[milestone.status]}`}
      >
        {milestone.status.replaceAll("_", " ")}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" size="icon-sm" variant="ghost" />}>
          <MoreHorizontal aria-hidden="true" className="size-4" style={{ color: "var(--sm-muted)" }} />
          <span className="sr-only">Milestone actions</span>
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
  );
}
