Read `AGENTS.md` before starting.


We are building a local-first Learning Planner app using Next.js 16 (App Router) and TypeScript. There is NO backend and NO database. All data is stored in a single local JSON file.

Please create a new file `src/types/schema.ts`. Inside this file, define the TypeScript interfaces based on a flattened JSON structure. We need interfaces for:
1. SyncMetadata (last_saved_at, last_opened_at, last_device_id, last_device_name, devices array)
2. Course (id, title, description, category, goal, status, created_at, updated_at)
3. Module (id, course_id, title, description, order, created_at, updated_at)
4. Topic (id, module_id, title, description, completed, completed_at, prerequisites array, order, created_at, updated_at)
5. Note (id, topic_id, content, format, created_at, updated_at)
6. Bookmark (id, topic_id, title, url, description, created_at, updated_at)
7. SkillMapData (the root object containing version, app info, sync, courses, modules, topics, notes, and bookmarks arrays).

Export all these interfaces. Do not write any UI code yet.

### Check when done
`spec/progress-tracker.md`
