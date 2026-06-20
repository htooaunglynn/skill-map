"use client";

import { useEffect } from "react";

/**
 * Warns before the tab closes/refreshes if `isDirty` is true.
 * In-app dialog closing and route changes are intentionally not intercepted.
 */
export function useUnsavedChangesGuard(isDirty: boolean): void {
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);
}
