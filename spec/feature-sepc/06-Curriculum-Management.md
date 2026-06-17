Read `AGENTS.md` before starting.


Now we need the UI to manage Courses and Modules.

1. Create a page `app/courses/page.tsx` ("use client"). List all courses using shadcn Cards. Add a Dialog with a form (shadcn Input, Textarea, Button) to create a new Course.
2. Create a dynamic page `app/courses/[id]/page.tsx` ("use client"). This is the Course Detail page.
   - Display course info at the top.
   - Create a client-side progress calculation: find all topics linked to this course's modules, count the completed ones, and use the shadcn `Progress` component to show the percentage.
   - List the Modules belonging to this course.
   - Add a Dialog form to create new Modules.
Ensure all creations and updates call the update function from `PlannerContext` so they autosave to IndexedDB immediately.

### Check when done
`spec/progress-tracker.md`
