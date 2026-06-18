export const SITE_NAME = "SkillMap";

export const SITE_TAGLINE = "Local-first learning planner";

export const SITE_DESCRIPTION =
  "SkillMap is a private, local-first learning planner for organizing goals, milestones, practice sessions, progress notes, and study progress in a user-owned JSON file.";

export const SITE_KEYWORDS = [
  "local-first learning planner",
  "offline study tracker",
  "JSON learning planner",
  "private study planner",
  "learning progress tracker",
  "self-learning planner",
  "course progress tracker",
  "study goals planner",
];

export function getSiteUrl(): string {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicitUrl) return explicitUrl.replace(/\/$/, "");

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionUrl) return `https://${productionUrl}`.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`.replace(/\/$/, "");

  return "http://localhost:5431";
}
