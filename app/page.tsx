import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileJson, HardDrive, LockKeyhole, Target } from "lucide-react";
import { BrandHeader } from "@/src/components/brand/SkillMapBrand";
import { TypewriterLabel } from "@/src/components/landing/TypewriterLabel";
import { AnimatedArticle, AnimatedPrivacyStatement, AnimatedSurface } from "@/src/components/motion/InteractiveMotion";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/src/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} - ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

const features = [
  {
    icon: HardDrive,
    title: "Local-first by design",
    description:
      "Open or create a planner file on your own machine and keep your learning data under your control.",
  },
  {
    icon: FileJson,
    title: "Portable JSON file",
    description:
      "Store goals, milestones, sessions, notes, and progress in a readable file you can back up anywhere.",
  },
  {
    icon: Target,
    title: "Progress that stays visible",
    description:
      "Plan learning outcomes, track checkpoints, log practice, and review recent progress without a remote account.",
  },
  {
    icon: LockKeyhole,
    title: "Private study workspace",
    description:
      "SkillMap runs in the browser for personal self-learning. No backend, no database, and no OAuth for the MVP.",
  },
];

const previewGoals = [
  { label: "Active goals", value: "04", accent: "var(--sm-accent)" },
  { label: "Milestones", value: "18", accent: "var(--sm-accent2)" },
  { label: "Sessions", value: "32", accent: "var(--sm-rose)" },
];

export default function LandingPage() {
  return (
    <main className="skillmap-background" style={{ color: "var(--sm-text)" }}>
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <BrandHeader href="/" className="mx-auto w-full max-w-6xl" />
        <div className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col gap-6">
            <div className="border-l-[3px] pl-4" style={{ borderColor: "var(--sm-accent)" }}>
              <TypewriterLabel className="font-mono text-xs uppercase tracking-widest text-[var(--sm-accent)]" />
              <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                Plan self-learning in a private JSON workspace.
              </h1>
            </div>

            <p className="max-w-2xl text-base leading-7 sm:text-lg" style={{ color: "var(--sm-muted)" }}>
              SkillMap helps self-learners organize goals, milestones, practice sessions, and progress notes while keeping the source of truth in a local file owned by the learner.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-opacity hover:opacity-85"
                style={{ backgroundColor: "var(--sm-accent)", color: "var(--sm-bg)" }}
              >
                Open SkillMap
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href="#features"
                className="inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-semibold transition-colors hover:bg-[var(--sm-surface2)]"
                style={{ borderColor: "var(--sm-border)", color: "var(--sm-text)" }}
              >
                Explore features
              </a>
            </div>

            <dl className="grid max-w-2xl gap-3 sm:grid-cols-3">
              {previewGoals.map((item) => (
                <AnimatedSurface
                  key={item.label}
                  className="skillmap-motion-card rounded-xl border border-t-[3px] p-4"
                  style={{
                    backgroundColor: "var(--sm-surface)",
                    borderColor: "var(--sm-border)",
                    borderTopColor: item.accent,
                  }}
                >
                  <dt className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--sm-muted)" }}>
                    {item.label}
                  </dt>
                  <dd className="mt-2 font-mono text-3xl font-bold">{item.value}</dd>
                </AnimatedSurface>
              ))}
            </dl>

            <AnimatedPrivacyStatement />
          </div>

          <AnimatedSurface
            intensity="strong"
            className="skillmap-motion-card rounded-xl border p-4 shadow-2xl"
            style={{ backgroundColor: "var(--sm-surface)", borderColor: "var(--sm-border)" }}
            aria-label="SkillMap planner preview"
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--sm-border)" }}>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--sm-accent)" }}>
                  Goals Dashboard
                </p>
                <h2 className="mt-1 text-xl font-bold">Frontend Mastery Plan</h2>
              </div>
              <span className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider" style={{ borderColor: "var(--sm-border)", color: "var(--sm-muted)" }}>
                Local file
              </span>
            </div>

            <div className="grid gap-4 py-5 md:grid-cols-3">
              {[
                ["Milestones", "Build routing map", "var(--sm-accent2)"],
                ["Sessions", "90 min practice", "var(--sm-accent)"],
                ["Progress Notes", "Hooks finally clicked", "var(--sm-rose)"],
              ].map(([lane, title, color], index) => (
                <AnimatedArticle
                  key={lane}
                  className="skillmap-motion-card min-h-40 rounded-lg border p-4"
                  style={{ borderColor: "var(--sm-border)", backgroundColor: "var(--sm-surface2)" }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
                    {lane}
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--sm-faint)" }}>
                    {index === 0 ? "M-04" : index === 1 ? "S-09" : "N-12"}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold">{title}</h3>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--sm-border)" }}>
                    <div className="h-full rounded-full" style={{ width: `${68 - index * 14}%`, backgroundColor: color }} />
                  </div>
                </AnimatedArticle>
              ))}
            </div>

            <div className="rounded-lg border p-4" style={{ borderColor: "var(--sm-border)", backgroundColor: "color-mix(in srgb, var(--sm-accent) 8%, var(--sm-surface))" }}>
              <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--sm-muted)" }}>
                Source of truth
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--sm-text)" }}>
                skillmap.json stays on your device, external drive, or synced folder.
              </p>
            </div>
          </AnimatedSurface>
        </div>
      </section>

      <section id="features" className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <AnimatedArticle
              key={feature.title}
              className="skillmap-motion-card rounded-xl border p-5"
              style={{ backgroundColor: "var(--sm-surface)", borderColor: "var(--sm-border)" }}
            >
              <feature.icon className="size-5" style={{ color: "var(--sm-accent)" }} aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--sm-muted)" }}>
                {feature.description}
              </p>
            </AnimatedArticle>
          ))}
        </div>
      </section>
    </main>
  );
}
