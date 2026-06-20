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
import { usePlanner } from "@/src/context/PlannerContext";
import { useUnsavedChangesGuard } from "@/src/hooks/useUnsavedChangesGuard";
import { animateModalIn } from "@/src/lib/animations";
import type { Milestone, MilestoneStatus } from "@/src/types/schema";

const MILESTONE_STATUSES: MilestoneStatus[] = [
  "not_started",
  "in_progress",
  "completed",
];

export function MilestoneFormDialog({
  goalId,
  milestone,
  nextOrder,
  open,
  onOpenChange,
}: Readonly<{
  goalId?: string;
  milestone: Milestone | null;
  nextOrder?: number;
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
          <MilestoneForm
            goalId={goalId}
            milestone={milestone}
            nextOrder={nextOrder}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MilestoneForm({
  goalId,
  milestone,
  nextOrder,
  onDone,
}: Readonly<{
  goalId?: string;
  milestone: Milestone | null;
  nextOrder?: number;
  onDone: () => void;
}>) {
  const { data, createMilestone, updateMilestone, isLoading } = usePlanner();
  const [title, setTitle] = useState(() => milestone?.title ?? "");
  const [description, setDescription] = useState(() => milestone?.description ?? "");
  const [status, setStatus] = useState<MilestoneStatus>(() => milestone?.status ?? "not_started");
  const [dueDate, setDueDate] = useState(() => milestone?.due_date ?? "");
  const [selectedGoalId, setSelectedGoalId] = useState(() => goalId ?? milestone?.goal_id ?? "");
  const [error, setError] = useState("");
  const goals = data?.goals ?? [];
  const canChooseGoal = !goalId && !milestone;
  const [initialValues] = useState(() => ({
    title: milestone?.title ?? "",
    description: milestone?.description ?? "",
    status: milestone?.status ?? "not_started",
    dueDate: milestone?.due_date ?? "",
    selectedGoalId: goalId ?? milestone?.goal_id ?? "",
  }));
  const isDirty =
    title !== initialValues.title ||
    description !== initialValues.description ||
    status !== initialValues.status ||
    dueDate !== initialValues.dueDate ||
    selectedGoalId !== initialValues.selectedGoalId;

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
    const resolvedGoalId = goalId ?? selectedGoalId;
    if (!resolvedGoalId) {
      setError("Choose a goal for this milestone.");
      return;
    }

    if (milestone) {
      await updateMilestone(milestone.id, {
        title: trimmedTitle,
        description: description.trim(),
        status,
        due_date: dueDate || null,
      });
    } else {
      const resolvedNextOrder =
        nextOrder ??
        (data?.milestones.filter((item) => item.goal_id === resolvedGoalId).length ?? 0) + 1;
      await createMilestone({
        goal_id: resolvedGoalId,
        title: trimmedTitle,
        description: description.trim(),
        status,
        order: resolvedNextOrder,
        due_date: dueDate || null,
      });
    }

    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{milestone ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
        <DialogDescription>
          Milestones are ordered checkpoints that move a goal forward.
        </DialogDescription>
      </DialogHeader>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {canChooseGoal ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="milestone-goal">
              Goal <span aria-hidden="true">*</span>
            </Label>
            <select
              id="milestone-goal"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              required
            >
              <option value="">Choose a goal</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="milestone-title">
            Title <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="milestone-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Finish the fundamentals"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="milestone-status">Status</Label>
            <select
              id="milestone-status"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
            >
              {MILESTONE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="milestone-due-date">Due Date</Label>
            <Input
              id="milestone-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="milestone-description">Description</Label>
          <Textarea
            id="milestone-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {milestone ? "Save Milestone" : "Add Milestone"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
