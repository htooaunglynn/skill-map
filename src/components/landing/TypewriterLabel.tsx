"use client";

import { useEffect, useState } from "react";

const HERO_LABEL_PHRASES = [
  "LOCAL-FIRST LEARNING PLANNER",
  "NO BACKEND. NO ACCOUNTS. NO CLOUD.",
  "YOUR DATA. YOUR DEVICE. YOUR FILE.",
  "GOALS · MILESTONES · PRACTICE · NOTES",
] as const;

const TYPE_SPEED_MS = 40;
const DELETE_SPEED_MS = 22;
const PAUSE_AFTER_TYPE_MS = 2000;
const PAUSE_AFTER_DELETE_MS = 350;

type TypewriterMode = "typing" | "pausing" | "deleting" | "waiting";

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (globalThis.window === undefined) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

export function TypewriterLabel({ className }: Readonly<{ className?: string }>) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [animatedText, setAnimatedText] = useState("");

  useEffect(() => {
    if (prefersReducedMotion) return;

    let phraseIndex = 0;
    let charCount = 0;
    let mode: TypewriterMode = "typing";
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function schedule(delay: number) {
      timeoutId = setTimeout(runTypewriter, delay);
    }

    function runTypewriter() {
      const currentPhrase = HERO_LABEL_PHRASES[phraseIndex];

      if (mode === "typing") {
        charCount += 1;
        setAnimatedText(currentPhrase.slice(0, charCount));

        if (charCount < currentPhrase.length) {
          schedule(TYPE_SPEED_MS);
          return;
        }

        mode = "pausing";
        schedule(PAUSE_AFTER_TYPE_MS);
        return;
      }

      if (mode === "pausing") {
        mode = "deleting";
        schedule(DELETE_SPEED_MS);
        return;
      }

      if (mode === "deleting") {
        charCount -= 1;
        setAnimatedText(currentPhrase.slice(0, charCount));

        if (charCount > 0) {
          schedule(DELETE_SPEED_MS);
          return;
        }

        mode = "waiting";
        schedule(PAUSE_AFTER_DELETE_MS);
        return;
      }

      phraseIndex = (phraseIndex + 1) % HERO_LABEL_PHRASES.length;
      mode = "typing";
      schedule(TYPE_SPEED_MS);
    }

    schedule(TYPE_SPEED_MS);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion]);

  const displayText = prefersReducedMotion ? HERO_LABEL_PHRASES[0] : animatedText;

  return (
    <span className={className}>
      {displayText}
      {!prefersReducedMotion && (
        <span aria-hidden="true" className="animate-pulse" style={{ color: "var(--sm-accent)" }}>
          |
        </span>
      )}
    </span>
  );
}
