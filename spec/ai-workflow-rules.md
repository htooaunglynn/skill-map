# AI Workflow Rules

## Approach

Build SkillMap incrementally from the documented requirements. The `spec/` files define what to build, how the system is shaped, and what is currently in progress. Read the docs first, implement one clear unit at a time, verify it, then update `spec/progress-tracker.md`.

## Required Reading Order

1. `spec/BRD.md`
2. `spec/project-overview.md`
3. `spec/architecture.md`
4. `spec/ui-context.md`
5. `spec/code-standards.md`
6. `spec/ai-workflow-rules.md`
7. `spec/progress-tracker.md`

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over broad speculative changes.
- Keep product behavior aligned with the BRD and context files.
- Do not introduce backend, database, authentication, or cloud API work unless the specs are intentionally changed first.
- Avoid mixing unrelated storage, UI, and data-model changes in one step.

## When to Split Work

Split an implementation step if it combines:

- File access and unrelated visual redesign.
- Data schema changes and unrelated component refactors.
- Multiple feature areas such as notes, bookmarks, and progress.
- Behavior not clearly defined in the spec files.

If a change cannot be verified end to end quickly, split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the spec files.
- If a requirement is ambiguous, add the decision or open question to `spec/progress-tracker.md`.
- If a new decision affects architecture, storage, UI, or standards, update the matching `spec/` file before continuing.

## Protected Files

Do not modify these unless explicitly instructed or required by a shadcn/ui migration:

- `components/ui/*`
- `components.json`
- `pnpm-lock.yaml` except through package manager commands
- Generated Next.js and TypeScript environment files

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- MVP scope or user flow.
- System architecture or storage model.
- JSON schema or persistence rules.
- UI layout patterns or component conventions.
- Code standards or file organization.

Update `spec/progress-tracker.md` after every meaningful implementation change.

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant in `spec/architecture.md` was violated.
3. `spec/progress-tracker.md` reflects completed work and next steps.
4. `pnpm lint` passes.
5. `pnpm build` passes when the change is more than documentation.
