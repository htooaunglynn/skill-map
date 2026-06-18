"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Calendar, MoreHorizontal, Pencil, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { animateCardIn, animateCardOut } from "@/src/lib/animations";
import type { Goal, Milestone, PracticeSession, ProgressNote } from "@/src/types/schema";

const chipClass =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider";

export function ProgressNoteCard({
  note,
  goal,
  milestone,
  session,
  onEdit,
  onDelete,
  entityLabel,
}: Readonly<{
  note: ProgressNote;
  goal?: Goal;
  milestone?: Milestone;
  session?: PracticeSession;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  entityLabel?: string;
}>) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) animateCardIn(cardRef.current);
  }, []);

  async function handleDelete() {
    if (cardRef.current) await animateCardOut(cardRef.current);
    await onDelete();
  }

  const preview = note.content.slice(0, 120);

  return (
    <div
      ref={cardRef}
      data-animate-item
      className="skillmap-motion-card flex h-full flex-col gap-3 rounded-xl border p-5 transition-colors hover:border-[var(--sm-rose)] hover:bg-[var(--sm-surface2)]"
      style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={`/app/progress-notes/${note.id}`} className="min-w-0 flex-1 transition-opacity hover:opacity-80">
          <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--sm-faint)" }}>
            {entityLabel ?? "N-01"}
          </p>
          <h3 className="truncate text-base font-semibold" style={{ color: "var(--sm-text)" }}>
            {note.title}
          </h3>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" size="icon-sm" variant="ghost" />}>
            <MoreHorizontal aria-hidden="true" className="size-4" style={{ color: "var(--sm-muted)" }} />
            <span className="sr-only">Note actions</span>
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
        {session ? (
          <span className={chipClass} style={{ borderColor: "var(--sm-border)", color: "var(--sm-muted)" }}>
            {session.title}
          </span>
        ) : null}
      </div>

      {preview ? (
        <p className="line-clamp-2 text-sm" style={{ color: "var(--sm-muted)" }}>
          {preview}
          {note.content.length > 120 ? "…" : ""}
        </p>
      ) : null}

      <span className="flex items-center gap-1 font-mono text-xs" style={{ color: "var(--sm-muted)" }}>
        <Calendar className="size-3" aria-hidden="true" />
        {new Date(note.created_at).toLocaleDateString()}
      </span>
    </div>
  );
}
