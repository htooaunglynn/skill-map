Read `AGENTS.md` before starting.


Let's build the initial UI. We are using shadcn/ui components and Tailwind CSS. All interactive pages must use `"use client"`.

1. Update `app/page.tsx` to act as the Welcome/Dashboard page.
2. Create a component `src/components/FileConnectionStatus.tsx`. It should consume the `PlannerContext`.
   - If no file is selected: Show buttons to "Create New Planner" or "Open Existing Planner".
   - If permission is required: Show a "Grant Write Permission" button.
   - If connected: Show "File Connected" and the last saved time.
   - If fallback mode: Show a warning banner that direct saving isn't supported and provide an "Export JSON Backup" button.
3. Place this status component at the top of the Dashboard.
4. Below it, render a simple summary grid using shadcn Cards showing: Total Courses, In-Progress Courses, and Completed Topics (calculate these directly from the Context data).

### Check when done
`spec/progress-tracker.md`
