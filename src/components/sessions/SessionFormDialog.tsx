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
import { getMilestonesForGoal } from "@/src/lib/goalHelpers";
import type { PracticeSession, SessionStatus } from "@/src/types/schema";

const SESSION_STATUSES: SessionStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
  "missed",
];

const selectClass = "h-10 rounded-md border border-input bg-background px-3 text-sm";

/** Convert an ISO datetime to the value a datetime-local input expects. */
function toLocalInputValue(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function SessionFormDialog({
  session,
  defaultGoalId,
  open,
  onOpenChange,
}: Readonly<{
  session: PracticeSession | null;
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
          <SessionForm
            session={session}
            defaultGoalId={defaultGoalId}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SessionForm({
  session,
  defaultGoalId,
  onDone,
}: Readonly<{
  session: PracticeSession | null;
  defaultGoalId?: string;
  onDone: () => void;
}>) {
  const { data, createPracticeSession, updatePracticeSession, isLoading } = usePlanner();
  const goals = data?.goals ?? [];
  const [title, setTitle] = useState(() => session?.title ?? "");
  const [goalId, setGoalId] = useState(() => session?.goal_id ?? defaultGoalId ?? goals[0]?.id ?? "");
  const [milestoneId, setMilestoneId] = useState(() => session?.milestone_id ?? "");
  const [scheduledAt, setScheduledAt] = useState(() => toLocalInputValue(session?.scheduled_at ?? ""));
  const [durationMinutes, setDurationMinutes] = useState(() => String(session?.duration_minutes ?? 60));
  const [status, setStatus] = useState<SessionStatus>(() => session?.status ?? "scheduled");
  const [notes, setNotes] = useState(() => session?.notes ?? "");
  const [error, setError] = useState("");
  const [initialValues] = useState(() => ({
    title: session?.title ?? "",
    goalId: session?.goal_id ?? defaultGoalId ?? goals[0]?.id ?? "",
    milestoneId: session?.milestone_id ?? "",
    scheduledAt: toLocalInputValue(session?.scheduled_at ?? ""),
    durationMinutes: String(session?.duration_minutes ?? 60),
    status: session?.status ?? "scheduled",
    notes: session?.notes ?? "",
  }));
  const isDirty =
    title !== initialValues.title ||
    goalId !== initialValues.goalId ||
    milestoneId !== initialValues.milestoneId ||
    scheduledAt !== initialValues.scheduledAt ||
    durationMinutes !== initialValues.durationMinutes ||
    status !== initialValues.status ||
    notes !== initialValues.notes;

  useUnsavedChangesGuard(isDirty);

  const milestoneOptions = useMemo(
    () => (goalId ? getMilestonesForGoal(data?.milestones ?? [], goalId) : []),
    [data?.milestones, goalId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 2 || trimmedTitle.length > 100) {
      setError("Title must be between 2 and 100 characters.");
      return;
    }
    if (!goalId) {
      setError("Select a goal for this session.");
      return;
    }
    if (!scheduledAt) {
      setError("Choose a scheduled date and time.");
      return;
    }
    const duration = Number(durationMinutes);
    if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
      setError("Duration must be a whole number between 5 and 480 minutes.");
      return;
    }
    const scheduledIso = new Date(scheduledAt).toISOString();

    if (session) {
      await updatePracticeSession(session.id, {
        title: trimmedTitle,
        goal_id: goalId,
        milestone_id: milestoneId || null,
        scheduled_at: scheduledIso,
        duration_minutes: duration,
        status,
        notes,
      });
    } else {
      await createPracticeSession({
        title: trimmedTitle,
        goal_id: goalId,
        milestone_id: milestoneId || null,
        scheduled_at: scheduledIso,
        duration_minutes: duration,
        status,
        notes,
      });
    }

    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{session ? "Edit Session" : "New Session"}</DialogTitle>
        <DialogDescription>
          Schedule focused practice time and link it to a goal.
        </DialogDescription>
      </DialogHeader>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="session-title">
            Title <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="session-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Build a small project"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="session-goal">
              Goal <span aria-hidden="true">*</span>
            </Label>
            <select
              id="session-goal"
              className={selectClass}
              value={goalId}
              onChange={(e) => {
                setGoalId(e.target.value);
                setMilestoneId("");
              }}
            >
              <option value="" disabled>
                Select a goal
              </option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="session-milestone">Milestone</Label>
            <select
              id="session-milestone"
              className={selectClass}
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              disabled={milestoneOptions.length === 0}
            >
              <option value="">None</option>
              {milestoneOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="session-scheduled">
              Scheduled At <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="session-scheduled"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="session-duration">
              Duration (min) <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="session-duration"
              type="number"
              min={5}
              max={480}
              step={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="session-status">Status</Label>
          <select
            id="session-status"
            className={selectClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as SessionStatus)}
          >
            {SESSION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="session-notes">Notes</Label>
          <Textarea
            id="session-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="What will you focus on?"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button type="submit" disabled={isLoading || goals.length === 0}>
            {session ? "Save Changes" : "Create Session"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
