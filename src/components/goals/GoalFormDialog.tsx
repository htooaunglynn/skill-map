"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
import { animateModalIn } from "@/src/lib/animations";
import type { Goal, GoalStatus } from "@/src/types/schema";
import { usePlanner } from "@/src/context/PlannerContext";
import { useUnsavedChangesGuard } from "@/src/hooks/useUnsavedChangesGuard";

const GOAL_STATUSES: GoalStatus[] = ["not_started", "in_progress", "completed", "archived"];

export function GoalFormDialog({
  goal,
  open,
  onOpenChange,
}: Readonly<{
  goal: Goal | null;
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
        {open ? <GoalForm goal={goal} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function GoalForm({
  goal,
  onDone,
}: Readonly<{
  goal: Goal | null;
  onDone: () => void;
}>) {
  const { createGoal, updateGoal, isLoading, data } = usePlanner();
  const [title, setTitle] = useState(() => goal?.title ?? "");
  const [description, setDescription] = useState(() => goal?.description ?? "");
  const [status, setStatus] = useState<GoalStatus>(() => goal?.status ?? "not_started");
  const [targetDate, setTargetDate] = useState(() => goal?.target_date ?? "");
  const [error, setError] = useState("");
  const [initialValues] = useState(() => ({
    title: goal?.title ?? "",
    description: goal?.description ?? "",
    status: goal?.status ?? "not_started",
    targetDate: goal?.target_date ?? "",
  }));
  const isDirty =
    title !== initialValues.title ||
    description !== initialValues.description ||
    status !== initialValues.status ||
    targetDate !== initialValues.targetDate;

  useUnsavedChangesGuard(isDirty);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 2) {
      setError("Title must be at least 2 characters.");
      return;
    }
    if (trimmedTitle.length > 100) {
      setError("Title must be at most 100 characters.");
      return;
    }
    const payload = {
      title: trimmedTitle,
      description: description.trim(),
      status,
      target_date: targetDate || null,
    };
    if (goal) {
      await updateGoal(goal.id, payload);
    } else {
      await createGoal(payload);
    }
    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{goal ? "Edit Goal" : "New Goal"}</DialogTitle>
        <DialogDescription>Goals are independent personal learning outcomes.</DialogDescription>
      </DialogHeader>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="goal-title">Title <span aria-hidden="true">*</span></Label>
          <Input
            id="goal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Learn TypeScript deeply"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="goal-description">Description</Label>
          <Textarea
            id="goal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does success look like?"
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="goal-status">Status</Label>
          <select
            id="goal-status"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as GoalStatus)}
          >
            {GOAL_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="goal-target-date">Target Date</Label>
          <Input
            id="goal-target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button type="submit" disabled={isLoading || !data}>
            {goal ? "Save Changes" : "Create Goal"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
