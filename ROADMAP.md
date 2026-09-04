# Roadmap

Ideas for where this extension could go next, beyond the initial spec. Nothing here is committed to — pick an item, open an issue or PR, and cross it off.

## Shipped

- `list-todos`, `quick-add-todo` (with DE/EN natural-language due dates), `menu-bar-todos`, `manage-projects`
- Local `LocalStorage` CRUD layer with a `migrate()` hook for future schema changes
- Unit tests for the logic layer, CI, Dependabot

## Local-only

These fit the current architecture (everything in `LocalStorage`, no server) and are the natural next step.

- **Export/import** — a command to dump all todos/projects to JSON and read them back. The only backup story right now is "don't clear LocalStorage"; this is cheap insurance and worth doing first.
- **Recurring todos** — a repeat rule (daily/weekly/custom) on a `Todo`; completing an instance spawns the next occurrence with a new due date.
- **Completed/archive view** — completed todos currently disappear with no way to see or undo them. A toggle or second view closes that gap.
- **Snooze action** — "postpone to tomorrow" as a single keystroke in `list-todos`, reusing the date parser already built for quick-add.
- **Sort/filter options** — by priority or project, in addition to the existing due-date grouping.
- **Menu bar quick-add** — type directly into the `menu-bar-todos` dropdown instead of switching commands.

## External integrations

These step outside "local-only" and need real design decisions before implementation.

- **Calendar sync for dated todos** — push todos with a `dueDate` onto the user's calendar so they show up alongside other events. Two different shapes, worth picking deliberately rather than defaulting:
  - _Local, macOS-only_: shell out to Calendar.app via AppleScript/JXA (`osascript`). No accounts, no network, no new credentials to store — but macOS-only, and fragile to Calendar.app's scripting quirks.
  - _Real calendar API_ (Google Calendar, CalDAV, etc.): cross-platform and more robust, but needs an OAuth flow, token storage (Raycast supports encrypted preferences for this), refresh handling, and offline/error handling — a materially bigger project than anything else on this list.
  - Either way: sync direction (one-way todo→calendar vs. two-way), and what happens when a todo's due date changes or the todo is deleted, need to be decided up front.
- **Cross-device / shared lists** — needs a real backend (or a synced-file approach like iCloud Drive). Out of scope until there's a concrete need for it.

## Explicitly not planned

- **Push notifications for due todos** — Raycast extensions have no background scheduler, which is why the current approach is visual highlighting (red for overdue/today) instead. A real reminder would mean a `launchd` job or similar OS-level trick — a different kind of project, not a small add-on.
