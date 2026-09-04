import { Color, LocalStorage } from "@raycast/api";
import { randomUUID } from "node:crypto";
import { INBOX_PROJECT_ID, Priority, Project, Todo } from "./types";

const TODOS_KEY = "todos-v1";
const PROJECTS_KEY = "projects-v1";

const INBOX_PROJECT: Project = {
  id: INBOX_PROJECT_ID,
  name: "Inbox",
  color: Color.SecondaryText,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await LocalStorage.getItem<string>(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await LocalStorage.setItem(key, JSON.stringify(value));
}

/**
 * Hook for future schema changes: bump *_KEY above (e.g. to "todos-v2") and
 * add the version-specific transform here, keyed off what readJson finds
 * under the old key.
 */
async function migrate(): Promise<void> {
  // no-op for v1
}

export async function ensureInboxProject(): Promise<Project[]> {
  const projects = await readJson<Project[]>(PROJECTS_KEY, []);
  if (projects.some((project) => project.id === INBOX_PROJECT_ID)) {
    return projects;
  }
  const withInbox = [INBOX_PROJECT, ...projects];
  await writeJson(PROJECTS_KEY, withInbox);
  return withInbox;
}

export async function getProjects(): Promise<Project[]> {
  await migrate();
  return ensureInboxProject();
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await writeJson(PROJECTS_KEY, projects);
}

export interface NewProjectInput {
  name: string;
  color: string;
  icon?: string;
}

export async function addProject(input: NewProjectInput): Promise<Project> {
  const projects = await getProjects();
  const project: Project = { id: randomUUID(), ...input };
  await saveProjects([...projects, project]);
  return project;
}

export async function updateProject(id: string, patch: Partial<Omit<Project, "id">>): Promise<void> {
  const projects = await getProjects();
  await saveProjects(projects.map((project) => (project.id === id ? { ...project, ...patch } : project)));
}

export async function deleteProject(id: string): Promise<void> {
  if (id === INBOX_PROJECT_ID) {
    throw new Error("The Inbox project cannot be deleted.");
  }
  const [projects, todos] = await Promise.all([getProjects(), getTodos()]);
  await Promise.all([
    saveProjects(projects.filter((project) => project.id !== id)),
    saveTodos(todos.map((todo) => (todo.projectId === id ? { ...todo, projectId: INBOX_PROJECT_ID } : todo))),
  ]);
}

export async function getTodos(): Promise<Todo[]> {
  await migrate();
  return readJson<Todo[]>(TODOS_KEY, []);
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  await writeJson(TODOS_KEY, todos);
}

export interface NewTodoInput {
  title: string;
  notes?: string;
  projectId?: string;
  priority?: Priority;
  dueDate?: string;
}

export async function addTodo(input: NewTodoInput): Promise<Todo> {
  const todos = await getTodos();
  const todo: Todo = {
    id: randomUUID(),
    title: input.title,
    notes: input.notes ?? "",
    projectId: input.projectId ?? INBOX_PROJECT_ID,
    priority: input.priority ?? "medium",
    dueDate: input.dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  await saveTodos([...todos, todo]);
  return todo;
}

export async function updateTodo(id: string, patch: Partial<Omit<Todo, "id" | "createdAt">>): Promise<void> {
  const todos = await getTodos();
  await saveTodos(todos.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo)));
}

export async function setTodoCompleted(id: string, completed: boolean): Promise<void> {
  await updateTodo(id, { completed, completedAt: completed ? new Date().toISOString() : undefined });
}

export async function deleteTodo(id: string): Promise<void> {
  const todos = await getTodos();
  await saveTodos(todos.filter((todo) => todo.id !== id));
}
