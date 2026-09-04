import { Todo } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, days: number): Date {
  return new Date(startOfDay(date).getTime() + days * DAY_MS);
}

export function toISODate(date: Date): string {
  return startOfDay(date).toISOString();
}

export type DueBucket = "overdue" | "today" | "thisWeek" | "later" | "noDate";

const BUCKET_ORDER: DueBucket[] = ["overdue", "today", "thisWeek", "later", "noDate"];

export const BUCKET_TITLES: Record<DueBucket, string> = {
  overdue: "Overdue",
  today: "Today",
  thisWeek: "This Week",
  later: "Later",
  noDate: "No Due Date",
};

export function getDueBucket(todo: Pick<Todo, "dueDate">, now: Date = new Date()): DueBucket {
  if (!todo.dueDate) return "noDate";
  const due = startOfDay(new Date(todo.dueDate));
  const today = startOfDay(now);
  const diffDays = Math.round((due.getTime() - today.getTime()) / DAY_MS);

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays <= 6) return "thisWeek";
  return "later";
}

export function isOverdue(todo: Pick<Todo, "dueDate" | "completed">, now: Date = new Date()): boolean {
  return !todo.completed && getDueBucket(todo, now) === "overdue";
}

export function isDueTodayOrOverdue(todo: Pick<Todo, "dueDate" | "completed">, now: Date = new Date()): boolean {
  if (todo.completed) return false;
  const bucket = getDueBucket(todo, now);
  return bucket === "overdue" || bucket === "today";
}

export interface DueDateGroup<T> {
  bucket: DueBucket;
  title: string;
  todos: T[];
}

export function groupTodosByDueDate<T extends Pick<Todo, "dueDate">>(todos: T[]): DueDateGroup<T>[] {
  const groups = new Map<DueBucket, T[]>(BUCKET_ORDER.map((bucket) => [bucket, []]));
  for (const todo of todos) {
    groups.get(getDueBucket(todo))?.push(todo);
  }
  return BUCKET_ORDER.map((bucket) => ({ bucket, title: BUCKET_TITLES[bucket], todos: groups.get(bucket) ?? [] }));
}

export function formatDueDate(dueDate: string, now: Date = new Date()): string {
  const due = new Date(dueDate);
  const today = startOfDay(now);
  const diffDays = Math.round((startOfDay(due).getTime() - today.getTime()) / DAY_MS);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";

  const sameYear = due.getFullYear() === now.getFullYear();
  const withinWeek = diffDays > 0 && diffDays <= 6;
  return due.toLocaleDateString(undefined, {
    weekday: withinWeek ? "short" : undefined,
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

// --- Simple DE/EN natural-language due-date parsing (quick-add stretch goal) ---

const WEEKDAYS_EN = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const WEEKDAYS_DE = ["sonntag", "montag", "dienstag", "mittwoch", "donnerstag", "freitag", "samstag"];

export interface ParsedTitle {
  title: string;
  dueDate?: string;
}

/**
 * Looks for a trailing date phrase (up to 3 words, e.g. "in 3 days") at the
 * end of a quick-add title and, if found, strips it and resolves it to an
 * ISO due date. Falls back to returning the title unchanged.
 */
export function parseTitleWithDueDate(input: string, now: Date = new Date()): ParsedTitle {
  const trimmed = input.trim();
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { title: trimmed };

  for (let take = Math.min(3, tokens.length); take >= 1; take--) {
    const phraseTokens = tokens.slice(tokens.length - take);
    const due = resolveRelativeDate(phraseTokens.join(" "), now);
    if (!due) continue;

    const title = tokens
      .slice(0, tokens.length - take)
      .join(" ")
      .trim();
    if (title.length > 0) {
      return { title, dueDate: toISODate(due) };
    }
  }

  return { title: trimmed };
}

function resolveRelativeDate(phraseRaw: string, now: Date): Date | undefined {
  const phrase = phraseRaw.toLowerCase().replace(/^(on|am)\s+/, "");

  if (phrase === "today" || phrase === "heute") return now;
  if (phrase === "tomorrow" || phrase === "morgen") return addDays(now, 1);

  const inDaysMatch = phrase.match(/^in\s+(\d+)\s+(days?|tage?n?)$/);
  if (inDaysMatch) {
    return addDays(now, parseInt(inDaysMatch[1], 10));
  }

  const enIndex = WEEKDAYS_EN.indexOf(phrase);
  if (enIndex >= 0) return nextWeekday(now, enIndex);

  const deIndex = WEEKDAYS_DE.indexOf(phrase);
  if (deIndex >= 0) return nextWeekday(now, deIndex);

  return undefined;
}

function nextWeekday(now: Date, targetDay: number): Date {
  const currentDay = now.getDay();
  let diff = targetDay - currentDay;
  if (diff <= 0) diff += 7;
  return addDays(now, diff);
}
