# Agent Guide

This project is SkillMap, a local-first learning planner built with Next.js 16, React 19, TypeScript, Tailwind CSS, and shadcn/ui Base Sera.

## Read First

Before implementing or making architectural decisions, read these files in order:

1. `spec/BRD.md` - complete business requirements, MVP scope, data model, and constraints.
2. `spec/project-overview.md` - product definition, goals, core user flow, features, and success criteria.
3. `spec/architecture.md` - stack, boundaries, storage model, file flow, and invariants.
4. `spec/ui-context.md` - theme, components, layout patterns, controls, and accessibility rules.
5. `spec/code-standards.md` - implementation standards for TypeScript, Next.js, styling, data, and verification.
6. `spec/ai-workflow-rules.md` - workflow, scoping rules, protected files, and doc sync expectations.
7. `spec/progress-tracker.md` - current phase, completed work, next steps, open questions, and decisions.

## Project Rules

- Build against the spec files, not assumptions.
- Keep the MVP local-first and client-side only.
- Do not add a backend, database, authentication, OAuth, or cloud provider API unless the specs are intentionally changed first.
- Use the local JSON file as the source of truth.
- Use IndexedDB for autosave and saved file handles.
- Use LocalStorage only for device identity.
- Use flattened arrays for persisted data relationships.
- Calculate progress from completed topics.
- Keep generated shadcn/ui components in `components/ui/` unchanged unless explicitly required.
- Update `spec/progress-tracker.md` after meaningful implementation changes.

## Commands

```bash
pnpm dev
pnpm lint
pnpm build
```

Use `pnpm lint` after meaningful code changes and `pnpm build` before marking product work complete.
