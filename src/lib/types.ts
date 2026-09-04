export type Priority = "low" | "medium" | "high";

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
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}
