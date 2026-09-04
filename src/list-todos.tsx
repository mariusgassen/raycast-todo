import { useMemo, useState } from "react";
import { Action, ActionPanel, Alert, Color, Icon, Keyboard, List, confirmAlert } from "@raycast/api";
import { useTodos } from "./hooks/useTodos";
import { TodoForm, TodoFormSubmitValues } from "./components/TodoForm";
import { Priority, Project, Todo } from "./lib/types";
import { PRIORITIES, PRIORITY_COLORS, PRIORITY_ICONS, PRIORITY_LABELS } from "./lib/priority";
import { DEFAULT_PROJECT_ICON } from "./lib/project-style";
import { formatDueDate, groupTodosByDueDate, isOverdue } from "./lib/date-utils";

export default function ListTodosCommand() {
  const { todos, projects, isLoading, createTodo, editTodo, toggleTodoCompleted, removeTodo } = useTodos();
  const [isShowingDetail, setIsShowingDetail] = useState(false);

  const openTodos = useMemo(() => todos.filter((todo) => !todo.completed), [todos]);
  const groups = useMemo(() => groupTodosByDueDate(openTodos), [openTodos]);
  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);

  async function handleCreate(values: TodoFormSubmitValues) {
    await createTodo(values);
  }

  return (
    <List isLoading={isLoading} isShowingDetail={isShowingDetail} searchBarPlaceholder="Search todos...">
      {!isLoading && openTodos.length === 0 ? (
        <List.EmptyView
          icon={Icon.CheckCircle}
          title="No Open Todos"
          description="Press ⌘N to add your first todo."
          actions={
            <ActionPanel>
              <Action.Push
                icon={Icon.Plus}
                title="New Todo"
                shortcut={Keyboard.Shortcut.Common.New}
                target={<TodoForm projects={projects} onSubmit={handleCreate} />}
              />
            </ActionPanel>
          }
        />
      ) : (
        groups.map(
          (group) =>
            group.todos.length > 0 && (
              <List.Section key={group.bucket} title={group.title} subtitle={String(group.todos.length)}>
                {group.todos.map((todo) => (
                  <TodoListItem
                    key={todo.id}
                    todo={todo}
                    project={projectById.get(todo.projectId)}
                    projects={projects}
                    onToggleDetail={() => setIsShowingDetail((value) => !value)}
                    onComplete={() => toggleTodoCompleted(todo.id, true)}
                    onDelete={() => removeTodo(todo.id)}
                    onChangePriority={(priority) => editTodo(todo.id, { priority })}
                    onChangeProject={(projectId) => editTodo(todo.id, { projectId })}
                    onSubmitEdit={async (values) => editTodo(todo.id, values)}
                    onSubmitCreate={handleCreate}
                  />
                ))}
              </List.Section>
            ),
        )
      )}
    </List>
  );
}

interface TodoListItemProps {
  todo: Todo;
  project?: Project;
  projects: Project[];
  onToggleDetail: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onChangePriority: (priority: Priority) => void;
  onChangeProject: (projectId: string) => void;
  onSubmitEdit: (values: TodoFormSubmitValues) => Promise<void>;
  onSubmitCreate: (values: TodoFormSubmitValues) => Promise<void>;
}

function TodoListItem({
  todo,
  project,
  projects,
  onToggleDetail,
  onComplete,
  onDelete,
  onChangePriority,
  onChangeProject,
  onSubmitEdit,
  onSubmitCreate,
}: TodoListItemProps) {
  const overdue = isOverdue(todo);

  const accessories: List.Item.Accessory[] = [
    {
      icon: { source: PRIORITY_ICONS[todo.priority], tintColor: PRIORITY_COLORS[todo.priority] },
      tooltip: `Priority: ${PRIORITY_LABELS[todo.priority]}`,
    },
  ];
  if (project) {
    accessories.push({ tag: { value: project.name, color: project.color }, tooltip: "Project" });
  }
  if (todo.dueDate) {
    accessories.push({
      text: { value: formatDueDate(todo.dueDate), color: overdue ? Color.Red : undefined },
      icon: { source: Icon.Calendar, tintColor: overdue ? Color.Red : Color.SecondaryText },
      tooltip: new Date(todo.dueDate).toLocaleDateString(),
    });
  }

  async function handleDelete() {
    const confirmed = await confirmAlert({
      title: "Delete Todo",
      message: `Delete "${todo.title}"? This cannot be undone.`,
      primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
    });
    if (confirmed) onDelete();
  }

  return (
    <List.Item
      title={todo.title}
      icon={{ source: overdue ? Icon.ExclamationMark : Icon.Circle, tintColor: overdue ? Color.Red : undefined }}
      accessories={accessories}
      detail={<TodoDetail todo={todo} project={project} />}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action icon={Icon.Check} title="Mark as Completed" onAction={onComplete} />
            <Action.Push
              icon={Icon.Pencil}
              title="Edit Todo"
              shortcut={Keyboard.Shortcut.Common.Edit}
              target={<TodoForm todo={todo} projects={projects} onSubmit={onSubmitEdit} />}
            />
            <Action
              icon={Icon.AppWindowSidebarLeft}
              title="Toggle Details"
              shortcut={{ modifiers: ["cmd"], key: "d" }}
              onAction={onToggleDetail}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <ActionPanel.Submenu
              icon={Icon.LevelMeter}
              title="Change Priority"
              shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
            >
              {PRIORITIES.map((priority) => (
                <Action
                  key={priority}
                  title={PRIORITY_LABELS[priority]}
                  icon={{ source: PRIORITY_ICONS[priority], tintColor: PRIORITY_COLORS[priority] }}
                  onAction={() => onChangePriority(priority)}
                />
              ))}
            </ActionPanel.Submenu>
            <ActionPanel.Submenu
              icon={Icon.Folder}
              title="Change Project"
              shortcut={{ modifiers: ["cmd", "shift"], key: "m" }}
            >
              {projects.map((candidate) => (
                <Action
                  key={candidate.id}
                  title={candidate.name}
                  icon={{ source: (candidate.icon as Icon) ?? DEFAULT_PROJECT_ICON, tintColor: candidate.color }}
                  onAction={() => onChangeProject(candidate.id)}
                />
              ))}
            </ActionPanel.Submenu>
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.Push
              icon={Icon.Plus}
              title="New Todo"
              shortcut={Keyboard.Shortcut.Common.New}
              target={<TodoForm projects={projects} onSubmit={onSubmitCreate} />}
            />
            <Action
              icon={Icon.Trash}
              title="Delete Todo"
              style={Action.Style.Destructive}
              shortcut={Keyboard.Shortcut.Common.Remove}
              onAction={handleDelete}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function TodoDetail({ todo, project }: { todo: Todo; project?: Project }) {
  const markdown = todo.notes.trim().length > 0 ? todo.notes : "*No notes.*";

  return (
    <List.Item.Detail
      markdown={markdown}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label
            title="Project"
            text={project?.name ?? "Inbox"}
            icon={{ source: (project?.icon as Icon) ?? DEFAULT_PROJECT_ICON, tintColor: project?.color }}
          />
          <List.Item.Detail.Metadata.Label
            title="Priority"
            text={PRIORITY_LABELS[todo.priority]}
            icon={{ source: PRIORITY_ICONS[todo.priority], tintColor: PRIORITY_COLORS[todo.priority] }}
          />
          <List.Item.Detail.Metadata.Label
            title="Due Date"
            text={todo.dueDate ? formatDueDate(todo.dueDate) : "No due date"}
          />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Created" text={new Date(todo.createdAt).toLocaleString()} />
        </List.Item.Detail.Metadata>
      }
    />
  );
}
