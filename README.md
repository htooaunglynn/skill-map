# SkillMap

> A local-first learning planner for self-directed learners — goals, milestones, practice sessions, and progress notes, stored in a single JSON file you fully own.

**Live app:** [skill-map.htooaunglynn.uk](https://skill-map.htooaunglynn.uk)
**Author:** [Htoo Aung Lynn](https://htooaunglynn.uk)

## Why SkillMap

Most learning trackers lock your data behind an account, or scatter it across notes apps and spreadsheets. SkillMap keeps everything — active goals, milestones, practice sessions, and progress notes — in one focused dashboard, backed by a single `skillmap.json` file that lives on your device, an external drive, or a synced folder of your choice.

No accounts. No tracking. No cloud database. Your data stays yours.

## Features

- **Goals dashboard** — see active goals, milestones, sessions, and progress notes at a glance, with per-item progress bars.
- **Local JSON storage** — all data lives in a single user-owned `skillmap.json` file, not a server.
- **File System Access API** — open and save your file directly from the browser; the file handle is remembered in IndexedDB so you don't have to re-select it every visit.
- **JSON import/export fallback** — works in browsers without File System Access support.
- **Client-side progress tracking** — mark milestones complete and see progress recalculated instantly, with no server round-trip.
- **Privacy by design** — no backend, no authentication, no analytics.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui (Base, Sera preset)
- IndexedDB + File System Access API for local file persistence
- Deployed on Vercel

## How Your Data Is Stored

SkillMap has no backend, database, or cloud API. All data is read from and written to a single `skillmap.json` file:

- On browsers that support the File System Access API, SkillMap opens and saves the file directly, and remembers the file handle in IndexedDB so you don't have to reconnect it each session.
- On unsupported browsers, SkillMap falls back to manual JSON import/export.

You choose where the file lives — locally, on an external drive, or in a synced folder (Dropbox, iCloud, etc.) — and SkillMap never sends it anywhere else.

## Scope

The current release intentionally has no backend, database, authentication, OAuth, Google Drive API, account system, real-time sync, or server-side storage — everything runs client-side against your local file.

## Community

- Read `CONTRIBUTING.md` before opening a pull request.
- Follow `CODE_OF_CONDUCT.md` in project spaces.
- Report security vulnerabilities privately via `SECURITY.md`.
- Licensed under the MIT License — see `LICENSE`.
