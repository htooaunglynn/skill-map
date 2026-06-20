"use client";

import { Button } from "@/components/ui/button";
import { usePlanner } from "@/src/context/PlannerContext";

export function SaveStatusIndicator() {
  const { saveStatus, saveData } = usePlanner();

  if (saveStatus === "idle") return null;

  const label =
    saveStatus === "saving"
      ? "Saving..."
      : saveStatus === "saved"
        ? "Saved"
        : "Couldn't save";
  const dotColor =
    saveStatus === "error"
      ? "var(--sm-red)"
      : saveStatus === "saved"
        ? "var(--sm-green)"
        : "var(--sm-blue)";

  return (
    <div
      aria-live="polite"
      className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-xs shadow-lg"
      style={{
        backgroundColor: "var(--sm-surface)",
        borderColor: "var(--sm-border)",
        color: "var(--sm-muted)",
      }}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: dotColor }}
        aria-hidden="true"
      />
      <span>{label}</span>
      {saveStatus === "error" ? (
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => {
            void saveData().catch(() => undefined);
          }}
        >
          Retry
        </Button>
      ) : null}
    </div>
  );
}

