# Contributing to SkillMap

Thanks for helping improve SkillMap.

SkillMap is a local-first learning planner. The MVP keeps user data in a local JSON file and does not use a backend, database, authentication, OAuth, or cloud provider API.

## Before You Start

Read these files before proposing product or architecture changes:

1. `spec/BRD.md`
2. `spec/project-overview.md`
3. `spec/architecture.md`
4. `spec/ui-context.md`
5. `spec/code-standards.md`
6. `spec/ai-workflow-rules.md`
7. `spec/progress-tracker.md`

## Development Setup

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Run checks:

```bash
pnpm lint
pnpm build
```

## Contribution Guidelines

- Keep changes aligned with the specs.
- Keep the MVP local-first and client-side only.
- Do not add backend services, databases, accounts, OAuth, or cloud APIs unless the specs are intentionally changed first.
- Use the existing Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui patterns.
- Do not edit generated `components/ui/*` files unless the change is explicitly required.
- Keep pull requests focused on one feature, fix, or documentation improvement.
- Update `spec/progress-tracker.md` after meaningful implementation changes.

## Pull Request Checklist

Before opening a pull request:

- The change is scoped and explained clearly.
- `pnpm lint` passes.
- `pnpm build` passes for product/code changes.
- UI changes have been checked at desktop and mobile widths.
- Documentation or specs are updated when behavior, scope, architecture, or workflow changes.

## Good First Contributions

Helpful starting points include:

- Documentation improvements.
- Small UI polish that follows `spec/ui-context.md`.
- Accessibility improvements.
- Validation and fallback-flow hardening from `spec/progress-tracker.md`.
- Bug reports with clear reproduction steps.

