"use client";

import { Progress } from "@/components/ui/progress";
import { useProgressAnimation } from "@/src/hooks/useProgressAnimation";

interface Props {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function AnimatedProgress({ value, className, showLabel = false }: Props) {
  const display = useProgressAnimation(value);
  return (
    <div className={className}>
      <Progress value={display} />
      {showLabel && (
        <span className="mt-1 block font-mono text-xs text-muted-foreground">{display}%</span>
      )}
    </div>
  );
}
