# Raycast Todo Extension — Implementation Plan

Source: `tasks/spec.md` (Raycast Todo Extension – Spec, provided by user)

## Scaffold
- [x] `package.json` with Raycast manifest (4 commands), deps (`@raycast/api`, `@raycast/utils`), devDeps (`typescript@^6.0.3` — capped below eslint-config's `<6.1.0` peer range, `@raycast/eslint-config`, `eslint`, `prettier`, `@types/node`, `@types/react`)
- [x] `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`, `.gitignore`
- [x] `assets/icon.png` (512x512, generated with Pillow since no design tool available)
- [x] `README.md` describing the extension

## Data layer (`src/lib/`)
- [x] `types.ts` — `Todo`, `Project`, `Priority`, `INBOX_PROJECT_ID`
- [x] `storage.ts` — CRUD over `@raycast/api` `LocalStorage`, JSON-serialized, versioned keys + no-op `migrate()` hook for future schema changes, `ensureInboxProject()`
- [x] `date-utils.ts` — overdue/today/this-week grouping, due-date formatting, simple DE/EN natural-language date parser (heute/morgen/today/tomorrow/in N days/weekday names) for quick-add stretch goal

## Shared hook
- [x] `src/hooks/useTodos.ts` — loads todos+projects, exposes optimistic CRUD (add/update/toggle/delete todo; add/update/delete project), single source of truth reused by `list-todos`, `menu-bar-todos` and `manage-projects`

## Shared form components
- [x] `src/components/TodoForm.tsx` — create/edit todo (title, notes, project, priority, due date); reused by list-todos "Bearbeiten" and a "New Todo" action
- [x] `src/components/ProjectForm.tsx` — create/edit project (name, color, icon)

## Commands
- [x] `src/list-todos.tsx` — grouped sections (Overdue/Today/This Week/Later/No Due Date), built-in search, accessories (priority, project tag, due date), actions (complete, edit, delete, change priority submenu, change project submenu, new todo), detail view (notes as markdown + metadata)
- [x] `src/quick-add-todo.tsx` — no-view, single `title` argument, parses trailing DE/EN date phrase, HUD feedback, self-closes
- [x] `src/menu-bar-todos.tsx` — menu-bar command, icon shows open/overdue counts, dropdown of next 5 due todos (overdue tinted red), opens `list-todos`
- [x] `src/manage-projects.tsx` — list projects, create/edit/delete via `ProjectForm`, Inbox undeletable

## Verification
- [x] `npm install`
- [x] `npx tsc --noEmit` — clean
- [x] `npx eslint src` — clean
- [x] `npx prettier --check` — clean
- [x] `npx ray build -e dist` — compiles all 4 entry points and passes Raycast's own TypeScript check
- [x] `npx ray lint -r` — package.json schema/icons/ESLint/Prettier all pass; the one remaining error (`Invalid author "mariusgassen"`) is a live network call to Raycast's account API validating store authorship, which cannot succeed for any placeholder in this sandbox (no registered Raycast account). Documented in README: update `author` to a real Raycast Store username before publishing.
- [x] No Raycast desktop app in this sandbox (Linux headless), so the commands could not be exercised interactively — mitigated by the above build/lint/typecheck verification plus a careful manual read-through of each file's logic (date bucketing, timezone-safe due-date round-tripping, optimistic state updates).

## Ship
- [ ] Commit, push to `claude/raycast-todo-extension-9spu7n`
- [ ] Open PR, subscribe to PR activity

## Review

Built a complete local-first Raycast todo extension per spec: 4 commands (list-todos, quick-add-todo, menu-bar-todos, manage-projects), a typed `LocalStorage`-backed CRUD layer with a migration hook, due-date grouping/formatting, and a small DE/EN natural-language date parser for quick-add (stretch goal). Shared `useTodos` hook keeps todos/projects state consistent within each command's process; `TodoForm`/`ProjectForm` are reused for both create and edit flows. Verified via Raycast's own `ray build`/`ray lint` tooling plus `tsc`/`eslint`/`prettier` — all clean except the store-authorship network check, which needs a real Raycast account and is called out in the README rather than faked.
