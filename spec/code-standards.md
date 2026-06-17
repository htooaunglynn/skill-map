# Code Standards

## General

- Build small, focused modules that match the documented system boundaries.
- Prefer clear domain types and pure helper functions for planner data operations.
- Keep file access, validation, progress calculation, and UI composition separated.
- Do not add dependencies unless they directly support a documented requirement.
- Update the relevant `spec/` file when implementation changes product scope, architecture, UI rules, or workflow.

## TypeScript

- Keep strict TypeScript expectations throughout the project.
- Avoid `any`; use explicit interfaces, discriminated unions, or narrow `unknown` parsing.
- Validate external input from JSON files before trusting it.
- Use ISO date strings for persisted timestamps.
- Keep IDs stable and unique across each entity collection.

## Next.js and React

- Use Client Components for planner surfaces that need browser APIs, local state, file pickers, IndexedDB, LocalStorage, or Markdown editing.
- Add `"use client"` only to files that need client behavior.
- Do not access `window`, `localStorage`, `indexedDB`, or file APIs during server render.
- Put browser setup and permission checks inside `useEffect()` or user-triggered event handlers.
- Keep Server Components for static shell, metadata, or public-only pages.

## Styling

- Use Tailwind CSS and shadcn/ui tokens from `app/globals.css`.
- Prefer existing shadcn/ui components before creating custom controls.
- Use `cn()` from `lib/utils.ts` for conditional class composition.
- Keep dashboard UI dense, calm, and practical.
- Avoid decorative gradients, large marketing sections, and oversized hero layouts for the planner interface.

## Data and Storage

- Use a flattened JSON model with arrays for `courses`, `modules`, `topics`, `notes`, and `bookmarks`.
- Link records by IDs rather than nesting child arrays inside parent records.
- Calculate progress from topic completion state.
- Save notes as plain Markdown strings.
- Store autosave and file handles in IndexedDB, not LocalStorage.
- Store only device ID and device name in LocalStorage.

## File Organization

- `app/` - route-level UI and app shell.
- `components/ui/` - generated shadcn/ui primitives.
- `components/` - reusable SkillMap-specific components.
- `lib/` - schemas, storage helpers, file helpers, progress helpers, and shared utilities.
- `spec/` - project requirements and agent context.

## Verification

- Run `pnpm lint` after meaningful code changes.
- Run `pnpm build` before considering a feature complete.
- For UI changes, verify at desktop and mobile widths.
