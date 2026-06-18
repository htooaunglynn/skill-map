"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type SkillMapMarkProps = {
  className?: string;
  title?: string;
};

export function SkillMapMark({ className, title = "SkillMap" }: Readonly<SkillMapMarkProps>) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={cn("size-10 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 14.5L17.8 9.2L29.6 14.5L42 9V33.5L29.6 39L17.8 33.7L6 39V14.5Z"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinejoin="round"
      />
      <path
        d="M17.8 9.2V33.7M29.6 14.5V39"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <path
        d="M30 6.5C25.9 6.5 22.6 9.8 22.6 13.8C22.6 19.6 30 26.6 30 26.6C30 26.6 37.4 19.6 37.4 13.8C37.4 9.8 34.1 6.5 30 6.5Z"
        fill="var(--sm-bg)"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="13.8" r="2.6" stroke="currentColor" strokeWidth="2.3" />
    </svg>
  );
}

export function PrivacyShieldIcon({ className, title = "Private by design" }: Readonly<SkillMapMarkProps>) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label={title}
      className={cn("size-8 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 4.8L31.8 9.1V17.8C31.8 26.1 26.8 32.7 20 35.2C13.2 32.7 8.2 26.1 8.2 17.8V9.1L20 4.8Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M14.3 20.2L18.2 24.1L26.1 15.7"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type SkillMapLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
};

export function SkillMapLogo({
  className,
  markClassName,
  wordmarkClassName,
}: Readonly<SkillMapLogoProps>) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <SkillMapMark className={cn("text-[var(--sm-accent)]", markClassName)} />
      <span
        className={cn(
          "font-sans text-lg font-bold uppercase tracking-[0.18em] text-[var(--sm-text)]",
          wordmarkClassName,
        )}
      >
        SkillMap
      </span>
    </div>
  );
}

type BrandHeaderProps = {
  className?: string;
  href?: string;
  compact?: boolean;
};

export function BrandHeader({
  className,
  href = "/app",
  compact = false,
}: Readonly<BrandHeaderProps>) {
  return (
    <header className={cn("flex items-center justify-between", className)}>
      <Link
        href={href}
        aria-label="SkillMap home"
        className="inline-flex w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <SkillMapLogo
          markClassName={compact ? "size-8" : "size-10"}
          wordmarkClassName={compact ? "text-base" : "text-lg"}
        />
      </Link>
    </header>
  );
}
