# UI Context

## Theme

SkillMap should feel like a focused personal learning workspace: dark, structured, and efficient. The product surface should prioritize scanning goals, seeing progress, editing notes, and moving through milestones and sessions without visual noise.

Use the custom CSS variable system defined below. Do not use the shadcn/ui Base Sera defaults or replace the design system without an explicit spec change.

This is a revision of the original SkillMap theme: same dark, dense, mono-driven workspace feel, but the accent palette moves from a neon cyan/purple pairing to a warmer, muted ink-and-earth palette, and the layout adopts a lane-based structure for grouping related items under a goal.

## Colors

Use the semantic CSS custom properties defined in `app/globals.css`. Do not hardcode color values.

| Role | Token | Value |
| --- | --- | --- |
| Page background | `var(--bg)` | `#11161d` |
| Surface / card background | `var(--surface)` | `#171f29` |
| Elevated surface | `var(--surface2)` | `#1d2733` |
| Borders | `var(--border)` | `#2a3645` |
| Primary accent (teal) | `var(--accent)` | `#4fa89a` |
| Secondary accent (amber) | `var(--accent2)` | `#c98a4f` |
| Tertiary accent (dusty rose) | `var(--rose)` | `#bd7b82` |
| Status — active / in progress (blue) | `var(--blue)` | `#4c8fd9` |
| Status — done / success (green) | `var(--green)` | `#4fa873` |
| Status — priority / mastered (gold) | `var(--gold)` | `#e8c84a` |
| Status — overdue / destructive (red) | `var(--red)` | `#e2574c` |
| Primary text | `var(--text)` | `#ece6d9` |
| Muted text | `var(--muted)` | `#828f9d` |
| Faint text (IDs, captions, timestamps) | `var(--faint)` | `#5a6573` |

The primary/secondary/tertiary accents (teal, amber, rose) are **category colors** — they identify which kind of item something is (Milestone, Session, Progress Note), not its state. The status colors (blue, green, gold, red) are **state colors** — they identify where an item is in its lifecycle, independent of category. Never reuse a category color to mean a status, or vice versa.

## Typography

| Role | Font |
| --- | --- |
| UI text | Space Grotesk via `var(--sans)` |
| Mono / labels / numbers | Space Mono via `var(--mono)` |

Load both from Google Fonts: `Space Grotesk` (weights 300–700) and `Space Mono` (weights 400, 700). No font change from the previous version — the redesign is about palette and structure, not typeface.

Use monospace for: stat numbers, entity ID tags, status labels, effort/category badges, tags, timestamps, label overlines, and reset/footer text. Use sans for everything else.

### Entity ID tags (new)

Every goal, milestone, session, and progress note card gets a small mono ID tag above its title — e.g. `G-04`, `M-12`, `S-03`, `N-07` — in `var(--faint)`, 10–11px, with slight letter-spacing. This is not decorative: it gives the user a stable, scannable reference when a goal has many milestones, and mirrors how the items were addressed in planning. Generate the visible tag from a short prefix per entity type plus its position in its parent's ordered list; it does not need to be a stored field.

Keep headings sized for dashboard content. Reserve large display type for rare public or empty states.

## Border Radius

| Context | Value |
| --- | --- |
| Small controls, tags | `border-radius: 4px` or `rounded` |
| Cards and panels | `border-radius: 10px–12px` or `rounded-xl` |
| Pills / badges | `border-radius: 99px` or `rounded-full` |

## CSS Variable Setup

Already defined in `:root` inside `app/globals.css`:

```css
--bg: #11161d;
--surface: #171f29;
--surface2: #1d2733;
--border: #2a3645;
--accent: #4fa89a;
--accent2: #c98a4f;
--rose: #bd7b82;
--blue: #4c8fd9;
--gold: #e8c84a;
--green: #4fa873;
--red: #e2574c;
--text: #ece6d9;
--muted: #828f9d;
--faint: #5a6573;
--mono: 'Space Mono', monospace;
--sans: 'Space Grotesk', sans-serif;
```

## Component Library

Use shadcn/ui on top of Tailwind CSS where practical, but override colors with the CSS variables above. Current installed components:

- `button`
- `card`
- `checkbox`
- `dialog`
- `dropdown-menu`
- `input`
- `label`
- `progress`
- `separator`
- `textarea`

No new shadcn components are required for this redesign. The status control described below (a small colored dot next to a compact dropdown) can be built from the existing `dropdown-menu` primitive — do not add a `select` component just for this. Add new shadcn/ui components through the CLI only if a future spec change genuinely needs one.

## Layout Patterns

- Planner shell: single-column dashboard capped at `max-width: 720px`, centered.
- Header: left-border accent stripe (`border-left: 3px solid var(--accent)`), overline label in mono, bold heading, muted subtitle.

### Overview stat cards (new)

At the top of the Goals dashboard, replace the single progress summary bar with three stat cards in a row (stacked on mobile): **Active Goals**, **Milestones This Week**, **Sessions Logged**. Each card gets a 3px top border in one of the three category colors (teal / amber / rose, in that order), a mono overline label, a large mono stat number, and a thin gradient or flat progress bar underneath where a completion ratio applies. This replaces decoration with information: the three colors here are the same three colors used in the lanes below, so the dashboard teaches its own color key before the user scrolls further.

### Goal sections (replaces "Phase groups")

Each goal renders as a collapsible section, mirroring how a time-boxed phase used to work, but scoped to one goal instead of one calendar phase:

- Section header: goal title in sans-bold, target date or status in `var(--faint)` mono next to it, and a right-aligned completion percentage in mono. Toggle chevron rotates 180° when open.
- Inside an open section, three lanes stack vertically, each with a 2px colored left border and an uppercase mono lane label:
  - **Milestones** lane — `var(--accent2)` (amber)
  - **Sessions** lane — `var(--accent)` (teal)
  - **Progress Notes** lane — `var(--rose)` (dusty rose)
- Each lane holds a responsive grid of item cards (3 columns desktop, 1 column mobile). A lane with no items shows a single quiet "Nothing here yet" card instead of collapsing — emptiness is an invitation to add the first one, not a gap.

### Item cards (replaces "Skill cards")

A milestone, session, or progress note card contains, top to bottom: the entity ID tag, the item title or summary, and a status row. The status row is a small colored dot followed by the current status label, opening a dropdown-menu of the valid statuses for that entity type on click:

- Milestones: Not started → In progress → Done (dot colors: faint, blue, green)
- Sessions: Planned → In progress → Done → Skipped (dot colors: faint, blue, green, faint at 45% opacity)
- Progress notes have no status; the card just shows the note excerpt and date.

A card whose status resolves to "done" gets a subtle background tint using the lane's category color at low opacity (the same treatment milestone banners used for "achieved", now generalized to any done item) rather than a heavy border change — the lane border already carries the category color, so the done-state should be quiet.

### Milestone banners

Keep the existing gradient surface card with a colored border, icon, title, and description for any milestone explicitly flagged as a major one. Use `var(--gold)` for the border instead of green, since gold is reserved for priority/standout state across the app and green now means "done" specifically.

## Item States

| State | Visual |
| --- | --- |
| Default | Surface background, `var(--border)` border |
| Hover | Category-color border (matching its lane), `var(--surface2)` background |
| Done | Lane category color at low-opacity background tint, status dot `var(--green)` |
| In progress | Status dot `var(--blue)`, no background change |
| Skipped | 45% opacity, status dot `var(--faint)` |
| Overdue (sessions/milestones past target date, not done) | Status dot `var(--red)`, small `var(--red)` left edge on the card |

## Footer / Reset

Unchanged: mono text in `var(--faint)`; reset or destructive actions gain `var(--red)` border/color on hover. The creator attribution footer keeps the same treatment.

## Accessibility

- Forms need labels.
- Buttons and menu actions need clear accessible names.
- Status must never be conveyed by dot color alone — the status label text is always present next to the dot, and the dropdown-menu lists statuses by name.
- Done/overdue/skipped states must not depend on color alone — pair with the label text and, where useful, an icon (e.g. check, clock).
- Keyboard navigation should work for planner controls, dialogs, and the status dropdown-menus.
- Ensure sufficient contrast against dark surfaces for all text tokens; verify `var(--faint)` text (used for IDs and timestamps) still meets contrast minimums against `var(--surface)`.
