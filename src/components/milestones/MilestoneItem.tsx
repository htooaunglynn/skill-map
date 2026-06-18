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
import type { Milestone, MilestoneStatus } from "@/src/types/schema";

const MILESTONE_STATUSES: MilestoneStatus[] = ["not_started", "in_progress", "completed"];

const STATUS_DOT: Record<MilestoneStatus, string> = {
  not_started: "var(--sm-faint)",
  in_progress: "var(--sm-blue)",
  completed: "var(--sm-green)",
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
  entityLabel,
}: Readonly<{
  milestone: Milestone;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  entityLabel?: string;
}>) {
  const { toggleMilestoneComplete, updateMilestone, deleteMilestone } = usePlanner();
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

  function handleStatusChange(status: MilestoneStatus) {
    const now = new Date().toISOString();
    void updateMilestone(milestone.id, {
      status,
      completed_at: status === "completed" ? now : null,
    });
  }

  const completed = milestone.status === "completed";
  const overdue = isOverdue(milestone);

  return (
    <div
      ref={rowRef}
      data-animate-item
      className="skillmap-motion-card flex h-full flex-col gap-3 rounded-xl border px-4 py-3 transition-colors hover:border-[var(--sm-accent2)] hover:bg-[var(--sm-surface2)]"
      style={{
        borderColor: overdue ? "var(--sm-red)" : "var(--sm-border)",
        backgroundColor: completed ? "color-mix(in srgb, var(--sm-accent2) 12%, var(--sm-surface))" : "var(--sm-surface)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--sm-faint)" }}>
            {entityLabel ?? "M-01"}
          </p>
          <p className={`mt-1 text-sm font-semibold ${completed ? "line-through opacity-70" : ""}`} style={{ color: "var(--sm-text)" }}>
            {milestone.title}
          </p>
        </div>
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

      {milestone.due_date ? (
        <p className="font-mono text-xs" style={{ color: overdue ? "var(--sm-red)" : "var(--sm-muted)" }}>
          Due {new Date(milestone.due_date).toLocaleDateString()}
          {overdue ? " · overdue" : ""}
        </p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={completed}
            onCheckedChange={handleToggle}
            aria-label={completed ? "Mark milestone incomplete" : "Mark milestone complete"}
          />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button type="button" variant="ghost" className="h-8 gap-2 px-2" />}>
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: overdue ? "var(--sm-red)" : STATUS_DOT[milestone.status] }}
              />
              <span ref={badgeRef} className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--sm-muted)" }}>
                {overdue ? "overdue" : milestone.status.replaceAll("_", " ")}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {MILESTONE_STATUSES.map((status) => (
                <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                  <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: STATUS_DOT[status] }} />
                  {status.replaceAll("_", " ")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex">
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
      </div>
    </div>
  );
}
