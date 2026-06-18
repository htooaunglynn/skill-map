READ `AGENT.md`

Read the spec files in the required order from `spec/ai-workflow-rules.md` before doing anything else, paying special attention to the now-updated `spec/ui-context.md`. Then implement this single unit:

UNIT: Apply the revised visual design system to existing UI surfaces. This is a pure restyle — no schema changes, no new routes, no new dependencies, no behavior changes. If you find yourself wanting to change what data a component receives or how routing works, stop and split that into a separate unit per the scoping rules in `spec/ai-workflow-rules.md`.

Scope, in this order:

1. Confirm `app/globals.css` already has the new token values (bg/surface/surface2/border/accent/accent2/rose/blue/gold/green/red/text/muted/faint). If any component currently hardcodes a color instead of using these tokens, fix it to use the token — flag it in `progress-tracker.md` rather than silently leaving it.

2. Goals dashboard overview: replace the current single progress summary bar with three stat cards in a row (stack on mobile) — Active Goals, Milestones This Week, Sessions Logged — each with a 3px top border in teal/amber/rose respectively, a mono overline label, a large mono stat number, and a thin progress bar where a completion ratio applies. Use the existing `Card` and `Progress` shadcn components; don't build new primitives for this.

3. Goal sections: restructure each goal's rendering (dashboard list and/or goal detail page, whichever currently renders the collapsible/tabbed view) into the lane pattern described in `spec/ui-context.md`: a section header with title, status/date, and completion percentage, containing three vertically-stacked lanes — Milestones (amber left border), Sessions (teal left border), Progress Notes (rose left border) — each with an uppercase mono lane label and a responsive card grid (3 columns desktop, 1 column mobile). An empty lane shows a single quiet placeholder card, not a collapsed gap.

4. Item cards: update `MilestoneItem`, `SessionCard`, and `ProgressNoteCard` (or their current equivalents) to show the mono entity ID tag (e.g. `M-04`, `S-02`, `N-01`, derived from entity type + position, not a new stored field) above the title, and a status row using a small colored dot plus the status label, opening the existing `dropdown-menu` primitive on click rather than a native `<select>`. Use the status-to-color mapping in `spec/ui-context.md` (faint/blue/green/faint-at-45%, with red reserved for overdue). Apply the low-opacity lane-color background tint only to cards whose status is "done."

5. Milestone banners (the existing gradient highlight card for flagged major milestones): switch the border color from green to gold, since green is now reserved for "done" status specifically.

6. Leave the header accent stripe, footer/reset styling, and creator attribution footer as they are — they already match the new tokens once `globals.css` is in place and need no structural change.

Do not touch `components/ui/*`, `components.json`, or `pnpm-lock.yaml` outside package manager commands, per the protected files list.

Before considering this unit done, per `spec/ai-workflow-rules.md`:
- Verify the change works end to end at desktop and mobile widths.
- Run `pnpm lint` — must pass with 0 errors.
- Run `pnpm build` — must pass.
- Update `spec/progress-tracker.md`: move the relevant line from Next Up to Completed, and add a short Session Notes entry describing what actually changed versus what was planned.
