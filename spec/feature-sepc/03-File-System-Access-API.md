Read `AGENTS.md` before starting.

Next, let's implement the File System Access API logic to read and write the user's local JSON file.

Create `src/lib/storage/fileSystem.ts`. Write the following client-side functions:
1. `createPlannerFile()`: Opens a `showSaveFilePicker` for `skillmap.json` and writes a default empty `SkillMapData` structure to it. Returns the file handle.
2. `openPlannerFile()`: Opens a `showOpenFilePicker` to select an existing JSON file. Returns the file handle.
3. `readPlannerFile(fileHandle)`: Reads the text from the file handle and parses it into `SkillMapData`.
4. `writePlannerFile(fileHandle, data)`: Stringifies the data and writes it back to the file handle using `createWritable()`.
5. `verifyPermission(fileHandle, mode)`: Checks `queryPermission`. If not granted, calls `requestPermission`. Returns a boolean.

Ensure robust error handling. If the browser does not support `showOpenFilePicker` (fallback mode), throw a clear custom error so our UI can catch it later.

### Check when done
`spec/progress-tracker.md`
