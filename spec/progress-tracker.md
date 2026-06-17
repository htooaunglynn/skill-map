# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Foundation setup and documentation alignment.

## Current Goal

- Continue building the local-first MVP foundation from the feature specs.

## Completed

- Next.js app created with pnpm.
- shadcn/ui initialized with Base Sera preset.
- Core UI components installed: card, separator, button, checkbox, input, label, textarea, dropdown-menu, dialog, and progress.
- Spec context files flattened into `spec/`.
- Root `README.md`, `AGENTS.md`, and `CLAUDE.md` describe the project flow and required spec reading order.
- `01-Core-Types-and-Data-Models` implemented with flattened planner interfaces in `src/types/schema.ts`.
- `02-Local-Storage-&-Indexed-DBServices` implemented with LocalStorage device helpers and IndexedDB file handle/autosave helpers.
- `03-File-System-Access-API` implemented with local planner file create/open/read/write and permission helpers.
- `04-State-Management` implemented with a client-side planner context, file connection status, autosave, save, and JSON backup export.
- `05-Dashboard-&-File-Connection-UI` implemented with the dashboard page, file connection status controls, and summary cards.
- `06-Curriculum-Management` implemented with course list/create and course detail/module create pages.
- `07-Topics-Notes-&-Checkboxes` implemented with topic lists, completion checkboxes, Markdown notes, bookmarks, and accessible save-to-file toast feedback.
- `08-Device-Setup-&-Polish` implemented with required device onboarding, dashboard GSAP fade-in, and hydration/immutable update review.
- `09-Milestones-Goals-Plans-Sections-CRUD-GSAP-Animations` (superseded) implemented the first goal/plan/section model and the centralized GSAP helpers/hooks/animated progress that remain in use.
- `09 (replacement) — Goals, Milestones, Practice Sessions, Progress Notes` implemented the current goal model: goals own ordered milestones, practice sessions, and progress notes (flattened top-level arrays in `src/types/schema.ts` with cascade/null-out delete rules in `PlannerContext`). Added `goalHelpers` derived/search functions; goal-based `MilestoneList`/`MilestoneItem`/`MilestoneFormDialog` with checkbox toggle and up/down reorder; `/sessions` and `SessionCard`/`SessionFormDialog` with inline status updates; `/progress-notes` list + `[id]` detail with `ProgressNoteCard`/`ProgressNoteFormDialog`; goal detail page with Milestones/Sessions/Notes tabs; `/goals/dashboard` with active goals, upcoming sessions, overdue milestones, recent notes, and count-up completion summary plus cross-section search; navigation links added. Milestones were detached from the course detail page (course/module/topic/note/bookmark flows untouched). Form dialogs use a mount-on-open inner-form pattern to keep lint clean. `pnpm lint` and `pnpm build` pass.
- Goals dashboard is now the main `/` dashboard with `FileConnectionStatus` placed below the header and above the shadcn `Input` search. `/goals/dashboard` redirects to `/`. Course and plan UI routes were removed from the app surface while legacy schema/context fields remain for backward compatibility with existing planner JSON files.
- Goals dashboard header now gates on required device setup, displays `Goals Dashboard - {device name}`, removes the dashboard-wide search input, and adds left-side navigation buttons for Goals, Milestones, Progress Notes, and Sessions.
- Standalone `/milestones` page added for all-goal milestone management. Dashboard nav links now use semantic styled `Link` elements instead of rendering links through Base UI `Button`, fixing the native button console warning; the Milestones nav points to `/milestones`.
- Global creator attribution footer added with `Created by Htoo Aung Lynn` and the external portfolio link `https://htooaunglynn.uk`; app metadata now includes the creator.

## In Progress

- No feature unit is currently in progress.

## Next Up

- Add schema validation helpers for local JSON file loading and saving.
- Build fallback import/export flow for browsers without full file access.
- Prepare MVP hardening pass for validation, fallback import/export, and navigation polish.

## Open Questions

- Which schema validation library should be used, if any, for the local JSON file?
- What ID format should persisted entities use for MVP: `crypto.randomUUID()` or a custom readable prefix?
- Should the first usable build start with file onboarding or static sample data?

## Architecture Decisions

- MVP is a pure client-side local-first app.
- The local JSON file is the source of truth.
- IndexedDB is used for autosave and file handles.
- LocalStorage is limited to device identity.
- Data uses flattened arrays rather than nested course/module/topic trees.
- Progress is calculated from completed topics and not stored as the primary source of truth.

## Session Notes

- The old nested spec entry docs were removed after their useful workflow was moved to root-level agent docs.
- Prompt 09 completed: `pnpm lint` and `pnpm build` pass after adding Goals, Plans, Milestones, inline section CRUD, centralized animation helpers, and route/navigation updates.
- Prompt 09 replacement completed: migrated to the goal → milestones/practice_sessions/progress_notes model. The data layer (schema, context actions, helpers, GSAP system) was already present from a prior run, but the UI still referenced the removed section model and did not build; rebuilt the milestone UI, added the sessions/progress-notes/goal-dashboard features, and detached milestones from courses. The obsolete `GoalSection`/`MilestoneSection` form components were deleted. `DEFAULT_PLANNER_DATA` now seeds `practice_sessions` and `progress_notes`. `pnpm lint` (0 errors) and `pnpm build` pass.
- Dashboard cleanup completed: the old course-summary root dashboard was replaced by the goals dashboard, planner file connection is available on the main dashboard, course/plan pages and plan UI components were removed, and remaining search fields use the shadcn `Input` component.
- Dashboard device/header update completed: device setup is owned by the main dashboard gate, the saved device name appears in the dashboard title, dashboard quick navigation moved into the overview header, and the dashboard search input was removed.
- Milestones page completed: `/milestones` lists milestones with parent goal context and supports add/edit/delete/complete flows. Existing goal-detail milestone dialogs continue using fixed-goal mode, while standalone creation can select a goal.
- Creator attribution completed: a subtle global footer appears under app pages and links to Htoo Aung Lynn's portfolio.
