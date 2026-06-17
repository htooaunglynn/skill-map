Read `AGENTS.md` before starting.


Let's build the Topic level, which includes completion tracking, Markdown notes, and bookmarks.

1. Inside the Module list on the Course Detail page, list the Topics for each module.
2. Each Topic should have a shadcn `Checkbox`. When clicked, it updates the `completed` status and `completed_at` timestamp in the Context. The Progress bar at the top of the page should update instantly.
3. Create a Dialog or an accordion under each Topic to manage Notes and Bookmarks.
   - For Notes: Use a simple shadcn `Textarea` to write Markdown. When saving, update the `notes` array in the Context.
   - For Bookmarks: Use a form with an Input for the URL and Title, saving to the `bookmarks` array.
4. Add a "Save to File" button floating at the bottom right of the screen (or in the header) that triggers the physical file write from `PlannerContext` and shows a success toast when done.

### Check when done
`spec/progress-tracker.md`
