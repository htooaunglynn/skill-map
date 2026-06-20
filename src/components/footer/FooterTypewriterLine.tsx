"use client";

import { useEffect, useState } from "react";

const FOOTER_STATIC_PREFIX = "Copyright (c) 2026 ";
const FOOTER_LINK_TEXT = "https://htooaunglynn.uk";
const FOOTER_ANIMATION_PHRASES = [
  "Htoo Aung Lynn",
  "Application Developer",
  FOOTER_LINK_TEXT,
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

export function FooterTypewriterLine() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let currentPhraseIndex = 0;
    let currentCount = 0;
    let mode: TypewriterMode = "typing";
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function schedule(delay: number) {
      timeoutId = setTimeout(runTypewriter, delay);
    }

    function runTypewriter() {
      const currentPhrase = FOOTER_ANIMATION_PHRASES[currentPhraseIndex];

      if (mode === "typing") {
        currentCount += 1;
        setCharCount(currentCount);
        setPhraseIndex(currentPhraseIndex);

        if (currentCount < currentPhrase.length) {
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
        currentCount -= 1;
        setCharCount(currentCount);
        setPhraseIndex(currentPhraseIndex);

        if (currentCount > 0) {
          schedule(DELETE_SPEED_MS);
          return;
        }

        mode = "waiting";
        schedule(PAUSE_AFTER_DELETE_MS);
        return;
      }

      currentPhraseIndex = (currentPhraseIndex + 1) % FOOTER_ANIMATION_PHRASES.length;
      mode = "typing";
      schedule(TYPE_SPEED_MS);
    }

    schedule(TYPE_SPEED_MS);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion]);

  const currentPhrase = prefersReducedMotion ? FOOTER_ANIMATION_PHRASES[0] : FOOTER_ANIMATION_PHRASES[phraseIndex];
  const visibleText = prefersReducedMotion ? FOOTER_ANIMATION_PHRASES[0] : currentPhrase.slice(0, charCount);
  const isLinkPhrase = currentPhrase === FOOTER_LINK_TEXT;

  return (
    <span className="inline-grid grid-cols-[max-content_24ch] items-baseline text-left">
      <span className="mr-1.5">{FOOTER_STATIC_PREFIX}</span>
      <span className="whitespace-nowrap">
        {isLinkPhrase ? (
          <a
            href="https://htooaunglynn.uk"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit htooaunglynn.uk"
            className="transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            style={{ color: "var(--sm-accent)" }}
          >
            {visibleText}
          </a>
        ) : (
          <span style={{ color: "var(--sm-accent)" }}>{visibleText}</span>
        )}
        {!prefersReducedMotion && (
          <span aria-hidden="true" className="animate-pulse" style={{ color: "var(--sm-accent)" }}>
            |
          </span>
        )}
      </span>
    </span>
  );
}
