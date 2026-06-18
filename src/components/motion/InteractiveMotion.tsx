"use client";

import type { ReactNode } from "react";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { PrivacyShieldIcon } from "@/src/components/brand/SkillMapBrand";

type AnimatedSurfaceProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  intensity?: "soft" | "strong";
};

type AnimatedArticleProps = HTMLMotionProps<"article"> & {
  children: ReactNode;
  intensity?: "soft" | "strong";
};

export function AnimatedSurface({
  children,
  intensity = "soft",
  ...props
}: Readonly<AnimatedSurfaceProps>) {
  const shouldReduceMotion = useReducedMotion();
  const y = intensity === "strong" ? -5 : -3;

  return (
    <motion.div
      {...props}
      whileHover={shouldReduceMotion ? undefined : { y }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.45 }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedArticle({
  children,
  intensity = "soft",
  ...props
}: Readonly<AnimatedArticleProps>) {
  const shouldReduceMotion = useReducedMotion();
  const y = intensity === "strong" ? -5 : -3;

  return (
    <motion.article
      {...props}
      whileHover={shouldReduceMotion ? undefined : { y }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.45 }}
    >
      {children}
    </motion.article>
  );
}

export function AnimatedPrivacyStatement() {
  const shouldReduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion ? { duration: 0 } : { staggerChildren: 0.14, delayChildren: 0.12 },
    },
  };

  const item: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.45, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      className="flex items-start gap-3"
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label="SkillMap privacy promise"
    >
      <motion.div
        className="mt-0.5 flex size-8 items-center justify-center"
        style={{ color: "var(--sm-accent)" }}
        variants={item}
      >
        <PrivacyShieldIcon className="size-8" title="Private by design" />
      </motion.div>
      <div className="font-mono text-xs leading-5 sm:text-sm" style={{ color: "var(--sm-muted)" }}>
        <motion.p variants={item}>Your data stays on your device.</motion.p>
        <motion.p variants={item}>No tracking. No accounts. No cloud.</motion.p>
      </div>
    </motion.div>
  );
}
