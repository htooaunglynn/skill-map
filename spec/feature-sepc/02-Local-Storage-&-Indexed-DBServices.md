Read `AGENTS.md` before starting.


Now, let's create the local storage and IndexedDB utility functions. Remember, all of this must run on the client side.

1. Create `src/lib/storage/device.ts`. Write functions using `localStorage` to check for an existing `device_id` and `device_name`. If they don't exist, create a function to generate a random UUID for the device ID and save it.
2. Create `src/lib/storage/indexeddb.ts`. We need functions to:
   - Save a `FileSystemFileHandle` to IndexedDB (so the user doesn't have to pick the file every time).
   - Get the saved `FileSystemFileHandle` from IndexedDB.
   - Clear the saved file handle.
   - Save a temporary JSON draft of `SkillMapData` to IndexedDB (for autosave fallback).
   - Retrieve the temporary JSON draft.

Use standard browser APIs for IndexedDB or a lightweight wrapper if you prefer, but keep it simple. Add `"use client"` directives if necessary, though these should purely be utility functions.

### Check when done
`spec/progress-tracker.md`
