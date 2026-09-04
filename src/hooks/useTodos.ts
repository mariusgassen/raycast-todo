import { useCallback, useEffect, useState } from "react";
import { showToast, Toast } from "@raycast/api";
import { INBOX_PROJECT_ID, Project, Todo } from "../lib/types";
import * as storage from "../lib/storage";

/**
 * Single source of truth for todos + projects, loaded once from LocalStorage
 * and kept in sync with optimistic local updates so list-todos, menu-bar-todos
 * and manage-projects all see consistent state within their own process.
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const revalidate = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedTodos, loadedProjects] = await Promise.all([storage.getTodos(), storage.getProjects()]);
      setTodos(loadedTodos);
      setProjects(loadedProjects);
    } catch (error) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to load todos", message: String(error) });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  const createTodo = useCallback(async (input: storage.NewTodoInput) => {
    const todo = await storage.addTodo(input);
    setTodos((prev) => [...prev, todo]);
    return todo;
  }, []);

  const editTodo = useCallback(async (id: string, patch: Partial<Omit<Todo, "id" | "createdAt">>) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo)));
    await storage.updateTodo(id, patch);
  }, []);

  const toggleTodoCompleted = useCallback(async (id: string, completed: boolean) => {
    const completedAt = completed ? new Date().toISOString() : undefined;
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed, completedAt } : todo)));
    await storage.setTodoCompleted(id, completed);
  }, []);

  const removeTodo = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    await storage.deleteTodo(id);
  }, []);

  const createProject = useCallback(async (input: storage.NewProjectInput) => {
    const project = await storage.addProject(input);
    setProjects((prev) => [...prev, project]);
    return project;
  }, []);

  const editProject = useCallback(async (id: string, patch: Partial<Omit<Project, "id">>) => {
    setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, ...patch } : project)));
    await storage.updateProject(id, patch);
  }, []);

  const removeProject = useCallback(async (id: string) => {
    await storage.deleteProject(id);
    setProjects((prev) => prev.filter((project) => project.id !== id));
    setTodos((prev) => prev.map((todo) => (todo.projectId === id ? { ...todo, projectId: INBOX_PROJECT_ID } : todo)));
  }, []);

  return {
    todos,
    projects,
    isLoading,
    revalidate,
    createTodo,
    editTodo,
    toggleTodoCompleted,
    removeTodo,
    createProject,
    editProject,
    removeProject,
  };
}
