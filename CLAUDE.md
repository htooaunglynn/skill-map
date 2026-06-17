# Claude Guide

This project is SkillMap, a local-first learning planner. The MVP is a browser-only Next.js app that stores all planner data in a user-owned local JSON file.

## Required Context Flow

Read these files in order before implementing:

1. `spec/BRD.md`
2. `spec/project-overview.md`
3. `spec/architecture.md`
4. `spec/ui-context.md`
5. `spec/code-standards.md`
6. `spec/ai-workflow-rules.md`
7. `spec/progress-tracker.md`

## What Each Spec File Explains

- `spec/BRD.md` explains the product requirements, MVP feature list, storage strategy, local-first constraints, and recommended JSON model.
- `spec/project-overview.md` summarizes the app, goals, user flow, feature scope, and success criteria.
- `spec/architecture.md` explains the stack, folder responsibilities, storage boundaries, file permission flow, and invariants.
- `spec/ui-context.md` explains the shadcn/ui Base Sera visual system, layout patterns, controls, and accessibility expectations.
- `spec/code-standards.md` explains TypeScript, React, Next.js, styling, data, storage, file organization, and verification rules.
- `spec/ai-workflow-rules.md` explains how agents should scope work, handle missing requirements, protect generated files, and keep docs updated.
- `spec/progress-tracker.md` explains what is done, what is in progress, what comes next, open questions, and architecture decisions.

## Guardrails

- Keep SkillMap local-first.
- Do not introduce a backend, database, OAuth, user accounts, or direct cloud storage API for the MVP.
- Use Client Components for planner features that touch browser APIs.
- Validate JSON before load and save.
- Store planner data in flattened arrays.
- Calculate progress from topics rather than storing progress percentages as source of truth.
- Update `spec/progress-tracker.md` after meaningful implementation changes.
