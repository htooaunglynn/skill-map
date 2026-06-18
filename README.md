# SkillMap

SkillMap is a local-first learning planner for organizing courses, modules, topics, Markdown notes, bookmarks, and progress in a single user-owned JSON file.

The app is built with Next.js 16, React 19, TypeScript, Tailwind CSS, and shadcn/ui using the Base Sera preset. It has no backend, database, authentication, or cloud API in the MVP.

## Project Flow

Read the project documents in this order before making product, architecture, or implementation decisions:

1. `spec/BRD.md` - full business requirements and MVP scope.
2. `spec/project-overview.md` - product goals, core flow, scope, and success criteria.
3. `spec/architecture.md` - system boundaries, storage model, and invariants.
4. `spec/ui-context.md` - visual language, layout rules, and component conventions.
5. `spec/code-standards.md` - TypeScript, Next.js, styling, and file organization rules.
6. `spec/ai-workflow-rules.md` - agent workflow, scoping, protected files, and doc sync rules.
7. `spec/progress-tracker.md` - current phase, completed work, next steps, and open questions.

Root `AGENTS.md` and `CLAUDE.md` contain the same agent entry flow for coding assistants.

## Current Setup

Already completed:

```bash
pnpm create next-app@latest . --yes
pnpm dlx shadcn@latest init
```

shadcn/ui selections:

- Component library: Base
- Preset: Sera

Installed UI components:

- `card`
- `separator`
- `button`
- `checkbox`
- `input`
- `label`
- `textarea`
- `dropdown-menu`
- `dialog`
- `progress`

## Development

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Run checks:

```bash
pnpm lint
pnpm build
```

## MVP Direction

The MVP should focus on:

- Creating or opening a local `skillmap.json` file.
- Reading, validating, and saving the flattened JSON data model.
- Storing file handles in IndexedDB when the browser supports the File System Access API.
- Providing fallback JSON import/export for unsupported browsers.
- Managing courses, modules, topics, Markdown notes, and bookmarks.
- Marking topics complete and calculating progress client-side.
- Showing browser compatibility, file connection, autosave, and save status clearly.

Do not add a backend, database, OAuth, Google Drive API, account system, real-time sync, or server storage for the MVP.

## Community

- Read `CONTRIBUTING.md` before opening a pull request.
- Follow `CODE_OF_CONDUCT.md` in project spaces.
- Report security vulnerabilities privately using `SECURITY.md`.
- This project is licensed under the MIT License. See `LICENSE`.
