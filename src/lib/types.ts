export type Priority = "low" | "medium" | "high";

export type RepeatUnit = "day" | "week" | "month" | "year";

export interface RepeatRule {
  unit: RepeatUnit;
  /** Repeat every N units (e.g. `{ unit: "week", interval: 2 }` = every 2 weeks). Must be >= 1. */
  interval: number;
}

export const INBOX_PROJECT_ID = "inbox";

export interface Project {
  id: string;
  name: string;
  /** A `Color` enum value from `@raycast/api`, stored as its string token. */
  color: string;
  /** An `Icon` enum value from `@raycast/api`, stored as its string token. */
  icon?: string;
}

export interface Todo {
  id: string;
  title: string;
  notes: string;
  projectId: string;
  priority: Priority;
  dueDate?: string;
  repeat?: RepeatRule;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}
