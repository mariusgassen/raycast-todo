# Todo

A local-first todo manager for Raycast. No account, no external service — everything is stored on-device via Raycast's `LocalStorage`.

## Commands

- **List Todos** — browse your open todos grouped by due date (Overdue / Today / This Week / Later / No Due Date), search, and manage them: mark complete, edit, delete, change priority or project, or add a new one. Toggle a detail pane (⌘D) to see notes (rendered as Markdown) and metadata.
- **Quick Add Todo** — type a title and hit Enter to create a todo instantly. Understands a trailing date phrase in English or German, e.g. `Buy milk tomorrow`, `Call dentist morgen`, `Pay rent in 3 days`, `Review PR monday`.
- **Todos Menu Bar** — shows your open/overdue todo count in the menu bar, with a dropdown of the next 5 things due. Click through to open the full list.
- **Manage Projects** — create, edit and delete projects (name, color, icon) used to organize todos. The default "Inbox" project can't be deleted.

## Data model

- `Todo`: id, title, notes, projectId, priority (`low`/`medium`/`high`), dueDate (ISO, optional), completed, completedAt, createdAt
- `Project`: id, name, color, icon (optional)

Storage lives in `src/lib/storage.ts`, a small CRUD layer over `@raycast/api`'s `LocalStorage`. Todos and projects are JSON-serialized under versioned keys (`todos-v1`, `projects-v1`), with a `migrate()` hook already wired in for future schema changes.

## Development

```sh
npm install
npm run dev     # ray develop — live-reloads in Raycast
npm run build   # ray build
npm run lint    # ray lint
```

> **Note:** before publishing, set `author` in `package.json` to your real Raycast Store username — `ray lint` validates it against your account and will reject a placeholder. Use `ray lint -r` (relaxed mode) to skip that check during local development if you don't have network access to Raycast's API.
