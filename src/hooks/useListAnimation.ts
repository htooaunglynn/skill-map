"use client";

import { useEffect, useRef } from "react";
import { animateListIn } from "@/src/lib/animations";

export function useListAnimation(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const items =
      ref.current.querySelectorAll<HTMLElement>("[data-animate-item]");

    if (items.length > 0) {
      animateListIn(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
