"use client";

import { Progress, ProgressLabel } from "@/components/ui/progress";
import { useProgressAnimation } from "@/src/hooks/useProgressAnimation";

interface AnimatedProgressProps {
  value: number;
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export function AnimatedProgress({
  value,
  className,
  label,
  showLabel = false,
}: AnimatedProgressProps) {
  const displayValue = useProgressAnimation(value);

  return (
    <div className={className}>
      <Progress value={displayValue}>
        {label ? <ProgressLabel>{label}</ProgressLabel> : null}
      </Progress>
      {showLabel ? (
        <span className="mt-1 block text-xs text-muted-foreground">
          {displayValue}%
        </span>
      ) : null}
    </div>
  );
}
