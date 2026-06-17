"use client";

import { useEffect, useState } from "react";
import { animateProgress } from "@/src/lib/animations";

export function useProgressAnimation(target: number) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const tween = animateProgress(setDisplayValue, target);

    return () => {
      tween.kill();
    };
  }, [target]);

  return displayValue;
}
