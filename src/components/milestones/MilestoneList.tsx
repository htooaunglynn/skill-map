"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlanner } from "@/src/context/PlannerContext";
import { useListAnimation } from "@/src/hooks/useListAnimation";
import { getMilestonesForGoal } from "@/src/lib/goalHelpers";
import type { Milestone } from "@/src/types/schema";
import { MilestoneItem } from "./MilestoneItem";
import { MilestoneFormDialog } from "./MilestoneFormDialog";

export function MilestoneList({ goalId }: Readonly<{ goalId: string }>) {
  const { data, reorderMilestones } = usePlanner();
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const milestones = useMemo(
    () => getMilestonesForGoal(data?.milestones ?? [], goalId),
    [data?.milestones, goalId],
  );
  const listRef = useListAnimation([milestones.length]);

  function openCreate() {
    setEditingMilestone(null);
    setIsFormOpen(true);
  }

  function openEdit(milestone: Milestone) {
    setEditingMilestone(milestone);
    setIsFormOpen(true);
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...milestones];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    void reorderMilestones(goalId, next.map((m) => m.id));
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold" style={{ color: "var(--sm-text)" }}>
          Milestones
        </h2>
        <Button
          type="button"
          size="sm"
          onClick={openCreate}
          style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}
        >
          <Plus aria-hidden="true" />
          Add Milestone
        </Button>
      </div>

      {milestones.length === 0 ? (
        <div
          className="rounded-lg border p-6 text-center text-sm"
          style={{ borderColor: "var(--sm-border)", color: "var(--sm-muted)" }}
        >
          No milestones yet. Break this goal into ordered checkpoints.
        </div>
      ) : (
        <div ref={listRef} className="flex flex-col gap-2">
          {milestones.map((milestone, index) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              onEdit={() => openEdit(milestone)}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              canMoveUp={index > 0}
              canMoveDown={index < milestones.length - 1}
            />
          ))}
        </div>
      )}

      <MilestoneFormDialog
        goalId={goalId}
        milestone={editingMilestone}
        nextOrder={milestones.length + 1}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </section>
  );
}
