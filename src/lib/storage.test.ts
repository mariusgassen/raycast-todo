import { LocalStorage } from "@raycast/api";
import { beforeEach, describe, expect, it } from "vitest";
import * as storage from "./storage";
import { addDays, toISODate } from "./date-utils";
import { INBOX_PROJECT_ID } from "./types";

beforeEach(async () => {
  await LocalStorage.clear();
});

describe("getProjects / ensureInboxProject", () => {
  it("creates the Inbox project on first read", async () => {
    const projects = await storage.getProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0]).toMatchObject({ id: INBOX_PROJECT_ID, name: "Inbox" });
  });

  it("does not duplicate the Inbox project on subsequent reads", async () => {
    await storage.getProjects();
    const projects = await storage.getProjects();
    expect(projects.filter((project) => project.id === INBOX_PROJECT_ID)).toHaveLength(1);
  });
});

describe("todos", () => {
  it("defaults a new todo to the Inbox project, medium priority and incomplete", async () => {
    const todo = await storage.addTodo({ title: "Write tests" });
    expect(todo).toMatchObject({
      title: "Write tests",
      notes: "",
      projectId: INBOX_PROJECT_ID,
      priority: "medium",
      completed: false,
    });
    expect(todo.id).toBeTruthy();
    expect(todo.createdAt).toBeTruthy();

    const stored = await storage.getTodos();
    expect(stored).toEqual([todo]);
  });

  it("updates a todo by id, leaving others untouched", async () => {
    const a = await storage.addTodo({ title: "A" });
    const b = await storage.addTodo({ title: "B" });

    await storage.updateTodo(a.id, { title: "A (edited)", priority: "high" });

    const todos = await storage.getTodos();
    expect(todos.find((todo) => todo.id === a.id)).toMatchObject({ title: "A (edited)", priority: "high" });
    expect(todos.find((todo) => todo.id === b.id)).toMatchObject({ title: "B" });
  });

  it("marks a todo completed and stamps completedAt, then clears it on reopen", async () => {
    const todo = await storage.addTodo({ title: "Ship it" });

    await storage.setTodoCompleted(todo.id, true);
    let [stored] = await storage.getTodos();
    expect(stored.completed).toBe(true);
    expect(stored.completedAt).toBeTruthy();

    await storage.setTodoCompleted(todo.id, false);
    [stored] = await storage.getTodos();
    expect(stored.completed).toBe(false);
    expect(stored.completedAt).toBeUndefined();
  });

  it("deletes a todo by id", async () => {
    const todo = await storage.addTodo({ title: "Temp" });
    await storage.deleteTodo(todo.id);
    expect(await storage.getTodos()).toHaveLength(0);
  });
});

describe("completeTodo", () => {
  it("completes a non-recurring todo without spawning anything", async () => {
    const todo = await storage.addTodo({ title: "One-off" });
    const spawned = await storage.completeTodo(todo.id);

    expect(spawned).toBeUndefined();
    const todos = await storage.getTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0]).toMatchObject({ id: todo.id, completed: true });
  });

  it("spawns the next occurrence for a recurring todo with a due date", async () => {
    const dueDate = toISODate(addDays(new Date(), 30));
    const todo = await storage.addTodo({
      title: "Water plants",
      dueDate,
      repeat: { unit: "week", interval: 2 },
    });

    const spawned = await storage.completeTodo(todo.id);

    expect(spawned).toBeDefined();
    expect(spawned?.id).not.toBe(todo.id);
    expect(spawned).toMatchObject({
      title: "Water plants",
      completed: false,
      repeat: { unit: "week", interval: 2 },
      dueDate: toISODate(addDays(new Date(dueDate), 14)),
    });

    const todos = await storage.getTodos();
    expect(todos).toHaveLength(2);
    expect(todos.find((t) => t.id === todo.id)).toMatchObject({ completed: true });
  });

  it("completes a recurring todo with no due date without spawning", async () => {
    const todo = await storage.addTodo({ title: "No date", repeat: { unit: "day", interval: 1 } });
    const spawned = await storage.completeTodo(todo.id);

    expect(spawned).toBeUndefined();
    expect(await storage.getTodos()).toHaveLength(1);
  });

  it("returns undefined for an unknown id and leaves storage untouched", async () => {
    await storage.addTodo({ title: "Existing" });
    const spawned = await storage.completeTodo("does-not-exist");

    expect(spawned).toBeUndefined();
    expect(await storage.getTodos()).toHaveLength(1);
  });
});

describe("projects", () => {
  it("adds a project", async () => {
    const project = await storage.addProject({ name: "Work", color: "raycast-blue" });
    const projects = await storage.getProjects();
    expect(projects.find((p) => p.id === project.id)).toMatchObject({ name: "Work" });
  });

  it("refuses to delete the Inbox project", async () => {
    await expect(storage.deleteProject(INBOX_PROJECT_ID)).rejects.toThrow();
  });

  it("reassigns a deleted project's todos to Inbox", async () => {
    const project = await storage.addProject({ name: "Work", color: "raycast-blue" });
    const todo = await storage.addTodo({ title: "Task", projectId: project.id });

    await storage.deleteProject(project.id);

    const projects = await storage.getProjects();
    expect(projects.find((p) => p.id === project.id)).toBeUndefined();

    const [stored] = await storage.getTodos();
    expect(stored.id).toBe(todo.id);
    expect(stored.projectId).toBe(INBOX_PROJECT_ID);
  });
});
