"use client";

import { useEffect, useRef } from "react";
import { animatePageIn } from "@/src/lib/animations";

export function usePageAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animatePageIn(ref.current);
    }
  }, []);

  return ref;
}
