# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js 16 App Router | Static-capable web app shell and routing |
| UI | React 19, Tailwind CSS, shadcn/ui Base Sera | Client UI and accessible components |
| Language | TypeScript | Type-safe domain model and browser logic |
| Primary storage | User-selected local JSON file | Source of truth for planner data |
| Browser storage | IndexedDB | Autosave drafts and saved `FileSystemFileHandle` values |
| Browser storage | LocalStorage | Device ID and device name |
| File access | File System Access API | Create, open, reconnect, and save local planner files |

## System Boundaries

- `app/` owns routes, layouts, and page-level composition.
- `components/ui/` contains generated shadcn/ui primitives and should stay framework-generated.
- `components/` should contain reusable SkillMap UI outside generated primitives.
- `lib/` should contain shared utilities, schema validation, storage helpers, file access helpers, and progress calculation logic.
- `spec/` owns product, architecture, workflow, UI, and implementation guidance.
- `public/` owns static assets.

## Storage Model

- **Local JSON file**: Primary source of truth for courses, modules, topics, notes, bookmarks, sync metadata, and future feature data.
- **IndexedDB**: Saved file handles, temporary autosave data, and recovery state.
- **LocalStorage**: Device identity only.

Data must use flattened arrays instead of deeply nested course/module/topic objects. Relationships are represented by IDs such as `course_id`, `module_id`, and `topic_id`.

## Auth and Access Model

- There is no authentication in the MVP.
- There are no users, roles, teams, organizations, or server-side permissions.
- Privacy depends on the user's local machine and where the user stores the JSON file.
- Optional future encryption must run locally in the browser.

## File Flow

1. User creates or opens `skillmap.json`.
2. App validates file shape and schema version.
3. App stores the file handle in IndexedDB when supported.
4. App checks `queryPermission()` before reading or writing.
5. App requests permission only from a user action when needed.
6. App writes validated JSON back to the same file when possible.
7. App falls back to import/export when direct write access is unavailable.

## Invariants

1. MVP code must not introduce a backend, database, OAuth, cloud API, or account system.
2. Planner data must not be uploaded to remote services.
3. Browser-only APIs must only run in Client Components and inside effects, event handlers, or guarded client code.
4. Progress percentages are derived from topics and must not become the primary source of truth.
5. JSON data must be validated before load and before save.
6. Generated shadcn/ui primitives should not be edited unless the change is explicitly required.
