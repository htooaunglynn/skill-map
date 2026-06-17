"use client";

import { gsap } from "gsap";

export function shouldAnimate(): boolean {
  if (globalThis.window === undefined) return false;
  return !globalThis.window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function animatePageIn(element: HTMLElement): void {
  if (!shouldAnimate()) return;
  gsap.fromTo(element, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
}

export function animateListIn(elements: HTMLElement[] | NodeListOf<HTMLElement>): void {
  if (!shouldAnimate()) return;
  gsap.fromTo(elements, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.07 });
}

export function animateCardIn(element: HTMLElement): void {
  if (!shouldAnimate()) return;
  gsap.fromTo(element, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.4)" });
}

export function animateCardOut(element: HTMLElement): Promise<void> {
  if (!shouldAnimate()) return Promise.resolve();
  return new Promise((resolve) =>
    gsap.to(element, { opacity: 0, y: -12, scale: 0.96, duration: 0.25, ease: "power2.in", onComplete: resolve })
  );
}

export function animateModalIn(element: HTMLElement): void {
  if (!shouldAnimate()) return;
  gsap.fromTo(element, { opacity: 0, scale: 0.95, y: 12 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" });
}

export function animateProgress(setter: (value: number) => void, target: number, duration = 0.8) {
  if (!shouldAnimate()) {
    setter(target);
    return gsap.to({}, { duration: 0 });
  }
  const obj = { value: 0 };
  return gsap.to(obj, {
    value: target,
    duration,
    ease: "power1.out",
    onUpdate: () => setter(Math.round(obj.value)),
  });
}

export function animateSectionsIn(elements: HTMLElement[] | NodeListOf<HTMLElement>): void {
  if (!shouldAnimate()) return;
  gsap.fromTo(elements, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.3, ease: "power1.out", stagger: 0.06 });
}

export function animateDashboardSections(elements: HTMLElement[] | NodeListOf<HTMLElement>): void {
  if (!shouldAnimate()) return;
  gsap.fromTo(elements, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.3, ease: "power1.out", stagger: 0.08 });
}

export function animateMilestoneToggle(element: HTMLElement): void {
  if (!shouldAnimate()) return;
  gsap.fromTo(element, { backgroundColor: "#d1fae5" }, { backgroundColor: "transparent", duration: 0.8, ease: "power1.out" });
}

export function animateStatusChange(element: HTMLElement): void {
  if (!shouldAnimate()) return;
  gsap.fromTo(element, { scale: 0.85 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
}
