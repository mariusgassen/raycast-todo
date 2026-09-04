Raycast Todo Extension – Spec

## Ziel
Neue Raycast-Extension für Todo-Verwaltung bauen (TypeScript + React, `npx create-raycast-extension` als Basis). Lokale Speicherung, kein externer Service.

## Datenmodell
- `Todo`: id, title, notes, projectId, priority (low/medium/high), dueDate (ISO, optional), completed (bool), completedAt, createdAt
- `Project`: id, name, color, icon (optional)
- Storage-Layer über `@raycast/api` LocalStorage, gekapselt in `src/lib/storage.ts` (CRUD, JSON-serialisiert, Migration-Hook für später)
- Default-Projekt "Inbox" für Todos ohne Zuordnung

## Commands
1. **`list-todos`** (view, Haupt-Command)
   - Liste offener Todos, gruppiert nach Fälligkeit: Überfällig / Heute / Diese Woche / Später / Ohne Datum
   - Integrierte Suchleiste zum Filtern
   - Accessories pro Zeile: Priorität-Icon, Projekt-Tag, Fälligkeitsdatum
   - Actions: Erledigt markieren, Bearbeiten (Form), Löschen, Priorität ändern (Submenu), Projekt ändern (Submenu)
   - Detailansicht pro Todo (Notes als Markdown + Metadaten-Liste)

2. **`quick-add-todo`** (no-view, Argument-basiert)
   - Titel als Argument, legt Todo sofort an
   - HUD-Feedback, Command schließt sich selbst danach
   - Stretch-Goal: einfaches Natural-Language-Datum-Parsing (z.B. "morgen")

3. **`menu-bar-todos`** (menu-bar)
   - Zeigt Anzahl offener/überfälliger Todos im Menu-Bar-Icon
   - Dropdown mit den nächsten 5 fälligen Todos
   - Klick öffnet `list-todos`

4. **`manage-projects`** (view, optional)
   - Form: Projekt anlegen/bearbeiten (Name, Farbe, Icon)

## Erinnerungen
- Kein Background-Scheduler möglich (Raycast-Extensions laufen nicht im Hintergrund)
- Lösung: visuelle Hervorhebung überfälliger/heute fälliger Todos (rot) in Liste und Menu-Bar
- neu Sortierung / Anzeige
