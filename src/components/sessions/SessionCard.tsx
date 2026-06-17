"use client";

import { useEffect, useRef } from "react";
import { Clock, MoreHorizontal, Pencil, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { animateCardIn, animateCardOut, animateStatusChange } from "@/src/lib/animations";
import type { Goal, Milestone, PracticeSession, SessionStatus } from "@/src/types/schema";

const SESSION_STATUSES: SessionStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
  "missed",
];

const STATUS_STYLES: Record<SessionStatus, string> = {
  scheduled: "border-[var(--sm-accent)] text-[var(--sm-accent)]",
  completed: "border-[var(--sm-green)] text-[var(--sm-green)]",
  cancelled: "border-[var(--sm-muted)] text-[var(--sm-muted)]",
  missed: "border-[var(--sm-red)] text-[var(--sm-red)]",
};

const chipClass =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider";

export function SessionCard({
  session,
  goal,
  milestone,
  onEdit,
  onDelete,
  onStatusChange,
}: Readonly<{
  session: PracticeSession;
  goal?: Goal;
  milestone?: Milestone;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onStatusChange: (status: SessionStatus) => void;
}>) {
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<SessionStatus>(session.status);

  useEffect(() => {
    if (cardRef.current) animateCardIn(cardRef.current);
  }, []);

  useEffect(() => {
    if (statusRef.current !== session.status) {
      statusRef.current = session.status;
      if (badgeRef.current) animateStatusChange(badgeRef.current);
    }
  }, [session.status]);

  async function handleDelete() {
    if (cardRef.current) await animateCardOut(cardRef.current);
    await onDelete();
  }

  const scheduled = new Date(session.scheduled_at);

  return (
    <div
      ref={cardRef}
      data-animate-item
      className="flex flex-col gap-3 rounded-xl border p-5"
      style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            ref={badgeRef}
            className={`mb-2 inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLES[session.status]}`}
          >
            {session.status}
          </span>
          <h3 className="truncate text-base font-semibold" style={{ color: "var(--sm-text)" }}>
            {session.title}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" size="icon-sm" variant="ghost" />}>
            <MoreHorizontal aria-hidden="true" className="size-4" style={{ color: "var(--sm-muted)" }} />
            <span className="sr-only">Session actions</span>
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

      <div className="flex flex-wrap items-center gap-2">
        {goal ? (
          <span className={chipClass} style={{ borderColor: "var(--sm-border)", color: "var(--sm-muted)" }}>
            <Target className="size-3" aria-hidden="true" />
            {goal.title}
          </span>
        ) : null}
        {milestone ? (
          <span className={chipClass} style={{ borderColor: "var(--sm-border)", color: "var(--sm-muted)" }}>
            {milestone.title}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
        <span className="flex items-center gap-1">
          <Clock className="size-3" aria-hidden="true" />
          {scheduled.toLocaleString()}
        </span>
        <span>{session.duration_minutes} min</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--sm-muted)" }}>
          Status
        </label>
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          value={session.status}
          onChange={(e) => onStatusChange(e.target.value as SessionStatus)}
          aria-label="Update session status"
        >
          {SESSION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
