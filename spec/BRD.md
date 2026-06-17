# Business Requirements Document
## Project: SkillMap / Learning Planner

## 1. Project Overview

The Learning Planner is a local-first web application that helps users organize, plan, and track their learning journey.

Users can create courses, modules, topics, notes, bookmarks, and progress records. The application stores all user data inside a single local JSON file on the user’s own machine.

The project does not require a backend server, database, user account, or cloud API for the MVP.

Users can save their JSON file anywhere they want, such as:

- Desktop
- Documents folder
- Google Drive synced folder
- iCloud Drive folder
- Dropbox folder
- External drive

The user fully owns and controls their learning data.

---

## 2. Business Goals

The main goals of this project are:

1. Help users organize their learning path clearly.
2. Allow users to track learning progress.
3. Support self-learning with structured courses and topics.
4. Keep the app simple and low-cost.
5. Remove backend, database, and authentication complexity.
6. Give users full ownership of their data.
7. Allow the app to work offline after it is loaded.
8. Make the app easy to deploy as a static web application.

---

## 3. Target Users

### 3.1 Primary Users

The main target users are self-learners.

Examples:

- Web developers
- Students
- Freelancers
- Career changers
- English learners
- Programming learners
- People learning new skills independently

### 3.2 User Type

For the MVP, the app only supports one user type:

```text
Personal User
```

There is no admin role, team role, or organization role in the MVP.

---

## 4. Problem Statement

Many learners use different tools separately, such as:

- Notion
- Google Docs
- Browser bookmarks
- Spreadsheets
- Notes apps
- Calendar apps

This creates problems:

- Learning progress is hard to track.
- Notes and resources are separated.
- Users forget what they already learned.
- Users do not know what to study next.
- There is no clear learning path.
- Learning data may be locked inside one platform.

The Learning Planner solves this by providing one simple local-first app for learning structure, notes, bookmarks, and progress tracking.

---

## 5. Proposed Solution

The Learning Planner will be a browser-based app built with Next.js 16 and shadcn/ui.

The user will open the app, create or select a local JSON file, and manage all learning data from that file.

The app will support:

- Courses
- Modules
- Topics
- Notes
- Bookmarks
- Completion tracking
- Progress bars
- Optional future flashcards
- Optional future spaced repetition
- Optional future local PIN encryption

The MVP will not use:

- Backend API
- Database
- OAuth
- Server authentication
- Google Drive API
- iCloud API

---

## 6. Tech Stack

## 6.1 Frontend

Technology:

```text
Next.js 16
React 19
TypeScript
shadcn/ui
Tailwind CSS
GASP
IndexedDB
File System Access API
Markdown Editor / Previewer
```

Responsibilities:

- Render the user interface.
- Manage routing.
- Manage client-side state.
- Read and write the local JSON file.
- Store temporary autosave data in IndexedDB.
- Store the selected file handle in IndexedDB when supported.
- Store device ID and device name in LocalStorage.
- Validate JSON structure.
- Calculate progress bars on the client-side.
- Display courses, modules, topics, notes, and bookmarks.
- Show file sync/save status.
- Show browser compatibility warning.
- Support fallback import/export flow for unsupported browsers.
- Work offline after the app has loaded.

Important note:

Progress calculation must happen on the client-side.

The app should calculate progress from raw data:

- Courses
- Modules
- Topics
- Completed status

The app should not store progress as the main source of truth.

Important implementation note:

This project is a pure client-side local-first app.

Even though it uses Next.js 16, most interactive planner pages should use Client Components.

Use `"use client"` for pages or components that need:

- `window`
- `localStorage`
- `indexedDB`
- File System Access API
- Markdown editor
- File picker
- Client-side state
- Browser-only APIs

Browser-only logic should run inside `useEffect()` to avoid hydration mismatch.

Example:

```tsx
"use client";

import { useEffect, useState } from "react";

export function PlannerBoot() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <div>Planner is ready</div>;
}
```

Recommended approach:

- Use Server Components only for static marketing or public pages.
- Use Client Components for the planner app.
- Do not access browser APIs during server render.
- Do not generate random device IDs during render.
- Generate device ID inside `useEffect()` or during user onboarding.

---

## 6.2 Backend

There is no backend server for the MVP.

Removed technologies:

```text
NestJS
Go API
Render backend
Database server
OAuth backend
API server
```

The app is a pure frontend local-first application.

All logic runs in the browser.

---

## 6.3 Storage

The MVP uses a hybrid local-first storage strategy.

Main storage:

```text
User-selected local JSON file
```

Temporary and fallback storage:

```text
IndexedDB
```

Device identity storage:

```text
LocalStorage
```

The user can:

- Create a new JSON file.
- Open an existing JSON file.
- Save updates to the same JSON file.
- Store the file in any local or cloud-synced folder.

Example file name:

```text
skillmap.json
```

Example cloud-sync usage:

```text
Google Drive folder / skillmap.json
iCloud Drive folder / skillmap.json
Dropbox folder / skillmap.json
```

The app does not directly connect to Google Drive or iCloud.

The user’s cloud sync provider handles syncing automatically.

### File Handle Storage

When the browser supports File System Access API, the app should store the selected `FileSystemFileHandle` in IndexedDB.

Purpose:

- Remember the user’s previously selected file.
- Avoid forcing the user to pick the file again every time.
- Improve the open-again experience.
- Allow the app to ask only for permission again when needed.

Important:

The file handle can be stored, but read/write permission may still need to be requested again after refresh or reopening the app.

Recommended UX:

```text
User opens app again
App checks IndexedDB for saved file handle
If file handle exists:
    Show "Reconnect Planner File" or "Grant Write Permission" button
User clicks button
App requests permission
App reads the file
App continues normally
```

Recommended buttons:

```text
Reconnect Planner File
Grant Write Permission
Open Different File
Create New Planner
```

Technical note:

The app should use permission checks before reading or writing.

Example permission flow:

```ts
async function verifyPermission(
  fileHandle: FileSystemFileHandle,
  mode: "read" | "readwrite" = "readwrite"
) {
  const options = { mode };

  if ((await fileHandle.queryPermission(options)) === "granted") {
    return true;
  }

  if ((await fileHandle.requestPermission(options)) === "granted") {
    return true;
  }

  return false;
}
```

---

## 7. Architecture Flow

## 7.1 MVP Architecture

```text
[Browser App: Next.js 16 + shadcn/ui]
        |
        v
[Local JSON File: skillmap.json]
```

## 7.2 Optional Cloud Sync Flow

```text
[Browser App]
        |
        v
[Local JSON File]
        |
        v
[User's Cloud-Synced Folder]
        |
        v
[Google Drive / iCloud / Dropbox Sync]
```

The app does not know or care which cloud provider is used.

The app only reads and writes the selected JSON file.

---

## 8. Main Modules and Features

## 8.1 Curriculum Management

### Feature: Courses / Topics Creation

Priority: High

Users can create courses or main learning topics.

Examples:

- Laravel
- English Speaking
- System Design
- Blockchain Basics
- React Advanced

Requirements:

- User can create a course.
- User can edit a course.
- User can delete a course.
- User can view course list.
- User can assign status to a course.
- User can add course description and learning goal.

Possible course status values:

```text
not_started
in_progress
completed
archived
```

---

### Feature: Modules & Sub-topics Hierarchy

Priority: High

Users can break a course into modules and topics.

Example:

```text
Course: Laravel
  Module: Authentication
    Topic: Login
    Topic: Register
    Topic: Password Reset
```

Requirements:

- User can create modules under a course.
- User can create topics under a module.
- User can reorder modules.
- User can reorder topics.
- User can mark a topic as completed.
- User can edit or delete modules and topics.
- The app should show the hierarchy clearly.

Data should be stored in flattened arrays, not deeply nested arrays.

---

### Feature: Prerequisites Lock System

Priority: Medium

Some topics can be locked until previous topics are completed.

Example:

```text
Topic: Laravel Policy
Prerequisite: Laravel Authentication
```

Requirements:

- User can set prerequisite topics.
- Locked topics should be visually marked.
- User should not mark a locked topic as completed before prerequisites are completed.
- The app should automatically unlock topics when prerequisites are completed.

---

## 8.2 Smart Scheduling

### Feature: Spaced Repetition System

Priority: Medium

The app can remind users to review topics after specific intervals.

Example review schedule:

```text
1 day
3 days
7 days
14 days
30 days
```

Requirements:

- App calculates next review date.
- User can see topics due for review.
- User can mark review as completed.
- Review history is stored in the JSON file.
- SRS logic runs fully on the client-side.

This feature is not required for MVP.

---

### Feature: Active Recall Prompts / Flashcards

Priority: Medium

Users can create flashcards for memory practice.

Example:

```text
Question: What is middleware in Laravel?
Answer: Middleware filters HTTP requests before reaching the controller.
```

Requirements:

- User can create flashcards.
- Flashcards can be linked to courses, modules, or topics.
- User can review flashcards.
- User can mark answer difficulty.
- Difficulty can affect next review date.

This feature is not required for MVP.

---

### Feature: Study Time Estimation

Priority: Low

Users can estimate how long each topic or course may take.

Requirements:

- User can enter estimated study time.
- App can calculate total course time.
- App can show remaining estimated time.
- Time estimation is optional.

This feature is not required for MVP.

---

## 8.3 Resource & Notes

### Feature: Bookmark References

Priority: High

Users can save useful learning links.

Examples:

- YouTube videos
- Documentation links
- Blog posts
- GitHub repositories
- Online courses

Requirements:

- User can add bookmark URLs.
- User can add title and description.
- User can link bookmarks to topics.
- User can edit bookmarks.
- User can delete bookmarks.
- App should validate URL format.

---

### Feature: Markdown Notes

Priority: High

Users can write Markdown notes for each topic.

Requirements:

- User can create notes.
- User can edit notes.
- User can delete notes.
- Notes should support Markdown syntax.
- Notes can be linked to topics.
- Notes should be stored as plain Markdown strings inside the JSON file.
- User can preview Markdown content.
- Markdown editor should be lightweight.

Recommended libraries:

```text
react-markdown
remark-gfm
SimpleMDE / EasyMDE-style lightweight editor
```

Not recommended for MVP:

```text
Monaco Editor
Heavy rich text editor
Complex Notion-style editor
```

Reason:

The app stores notes as simple Markdown strings. A lightweight editor keeps the app fast and easier to maintain.

---

## 8.4 Progress Tracking

### Feature: Progress Bars

Priority: High

Users can see learning progress visually.

Requirements:

- Course progress must be calculated on the client-side.
- Module progress must be calculated on the client-side.
- Progress should be calculated from completed topics.
- Progress should update automatically when a topic is completed.
- Progress should not be stored as the main source of truth.

Example:

```text
Laravel Course: 65% completed
Authentication Module: 100% completed
API Module: 40% completed
```

### Course Progress Calculation

Course progress is calculated by:

1. Finding all modules under the course.
2. Finding all topics under those modules.
3. Counting completed topics.
4. Calculating percentage.

Example logic:

```ts
const courseModules = modules.filter(
  module => module.course_id === course.id
);

const courseTopics = topics.filter(topic =>
  courseModules.some(module => module.id === topic.module_id)
);

const completedTopics = courseTopics.filter(topic => topic.completed);

const courseProgress =
  courseTopics.length === 0
    ? 0
    : Math.round((completedTopics.length / courseTopics.length) * 100);
```

### Module Progress Calculation

Module progress is calculated by:

1. Finding all topics under the module.
2. Counting completed topics.
3. Calculating percentage.

Example logic:

```ts
const moduleTopics = topics.filter(
  topic => topic.module_id === module.id
);

const completedTopics = moduleTopics.filter(
  topic => topic.completed
);

const moduleProgress =
  moduleTopics.length === 0
    ? 0
    : Math.round((completedTopics.length / moduleTopics.length) * 100);
```

---

## 8.5 Skill Trees

Priority: Low

Users can view learning paths visually as a tree.

Requirements:

- App can display course, module, and topic hierarchy visually.
- Completed topics should look different.
- Locked topics should look different.
- This feature should be added after the MVP.

---

## 8.6 Milestone Achievements & Badges

Priority: Low

Users can earn badges when they complete learning milestones.

Examples:

- First Course Created
- First Topic Completed
- 7 Days Study Streak
- 100 Flashcards Reviewed
- Course Completed

Requirements:

- App defines achievement rules.
- User can see earned badges.
- Achievement data is stored in JSON.
- This feature should be added after the MVP.

---

## 9. MVP Scope

The MVP should focus on the simplest useful version.

### MVP Features

1. User opens the app in browser.
2. App shows device setup when needed.
3. User creates a new JSON file.
4. User opens an existing JSON file.
5. App reads and validates the JSON file.
6. App stores file handle in IndexedDB when supported.
7. App reconnects saved file handle when supported.
8. App asks for write permission again when required.
9. App autosaves draft changes to IndexedDB.
10. App supports fallback import/export JSON flow.
11. User creates courses.
12. User creates modules.
13. User creates topics.
14. User creates Markdown notes.
15. User creates bookmarks.
16. User marks topics as completed.
17. App calculates progress bars on the client-side.
18. App saves updates back to the same JSON file when full file access is available.
19. App provides export JSON backup.
20. App shows browser compatibility and file save status.
21. User can manually place the JSON file in a cloud-synced folder.

### Not Included in MVP

These features are not included in the first version:

- Backend server
- Database
- Google OAuth
- Google Drive API
- iCloud API
- User accounts
- Team features
- Real-time sync
- Flashcards
- Spaced repetition
- Badges
- Skill tree visualization
- Automatic merge conflict resolution
- Mobile app
- Desktop app

---

## 10. Functional Requirements

## 10.1 Authentication

There is no authentication for the MVP.

Reason:

- The app is for personal use.
- The data is stored in the user’s local JSON file.
- There is no backend server.
- There is no database.
- There are no server accounts.

Optional future feature:

```text
Local PIN / Password Encryption
```

Future flow:

```text
User sets PIN
App encrypts JSON file using Web Crypto API
User opens app
User enters PIN
App decrypts JSON in browser memory
```

For MVP, encryption is optional and should not be required.

---

## 10.2 Local File Storage

The app should allow users to create and open a local JSON file.

Requirements:

- User can create a new `skillmap.json` file.
- User can open an existing `skillmap.json` file.
- App can read data from the selected JSON file.
- App can write updates back to the selected JSON file.
- App should validate the JSON structure before loading.
- App should validate the JSON structure before saving.
- App should show an error if the file format is invalid.
- App should store the selected file handle in IndexedDB when supported.
- App should ask the user to grant permission again when required.
- App should autosave temporary data to IndexedDB as a safety fallback.
- App should allow exporting a JSON backup.
- App should warn users to back up the file.
- User can store the file in Google Drive, iCloud Drive, Dropbox, or any other synced folder manually.

The app should not use Google Drive AppData folder in the MVP.

The app should not use OAuth in the MVP.

The app should not directly connect to cloud storage in the MVP.

### Permission Re-request Behavior

The app must handle browser permission re-request behavior.

Problem:

Some browsers may not keep read/write permission permanently after refresh, browser close, or tab close.

Requirements:

1. Store the file handle in IndexedDB.
2. On app start, check if the file handle exists.
3. Call `queryPermission()`.
4. If permission is not granted, show a user action button.
5. User clicks "Grant Write Permission".
6. App calls `requestPermission()`.
7. If granted, app reads/writes the file normally.

Recommended UX message:

```text
Your planner file is remembered, but the browser needs permission again.
Click "Grant Write Permission" to continue.
```

---

## 10.3 JSON Data Management

The app should use a flattened JSON structure.

The app should not store deeply nested arrays like:

```json
{
  "courses": [
    {
      "modules": [
        {
          "topics": []
        }
      ]
    }
  ]
}
```

Instead, it should store each entity in its own array.

Recommended structure:

```json
{
  "version": "1.0",
  "app": {
    "name": "SkillMap",
    "schema_version": "1.0"
  },
  "sync": {
    "last_saved_at": "2026-06-15T10:30:00.000Z",
    "last_opened_at": "2026-06-15T10:00:00.000Z",
    "last_device_id": "device_macbook_001"
  },
  "courses": [
    {
      "id": "c1",
      "title": "Laravel",
      "description": "Learn Laravel step by step",
      "category": "Backend",
      "goal": "Build Laravel API confidently",
      "status": "in_progress",
      "created_at": "2026-06-15T10:00:00.000Z",
      "updated_at": "2026-06-15T10:00:00.000Z"
    }
  ],
  "modules": [
    {
      "id": "m1",
      "course_id": "c1",
      "title": "Authentication",
      "description": "Laravel authentication basics",
      "order": 1,
      "created_at": "2026-06-15T10:05:00.000Z",
      "updated_at": "2026-06-15T10:05:00.000Z"
    }
  ],
  "topics": [
    {
      "id": "t1",
      "module_id": "m1",
      "title": "Login",
      "description": "Learn login flow",
      "completed": false,
      "completed_at": null,
      "prerequisites": [],
      "order": 1,
      "created_at": "2026-06-15T10:10:00.000Z",
      "updated_at": "2026-06-15T10:10:00.000Z"
    }
  ],
  "notes": [
    {
      "id": "n1",
      "topic_id": "t1",
      "content": "Login uses controller, request validation, and session.",
      "format": "markdown",
      "created_at": "2026-06-15T10:15:00.000Z",
      "updated_at": "2026-06-15T10:15:00.000Z"
    }
  ],
  "bookmarks": [
    {
      "id": "b1",
      "topic_id": "t1",
      "title": "Laravel Authentication Docs",
      "url": "https://laravel.com/docs/authentication",
      "description": "Official Laravel authentication documentation",
      "created_at": "2026-06-15T10:20:00.000Z",
      "updated_at": "2026-06-15T10:20:00.000Z"
    }
  ]
}
```

### Why Flattened Structure is Better

A flattened structure is better because:

- Updating one item is easier.
- Deleting one item is easier.
- Finding related data is easier.
- `map()`, `filter()`, `find()`, and `findIndex()` are simple to use.
- Frontend state management is cleaner.
- It avoids deeply nested update logic.
- It is easier to migrate later if the app adds a real database.

Example update using `map()`:

```ts
const updatedTopics = topics.map(topic =>
  topic.id === topicId
    ? {
        ...topic,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    : topic
);
```

Example update using `findIndex()`:

```ts
const topicIndex = topics.findIndex(topic => topic.id === topicId);

if (topicIndex !== -1) {
  topics[topicIndex] = {
    ...topics[topicIndex],
    completed: true,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
```

---

## 11. Non-Functional Requirements

## 11.1 Performance

Requirements:

- App should load quickly.
- JSON parsing should be fast for normal personal use.
- UI should remain responsive.
- Large notes should not freeze the app.
- App should avoid unnecessary re-renders.
- Progress calculation should be efficient.

For MVP, a single JSON file is acceptable.

If data grows too large later, the app can split data into multiple files.

---

## 11.2 Security

Requirements:

- User data should stay on the user’s machine.
- App should not upload user data to a server.
- App should not store private data in a remote database.
- App should not send notes or learning data to third-party APIs.
- App should clearly tell users where their data is stored.
- Optional encryption can be added later.

Important:

For MVP, privacy depends on where the user stores the JSON file.

If the user stores it in a shared folder, other people with access to that folder may see the file.

---

## 11.3 Reliability

The app should protect the user’s JSON data from accidental corruption.

Requirements:

- Validate JSON before loading.
- Validate JSON before saving.
- Keep current data in memory.
- Autosave temporary data to IndexedDB.
- Save valid JSON only.
- Show clear error messages and save status.
- Update `last_saved_at` after successful save.
- Track `last_device_id`.
- Warn the user before destructive actions.
- Provide manual export/backup option.

### Safe-Write Strategy

Because the app writes directly to a user-selected file, it should avoid writing broken JSON.

Recommended safe-write flow:

```text
1. User makes a change.
2. App updates data in memory.
3. App autosaves draft data to IndexedDB.
4. App validates updated data.
5. App converts data to formatted JSON.
6. App checks write permission.
7. App writes valid JSON to the selected file.
8. App closes the writable stream.
9. App updates `last_saved_at`.
10. App clears or marks the draft as synced.
11. App shows "Saved to file".
```

Recommended UI save statuses:

```text
No file selected
Draft autosaved
Unsaved changes
Saving...
Saved to file
Save failed
Permission required
File disconnected
```

If file save fails:

```text
1. Keep the latest data in IndexedDB draft.
2. Show "Save failed" or "Permission required".
3. Allow user to grant permission again.
4. Allow user to export JSON backup.
```

### Optional Backup Strategy

The MVP can include manual backup:

```text
Export Backup
```

This lets the user download a copy like:

```text
skillmap-backup-2026-06-15.json
```

Automatic backup can be added later.

---

## 11.4 Scalability

The MVP is designed for personal use.

Expected data size:

- Dozens of courses
- Hundreds of topics
- Hundreds or thousands of notes/bookmarks

If data becomes too large, future improvements may include:

- Split file by course
- IndexedDB cache
- Desktop app with Tauri
- Real database
- Cloud sync provider integration

---

## 11.5 Usability

Requirements:

- UI should be simple and clean.
- User should clearly see what to study next.
- User should clearly see progress.
- User should easily add notes and bookmarks.
- User should understand whether the file is saved.
- User should receive warnings if the file is not selected.
- User should receive warnings if browser support is limited.

---

## 11.6 Browser Compatibility and Fallback Storage

The app should clearly document browser support and support two storage modes.

### Mode 1: Full File Access Mode

Used when File System Access API is available.

Recommended browsers for MVP:

```text
Google Chrome
Microsoft Edge
Brave
Other Chromium-based browsers
```

Features:

- Open local JSON file.
- Save directly to the same file.
- Store file handle in IndexedDB.
- Reconnect file handle after reopening app.
- Ask permission again when required.

### Mode 2: Fallback Autosave Mode

Used when File System Access API is not available or limited.

Examples:

```text
Safari
Firefox
Some mobile browsers
```

Fallback behavior:

- User can import JSON file.
- App loads data into browser memory.
- App autosaves data to IndexedDB.
- App cannot directly overwrite the original file.
- User can export/download updated JSON backup.

Requirements:

- App must autosave changes to IndexedDB.
- App must show clear message that direct file save is not supported.
- App must provide "Export JSON Backup".
- App must remind user to export backup after changes.

Recommended UX message:

```text
Your browser does not fully support direct file saving.
Your changes are autosaved in this browser.
Please export a JSON backup regularly.
```

Fallback buttons:

```text
Import JSON
Continue from Browser Autosave
Export JSON Backup
Clear Browser Autosave
```

---

## 12. Data Save and Sync Requirements

## 12.1 Local Save Flow

```text
User opens app
App checks device identity from LocalStorage
App checks saved file handle from IndexedDB
If file handle exists:
    App asks user to grant permission if needed
If no file handle:
    User creates or opens JSON file
App reads file
App validates JSON
App loads data into memory
User edits learning data
App autosaves draft to IndexedDB
App validates updated data
App writes updated JSON back to same file
App updates last_saved_at and last_device_id
App shows Saved to file
```

---

## 12.2 Fallback Autosave Flow

```text
User opens app in unsupported browser
App checks IndexedDB autosave data
User imports JSON or continues autosaved draft
User edits data
App autosaves to IndexedDB
App shows Draft autosaved
User exports JSON backup manually
```

Important:

Fallback autosave is not the same as saving to the original file.

The app must explain this clearly.

---

## 12.3 Create New File Flow

```text
User clicks Create New Planner
App creates default JSON structure
User chooses save location
App writes skillmap.json
App loads new planner data
```

Default file name:

```text
skillmap.json
```

---

## 12.4 Open Existing File Flow

```text
User clicks Open Existing Planner
Browser file picker opens
User selects skillmap.json
App reads file
App validates schema version
App loads planner data
```

---

## 12.5 Manual Cloud Sync Flow

The app does not directly sync with cloud providers.

The user can manually place the JSON file in a cloud-synced folder.

Example:

```text
Google Drive/SkillMap/skillmap.json
iCloud Drive/SkillMap/skillmap.json
Dropbox/SkillMap/skillmap.json
```

The cloud provider handles syncing.

The app only reads and writes the file.

---

## 12.6 Device Save Tracking

The app should identify each browser/device.

Recommended approach:

On first app launch, ask the user to enter a device name.

Examples:

```text
Htoo's MacBook Air
Office PC
Home Laptop
```

Then the app should generate a random UUID and store it in LocalStorage.

Do not use invasive browser fingerprinting for MVP.

Use:

```text
User-provided device name
Random UUID
LocalStorage
```

The JSON file should include save metadata.

Example:

```json
{
  "sync": {
    "last_saved_at": "2026-06-15T10:30:00.000Z",
    "last_opened_at": "2026-06-15T10:00:00.000Z",
    "last_device_id": "device_8f1f7e3b-91a4-4a0c-9fb1-a76a3b57f481",
    "last_device_name": "Htoo's MacBook Air",
    "devices": [
      {
        "device_id": "device_8f1f7e3b-91a4-4a0c-9fb1-a76a3b57f481",
        "device_name": "Htoo's MacBook Air",
        "last_opened_at": "2026-06-15T10:00:00.000Z",
        "last_saved_at": "2026-06-15T10:30:00.000Z"
      }
    ]
  }
}
```

Purpose:

- Show which device saved the file last.
- Help users understand if another device may have newer data.
- Help detect possible outdated file edits.
- Help warn users before overwriting newer data.

---

## 12.7 Conflict Handling

Possible conflict examples:

- User opens the same file on two devices.
- User edits the file before cloud sync finishes.
- Cloud provider creates a conflict copy.
- User opens an older version of the JSON file.
- Browser has an older or newer autosaved draft.
- File was changed outside the app.

Requirements:

- App should track `last_saved_at`.
- App should track `last_device_id`.
- App should track `last_device_name`.
- App should compare loaded file metadata with browser autosave metadata.
- App should warn if file metadata looks older than current memory data.
- App should not silently overwrite suspicious newer data.
- App should keep autosaved draft until user confirms.
- App should provide export backup before conflict resolution.
- App should show a clear warning when conflict is possible.

Example warning:

```text
This file may have been changed from another device. Please review before saving.
```

Example autosave warning:

```text
You have a newer autosaved draft in this browser than the selected JSON file.
Do you want to continue with autosaved data or load the selected file?
```

Example options:

```text
Continue Autosaved Draft
Load Selected File
Export Autosaved Backup First
```

Important:

The MVP does not need advanced merge conflict resolution.

---

## 13. User Roles

For MVP, there is only one role.

### Role: Personal User

Permissions:

- Create own planner file.
- Open own planner file.
- Manage own courses.
- Manage own modules.
- Manage own topics.
- Manage own notes.
- Manage own bookmarks.
- Track own progress.
- Export backup.

Future roles are out of scope.

---

## 14. Local Function Requirements

There are no backend API endpoints in the MVP.

Instead, the app should use local browser functions and internal client-side services.

## 14.1 File Functions

```ts
createPlannerFile()
openPlannerFile()
readPlannerFile()
writePlannerFile()
exportBackupFile()
validatePlannerJson()
```

## 14.2 File Handle Functions

```ts
saveFileHandleToIndexedDB()
getFileHandleFromIndexedDB()
clearSavedFileHandle()
queryFilePermission()
requestFilePermission()
reconnectPlannerFile()
```

## 14.3 Autosave Functions

```ts
saveDraftToIndexedDB()
getDraftFromIndexedDB()
clearDraftFromIndexedDB()
hasUnsavedDraft()
compareDraftWithFile()
```

## 14.4 Device Identity Functions

```ts
getDeviceIdentity()
createDeviceIdentity()
updateDeviceName()
saveDeviceIdentityToLocalStorage()
```

## 14.5 Course Functions

```ts
createCourse()
updateCourse()
deleteCourse()
getCourses()
getCourseById()
```

## 14.6 Module Functions

```ts
createModule()
updateModule()
deleteModule()
getModulesByCourseId()
reorderModules()
```

## 14.7 Topic Functions

```ts
createTopic()
updateTopic()
deleteTopic()
getTopicsByModuleId()
completeTopic()
reorderTopics()
```

## 14.8 Note Functions

```ts
createNote()
updateNote()
deleteNote()
getNotesByTopicId()
renderMarkdownPreview()
```

## 14.9 Bookmark Functions

```ts
createBookmark()
updateBookmark()
deleteBookmark()
getBookmarksByTopicId()
validateBookmarkUrl()
```

## 14.10 Progress Functions

```ts
calculateCourseProgress()
calculateModuleProgress()
getCompletedTopicCount()
getTotalTopicCount()
```

Progress functions should run only on the client-side.

---

## 15. Success Criteria

The MVP will be successful if:

1. User can open the app in browser.
2. User can create a new `skillmap.json` file.
3. User can open an existing `skillmap.json` file.
4. User can create courses, modules, and topics.
5. User can write Markdown notes.
6. User can add bookmarks.
7. User can mark topics as completed.
8. App calculates progress correctly on the client-side.
9. App saves changes back to the selected JSON file when full file access is available.
10. App autosaves draft changes to IndexedDB.
11. App provides fallback import/export for unsupported browsers.
12. App can reconnect a remembered file handle and request permission again.
13. User can place the file in a cloud-synced folder manually.
14. App works without backend server.
15. App works without database.
16. App works without login.
17. App can be deployed with very low or zero hosting cost.

---

## 16. Risks and Challenges

### Risk 1: Permission Re-request

The browser may ask for file permission again after refresh or reopening the app.

Mitigation:

- Store file handle in IndexedDB.
- Use `queryPermission()`.
- Show "Grant Write Permission" button.
- Do not force user to select the file again if file handle exists.

---

### Risk 2: Browser Compatibility

File System Access API may not work in all browsers.

Mitigation:

- Recommend Chrome, Edge, or Brave.
- Show browser compatibility warning.
- Support fallback autosave with IndexedDB.
- Support Import JSON.
- Support Export JSON Backup.

---

### Risk 3: User Loses JSON File

If the user deletes or loses the JSON file, the app cannot recover it.

Mitigation:

- Show backup reminder.
- Autosave draft in IndexedDB.
- Add Export Backup feature.
- Recommend storing the file in a cloud-synced folder.
- Add clear onboarding instructions.

---

### Risk 4: File Conflict Between Devices

If the user edits the same file on multiple devices before cloud sync completes, conflict can happen.

Mitigation:

- Track `last_saved_at`.
- Track `last_device_id`.
- Track `last_device_name`.
- Warn before overwriting suspicious data.
- Keep autosaved draft until user confirms.
- Let cloud provider create conflict copies.
- Add manual conflict review later.

---

### Risk 5: Data Corruption

Bad write behavior or invalid JSON can corrupt the file.

Mitigation:

- Validate before saving.
- Keep autosaved draft in IndexedDB.
- Save only valid JSON.
- Show save failure clearly.
- Keep in-memory copy until save succeeds.
- Provide manual backup export.

---

### Risk 6: Large JSON File

If the file becomes too large, the app may become slower.

Mitigation:

- Use flattened JSON structure.
- Keep progress calculated, not stored.
- Avoid unnecessary duplicate data.
- Add split-file storage later if needed.

---

### Risk 7: No Account Recovery

Because there is no server account, there is no account recovery.

Mitigation:

- Tell users clearly that they own the file.
- Recommend cloud backup.
- Optional encryption should warn users that lost password means lost data.

---

### Risk 8: Hydration Errors in Next.js

Browser-only APIs can cause hydration errors if used during server render.

Mitigation:

- Use `"use client"` for planner components.
- Access browser APIs inside `useEffect()`.
- Render stable fallback UI before client is ready.
- Do not use `window`, `localStorage`, or `indexedDB` during server render.

---

## 17. Recommended Development Phases

## Phase 1: MVP Local Planner

Goal:

Build a working local-first planner.

Features:

- Next.js 16 setup
- shadcn/ui setup
- Create new JSON file
- Open existing JSON file
- Read/write JSON file
- Store file handle in IndexedDB
- Reconnect saved file handle
- Grant write permission button
- IndexedDB autosave draft
- Fallback import/export JSON flow
- Device setup modal
- Courses
- Modules
- Topics
- Markdown notes
- Bookmarks
- Client-side progress bars
- Manual backup export
- Browser compatibility warning
- File save status component

---

## Phase 2: Better Learning Experience

Goal:

Improve learning usefulness.

Features:

- Spaced repetition
- Flashcards
- Review dashboard
- Study time estimation
- Better search and filters

---

## Phase 3: Visual Progress

Goal:

Make learning progress more motivating.

Features:

- Skill tree
- Badges
- Milestones
- Study streaks
- Dashboard analytics

---

## Phase 4: Privacy and Desktop

Goal:

Improve privacy and local file access.

Features:

- Optional PIN/password encryption
- Web Crypto API encryption
- Tauri desktop app
- Better file system access
- Auto backup folder
- Multi-file storage

---

## Phase 5: Optional Cloud Integration

Goal:

Add direct cloud integration only if needed.

Possible features:

- Google Drive API
- iCloud integration if practical
- OAuth login
- Cloud conflict detection
- Multi-device sync

This phase is optional and should not be part of the MVP.

---

## 18. Recommended MVP Data Model

The MVP should use a flattened JSON structure.

Main arrays:

```text
courses
modules
topics
notes
bookmarks
```

Optional future arrays:

```text
flashcards
reviews
badges
study_sessions
```

---

### Root JSON Structure

```json
{
  "version": "1.0",
  "app": {
    "name": "SkillMap",
    "schema_version": "1.0"
  },
  "sync": {
    "last_saved_at": null,
    "last_opened_at": null,
    "last_device_id": null,
    "last_device_name": null,
    "devices": []
  },
  "courses": [],
  "modules": [],
  "topics": [],
  "notes": [],
  "bookmarks": []
}
```

---

### Course

Fields:

- id
- title
- description
- category
- goal
- status
- created_at
- updated_at

Example:

```json
{
  "id": "c1",
  "title": "Laravel",
  "description": "Learn Laravel step by step",
  "category": "Backend",
  "goal": "Build Laravel API confidently",
  "status": "in_progress",
  "created_at": "2026-06-15T10:00:00.000Z",
  "updated_at": "2026-06-15T10:00:00.000Z"
}
```

---

### Module

Fields:

- id
- course_id
- title
- description
- order
- created_at
- updated_at

Example:

```json
{
  "id": "m1",
  "course_id": "c1",
  "title": "Authentication",
  "description": "Learn login, register, and password reset",
  "order": 1,
  "created_at": "2026-06-15T10:05:00.000Z",
  "updated_at": "2026-06-15T10:05:00.000Z"
}
```

---

### Topic

Fields:

- id
- module_id
- title
- description
- completed
- completed_at
- prerequisites
- order
- created_at
- updated_at

Example:

```json
{
  "id": "t1",
  "module_id": "m1",
  "title": "Login",
  "description": "Learn login flow",
  "completed": false,
  "completed_at": null,
  "prerequisites": [],
  "order": 1,
  "created_at": "2026-06-15T10:10:00.000Z",
  "updated_at": "2026-06-15T10:10:00.000Z"
}
```

---

### Note

Fields:

- id
- topic_id
- content
- format
- created_at
- updated_at

Example:

```json
{
  "id": "n1",
  "topic_id": "t1",
  "content": "Login uses controller, request validation, and session.",
  "format": "markdown",
  "created_at": "2026-06-15T10:15:00.000Z",
  "updated_at": "2026-06-15T10:15:00.000Z"
}
```

---

### Bookmark

Fields:

- id
- topic_id
- title
- url
- description
- created_at
- updated_at

Example:

```json
{
  "id": "b1",
  "topic_id": "t1",
  "title": "Laravel Authentication Docs",
  "url": "https://laravel.com/docs/authentication",
  "description": "Official Laravel authentication documentation",
  "created_at": "2026-06-15T10:20:00.000Z",
  "updated_at": "2026-06-15T10:20:00.000Z"
}
```

---

### Device

Fields:

- device_id
- device_name
- last_opened_at
- last_saved_at

Example:

```json
{
  "device_id": "device_8f1f7e3b-91a4-4a0c-9fb1-a76a3b57f481",
  "device_name": "Htoo's MacBook Air",
  "last_opened_at": "2026-06-15T10:00:00.000Z",
  "last_saved_at": "2026-06-15T10:30:00.000Z"
}
```

---

### Local Browser Metadata

This data should not be stored inside `skillmap.json`.

It should be stored in LocalStorage or IndexedDB.

LocalStorage:

```json
{
  "device_id": "device_8f1f7e3b-91a4-4a0c-9fb1-a76a3b57f481",
  "device_name": "Htoo's MacBook Air"
}
```

IndexedDB:

```text
saved_file_handle
autosave_draft
last_autosave_at
```

Reason:

- `skillmap.json` stores planner data.
- LocalStorage stores current browser/device identity.
- IndexedDB stores browser-only file handle and autosave draft.

---

### Progress

Progress should not be stored as a table or main data array.

Progress should be calculated from topics.

Reason:

- Avoid duplicate data.
- Prevent wrong progress values.
- Keep JSON clean.
- Keep source of truth simple.

Example:

```ts
const moduleTopics = topics.filter(
  topic => topic.module_id === module.id
);

const completedTopics = moduleTopics.filter(
  topic => topic.completed
);

const progress =
  moduleTopics.length === 0
    ? 0
    : Math.round((completedTopics.length / moduleTopics.length) * 100);
```

---

## 19. UI Requirements

The app should use shadcn/ui components.

Recommended UI pages:

### 19.1 Welcome Page

Purpose:

Help user start quickly.

Actions:

- Create New Planner
- Open Existing Planner
- Import JSON
- Learn how data storage works

---

### 19.2 Dashboard Page

Purpose:

Show learning overview.

Display:

- Total courses
- In-progress courses
- Completed topics
- Today review items in future phase
- Recent notes
- Overall progress

---

### 19.3 Courses Page

Purpose:

Manage all courses.

Features:

- Course list
- Create course
- Edit course
- Delete course
- Filter by status
- Search courses

---

### 19.4 Course Detail Page

Purpose:

Manage modules and topics inside a course.

Features:

- Course information
- Module list
- Topic list
- Progress bar
- Add module
- Add topic
- Complete topic

---

### 19.5 Topic Detail Page

Purpose:

Study one topic deeply.

Features:

- Topic description
- Completion checkbox
- Markdown notes
- Bookmarks
- Prerequisites
- Related resources

---

### 19.6 Settings Page

Purpose:

Manage app and file settings.

Features:

- Current file name
- Last saved time
- Device name
- Export backup
- Browser compatibility info
- Optional future encryption settings

---

### 19.7 File Connection Status Component

Purpose:

Show the current file status clearly.

Possible states:

```text
No file selected
File connected
Permission required
Draft autosaved
Saved to file
Save failed
Fallback mode
```

Recommended actions:

```text
Open Planner File
Create New Planner
Grant Write Permission
Reconnect Planner File
Export Backup
Clear Autosave
```

---

### 19.8 Device Setup Modal

Purpose:

Set device identity on first app launch.

Fields:

```text
Device Name
```

Examples:

```text
Htoo's MacBook Air
Home Laptop
Office PC
```

The app should generate `device_id` automatically.

---

### 19.9 Browser Compatibility Notice

Purpose:

Tell the user what storage mode they are using.

Example for supported browser:

```text
Full file access is supported. Your app can save directly to your selected JSON file.
```

Example for unsupported browser:

```text
Direct file saving is not fully supported in this browser. Your changes will be autosaved in this browser. Please export a JSON backup regularly.
```

---

## 20. Out of Scope for MVP

The following are not part of MVP:

- Backend API
- NestJS
- Go backend
- Render deployment
- Database
- Google OAuth
- Google Drive API
- iCloud API
- User login
- Team workspace
- Public course sharing
- Real-time collaboration
- AI tutor
- Payment system
- Mobile app
- Desktop app
- Server-side sync

---

## 21. Deployment

The app can be deployed as a static or mostly static web app.

Recommended deployment:

```text
Cloudflare Pages
```

Important:

Even though the app is hosted online, the user’s learning data is not stored on the hosting server.

The hosted app only provides the user interface.

User data stays in the selected local JSON file.

---

## 22. Conclusion

The revised Learning Planner is a local-first personal learning app.

The project should use:

```text
Next.js 16
shadcn/ui
TypeScript
Tailwind CSS
Local JSON file
File System Access API
IndexedDB
LocalStorage
Markdown Editor / Previewer
```

The project should not use:

```text
Backend server
Database
OAuth
Google Drive API
Cloud AppData folder
Server authentication
```

This architecture is simpler, cheaper, more private, and easier to build for MVP.

The main source of truth is still the user’s `skillmap.json` file.

IndexedDB is used only for:

- Remembering file handle
- Temporary autosave draft
- Fallback browser mode

LocalStorage is used only for:

- Device ID
- Device name

The recommended MVP should focus on:

1. Local JSON file create/open/save
2. File handle reconnection and permission recovery
3. IndexedDB autosave/fallback storage
4. Course/module/topic management
5. Markdown notes and bookmarks
6. Client-side progress calculation
7. Manual backup/export
8. Clear browser compatibility warning


---


# Finish

pnpm create next-app@latest . --yes
pnpm dlx shadcn@latest init
   - Select a component library › Base
   - Which preset would you like to use? › Sera

## For your main multi-pane dashboard layout & grids
npx shadcn@latest add card separator

## For buttons, forms, and marking topics as completed
npx shadcn@latest add button checkbox input label

## For clean markdown writing areas or adding descriptions
npx shadcn@latest add textarea

## For smooth minimalist context menus, dropdowns, and dialogs
npx shadcn@latest add dropdown-menu dialog

## For interactive progress bars (Crucial for Course/Module Progress)
npx shadcn@latest add progress
