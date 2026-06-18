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

const STATUS_DOT: Record<SessionStatus, string> = {
  scheduled: "var(--sm-faint)",
  completed: "var(--sm-green)",
  cancelled: "color-mix(in srgb, var(--sm-faint) 45%, transparent)",
  missed: "var(--sm-red)",
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
  entityLabel,
}: Readonly<{
  session: PracticeSession;
  goal?: Goal;
  milestone?: Milestone;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onStatusChange: (status: SessionStatus) => void;
  entityLabel?: string;
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
  const completed = session.status === "completed";

  return (
    <div
      ref={cardRef}
      data-animate-item
      className="flex h-full flex-col gap-3 rounded-xl border p-5 transition-colors hover:border-[var(--sm-accent)] hover:bg-[var(--sm-surface2)]"
      style={{
        borderColor: session.status === "missed" ? "var(--sm-red)" : "var(--sm-border)",
        backgroundColor: completed ? "color-mix(in srgb, var(--sm-accent) 12%, var(--sm-surface))" : "var(--sm-surface)",
        opacity: session.status === "cancelled" ? 0.72 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--sm-faint)" }}>
            {entityLabel ?? "S-01"}
          </p>
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

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="ghost" className="h-8 w-fit gap-2 px-2" />}>
          <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: STATUS_DOT[session.status] }} />
          <span ref={badgeRef} className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--sm-muted)" }}>
            {session.status}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {SESSION_STATUSES.map((status) => (
            <DropdownMenuItem key={status} onClick={() => onStatusChange(status)}>
              <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: STATUS_DOT[status] }} />
              {status}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
