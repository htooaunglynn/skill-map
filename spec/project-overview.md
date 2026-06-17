# Project Overview

## Overview

SkillMap is a local-first learning planner for self-learners. It helps users organize courses, modules, topics, Markdown notes, bookmarks, and learning progress while keeping all personal data inside a local JSON file owned by the user.

## Goals

1. Give learners one clear place to plan and track self-study.
2. Keep the MVP simple, private, offline-friendly, and low-cost.
3. Avoid backend, database, authentication, and cloud API complexity.
4. Let users store their planner file anywhere, including cloud-synced folders such as Google Drive, iCloud Drive, or Dropbox.
5. Make progress visible without storing progress percentages as source-of-truth data.

## Core User Flow

1. User opens the SkillMap web app.
2. App checks browser support and existing local device setup.
3. User creates a new `skillmap.json` file or opens an existing one.
4. App validates the JSON structure before loading.
5. User creates courses, modules, topics, notes, and bookmarks.
6. User marks topics completed as they study.
7. App calculates course and module progress from completed topics.
8. App saves updates back to the selected JSON file when supported.
9. App autosaves draft state to IndexedDB and provides JSON export backup.

## Features

### MVP Features

- Local JSON file create, open, validate, save, import, and export.
- File System Access API support with IndexedDB-stored file handles.
- Fallback import/export flow for browsers without full file access.
- Device identity stored locally.
- Course, module, and topic management.
- Markdown notes linked to topics.
- Bookmarks linked to topics with URL validation.
- Topic completion tracking.
- Client-side course and module progress bars.
- Browser compatibility, reconnect, permission, autosave, and save status UI.

### Future Features

- Topic prerequisite lock system.
- Flashcards and active recall.
- Spaced repetition review scheduling.
- Study time estimates.
- Skill tree visualization.
- Achievement badges.
- Optional local PIN/password encryption with Web Crypto API.

## Scope

### In Scope

- Personal single-user planner.
- Pure browser-based app.
- User-owned local JSON file as primary storage.
- IndexedDB for autosave and saved file handles.
- LocalStorage for device ID and device name.
- Static deployment compatibility.

### Out of Scope

- Backend server.
- Database.
- User accounts.
- OAuth.
- Google Drive, iCloud, Dropbox, or other cloud provider APIs.
- Team or organization features.
- Real-time sync.
- Automatic merge conflict resolution.
- Mobile or desktop native app.

## Success Criteria

1. A user can create a new planner file and reopen it later.
2. A user can manage courses, modules, topics, notes, and bookmarks from the planner file.
3. Topic completion updates course and module progress without stored progress percentages.
4. The app works without a backend or remote database.
5. Unsupported browsers still have a usable import/export flow.
