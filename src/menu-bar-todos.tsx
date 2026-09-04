import { Color, Icon, Keyboard, LaunchType, MenuBarExtra, launchCommand } from "@raycast/api";
import { useTodos } from "./hooks/useTodos";
import { formatDueDate, isOverdue } from "./lib/date-utils";

function openTodoList() {
  launchCommand({ name: "list-todos", type: LaunchType.UserInitiated });
}

export default function MenuBarTodosCommand() {
  const { todos, isLoading } = useTodos();

  const openTodos = todos.filter((todo) => !todo.completed);
  const overdueCount = openTodos.filter((todo) => isOverdue(todo)).length;
  const openCount = openTodos.length;

  const upcoming = openTodos
    .filter((todo) => todo.dueDate)
    .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime())
    .slice(0, 5);

  const title = openCount === 0 ? undefined : overdueCount > 0 ? `${openCount} (${overdueCount}!)` : `${openCount}`;

  return (
    <MenuBarExtra
      icon={overdueCount > 0 ? { source: Icon.ExclamationMark, tintColor: Color.Red } : Icon.CheckCircle}
      title={title}
      isLoading={isLoading}
      tooltip="Todo"
    >
      <MenuBarExtra.Section title="Next Up">
        {upcoming.length === 0 ? (
          <MenuBarExtra.Item title="No upcoming todos" />
        ) : (
          upcoming.map((todo) => (
            <MenuBarExtra.Item
              key={todo.id}
              title={todo.title}
              subtitle={formatDueDate(todo.dueDate as string)}
              icon={{ source: Icon.Circle, tintColor: isOverdue(todo) ? Color.Red : Color.SecondaryText }}
              onAction={openTodoList}
            />
          ))
        )}
      </MenuBarExtra.Section>
      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="Open Todo List"
          icon={Icon.List}
          shortcut={Keyboard.Shortcut.Common.Open}
          onAction={openTodoList}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
