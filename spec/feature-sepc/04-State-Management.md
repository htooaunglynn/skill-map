Read `AGENTS.md` before starting.


We need a React Context to hold the in-memory state of the planner and manage the file connection status.

Create `src/context/PlannerContext.tsx`. It must be a `"use client"` component.
1. State should include: `data` (SkillMapData | null), `fileHandle` (FileSystemFileHandle | null), `connectionStatus` (e.g., 'no_file', 'connected', 'permission_required', 'fallback_mode'), and `isLoading`.
2. Provide functions to:
   - Load data (checks IndexedDB for a handle, asks for permission, reads file, sets state).
   - Update data in memory and automatically autosave to IndexedDB.
   - Save data to the actual file (validates, writes using `writePlannerFile`, updates sync metadata with the current device ID, and clears the autosave draft).
   - Export JSON Backup (creates a Blob and triggers a download for fallback mode).
3. Wrap `children` in this provider. Add it to the main `app/layout.tsx`.

### Check when done
`spec/progress-tracker.md`
