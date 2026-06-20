"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePlanner } from "@/src/context/PlannerContext";
import { useUnsavedChangesGuard } from "@/src/hooks/useUnsavedChangesGuard";
import { animateModalIn } from "@/src/lib/animations";
import { getMilestonesForGoal, getSessionsForGoal } from "@/src/lib/goalHelpers";
import type { ProgressNote } from "@/src/types/schema";

const selectClass = "h-10 rounded-md border border-input bg-background px-3 text-sm";

export function ProgressNoteFormDialog({
  note,
  defaultGoalId,
  open,
  onOpenChange,
}: Readonly<{
  note: ProgressNote | null;
  defaultGoalId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && panelRef.current) animateModalIn(panelRef.current);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={panelRef}>
        {open ? (
          <ProgressNoteForm
            note={note}
            defaultGoalId={defaultGoalId}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ProgressNoteForm({
  note,
  defaultGoalId,
  onDone,
}: Readonly<{
  note: ProgressNote | null;
  defaultGoalId?: string;
  onDone: () => void;
}>) {
  const { data, createProgressNote, updateProgressNote, isLoading } = usePlanner();
  const goals = data?.goals ?? [];
  const [title, setTitle] = useState(() => note?.title ?? "");
  const [goalId, setGoalId] = useState(() => note?.goal_id ?? defaultGoalId ?? goals[0]?.id ?? "");
  const [milestoneId, setMilestoneId] = useState(() => note?.milestone_id ?? "");
  const [sessionId, setSessionId] = useState(() => note?.session_id ?? "");
  const [content, setContent] = useState(() => note?.content ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [initialValues] = useState(() => ({
    title: note?.title ?? "",
    goalId: note?.goal_id ?? defaultGoalId ?? goals[0]?.id ?? "",
    milestoneId: note?.milestone_id ?? "",
    sessionId: note?.session_id ?? "",
    content: note?.content ?? "",
  }));
  const isDirty =
    title !== initialValues.title ||
    goalId !== initialValues.goalId ||
    milestoneId !== initialValues.milestoneId ||
    sessionId !== initialValues.sessionId ||
    content !== initialValues.content;

  useUnsavedChangesGuard(isDirty);

  const milestoneOptions = useMemo(
    () => (goalId ? getMilestonesForGoal(data?.milestones ?? [], goalId) : []),
    [data?.milestones, goalId],
  );
  const sessionOptions = useMemo(
    () => (goalId ? getSessionsForGoal(data?.practice_sessions ?? [], goalId) : []),
    [data?.practice_sessions, goalId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 2) {
      setError("Title must be at least 2 characters.");
      return;
    }
    if (!goalId) {
      setError("A note must belong to a goal.");
      return;
    }

    if (note) {
      await updateProgressNote(note.id, {
        title: trimmedTitle,
        goal_id: goalId,
        milestone_id: milestoneId || null,
        session_id: sessionId || null,
        content,
      });
    } else {
      await createProgressNote({
        title: trimmedTitle,
        goal_id: goalId,
        milestone_id: milestoneId || null,
        session_id: sessionId || null,
        content,
      });
    }

    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{note ? "Edit Note" : "New Progress Note"}</DialogTitle>
        <DialogDescription>
          Capture reflections and progress against a goal.
        </DialogDescription>
      </DialogHeader>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="note-title">
            Title <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 1 reflection"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-goal">
              Goal <span aria-hidden="true">*</span>
            </Label>
            <select
              id="note-goal"
              className={selectClass}
              value={goalId}
              onChange={(e) => {
                setGoalId(e.target.value);
                setMilestoneId("");
                setSessionId("");
              }}
            >
              <option value="" disabled>
                Select a goal
              </option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-milestone">Milestone</Label>
            <select
              id="note-milestone"
              className={selectClass}
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              disabled={milestoneOptions.length === 0}
            >
              <option value="">None</option>
              {milestoneOptions.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-session">Session</Label>
            <select
              id="note-session"
              className={selectClass}
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              disabled={sessionOptions.length === 0}
            >
              <option value="">None</option>
              {sessionOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="note-content">Content</Label>
            <Button type="button" size="xs" variant="outline" onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? "Edit" : "Preview"}
            </Button>
          </div>
          {showPreview ? (
            <div
              className="min-h-[120px] whitespace-pre-wrap rounded-md border border-input bg-background px-3 py-2 text-sm"
              style={{ color: "var(--sm-text)" }}
            >
              {content || "Nothing to preview yet."}
            </div>
          ) : (
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Write in markdown…"
            />
          )}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button type="submit" disabled={isLoading || goals.length === 0}>
            {note ? "Save Changes" : "Create Note"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
