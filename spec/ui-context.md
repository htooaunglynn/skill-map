# UI Context

## Theme

SkillMap should feel like a focused personal learning workspace: dark, structured, and efficient. The product surface should prioritize scanning courses, seeing progress, editing notes, and moving through modules without visual noise.

Use the custom CSS variable system defined below. Do not use the shadcn/ui Base Sera defaults or replace the design system without an explicit spec change.

## Colors

Use the semantic CSS custom properties defined in `app/globals.css`. Do not hardcode color values.

| Role | Token |
| --- | --- |
| Page background | `var(--bg)` → `#0b0f1a` |
| Surface / card background | `var(--surface)` → `#131929` |
| Elevated surface | `var(--surface2)` → `#1a2236` |
| Borders | `var(--border)` → `#1f2d45` |
| Primary accent (cyan) | `var(--accent)` → `#00e5ff` |
| Secondary accent (purple) | `var(--accent2)` → `#7c3aed` |
| Success / done state | `var(--green)` → `#10b981` |
| Warning / priority | `var(--gold)` → `#f59e0b` |
| Destructive | `var(--red)` → `#ef4444` |
| Primary text | `var(--text)` → `#e2e8f0` |
| Muted text | `var(--muted)` → `#64748b` |

## Typography

| Role | Font |
| --- | --- |
| UI text | Space Grotesk via `var(--sans)` |
| Mono / labels / numbers | Space Mono via `var(--mono)` |

Load both from Google Fonts: `Space Grotesk` (weights 300–700) and `Space Mono` (weights 400, 700).

Use monospace for: stat numbers, phase badges, effort badges, tags, timestamps, label overlines, and reset/footer text. Use sans for everything else.

Keep headings sized for dashboard content. Reserve large display type for rare public or empty states.

## Border Radius

| Context | Value |
| --- | --- |
| Small controls, tags | `border-radius: 4px` or `rounded` |
| Cards and panels | `border-radius: 10px–12px` or `rounded-xl` |
| Pills / badges | `border-radius: 99px` or `rounded-full` |

## CSS Variable Setup

Define these in `:root` inside `app/globals.css`:

```css
--bg: #0b0f1a;
--surface: #131929;
--surface2: #1a2236;
--border: #1f2d45;
--accent: #00e5ff;
--accent2: #7c3aed;
--gold: #f59e0b;
--green: #10b981;
--red: #ef4444;
--text: #e2e8f0;
--muted: #64748b;
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

Add new shadcn/ui components through the CLI when needed.

## Layout Patterns

- Planner shell: single-column dashboard capped at `max-width: 720px`, centered.
- Header: left-border accent stripe (`border-left: 3px solid var(--accent)`), overline label in mono, bold heading, muted subtitle.
- Progress summary bar: surface card with flex row of stat numbers (mono, cyan) and a gradient progress bar (purple → cyan).
- Phase groups: collapsible sections with a phase badge (color-coded per phase), title, and timeline label. Toggle chevron rotates 180° when open.
- Skill cards: surface rows with a checkbox, skill name + description, tags, and an effort badge on the right. Done state adds a green left-stripe and green checkbox.
- Milestone banners: gradient surface card with green border, icon, title, description, and a mono dollar amount.
- Footer / reset: mono text in muted; reset button gains red border/color on hover.

## Phase Badge Colors

| Phase | Background | Text | Border |
| --- | --- | --- | --- |
| Phase 1 | `#0e2a3a` | `var(--accent)` | `var(--accent)` |
| Phase 2 | `#1e1040` | `#a78bfa` | `var(--accent2)` |
| Phase 3 | `#0d2b1e` | `var(--green)` | `var(--green)` |
| Phase 4 | `#2d1a00` | `var(--gold)` | `var(--gold)` |

## Skill Card States

| State | Visual |
| --- | --- |
| Default | Surface background, muted border |
| Hover | `var(--accent)` border, `var(--surface2)` background |
| Done | `var(--green)` border, 3px left green stripe, green filled checkbox |
| Skipped | 45% opacity |

## Controls

- Use checkboxes (custom styled, not native) for topic/skill completion.
- Use gradient progress bars for module, course, and overall completion.
- Use dialogs for create/edit forms.
- Use dropdown menus for item actions.
- Use textareas for Markdown writing until a richer lightweight Markdown editor is added.
- Use buttons with lucide icons when an icon clearly improves recognition.
- Use mono font + letter-spacing for all badge and overline labels.

## Accessibility

- Forms need labels.
- Buttons and menu actions need clear accessible names.
- Completion and locked states must not depend on color alone.
- Keyboard navigation should work for planner controls and dialogs.
- Ensure sufficient contrast against dark surfaces for all text tokens.
