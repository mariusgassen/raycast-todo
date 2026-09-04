import { useState } from "react";
import { Action, ActionPanel, Form, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { INBOX_PROJECT_ID, Priority, Project, Todo } from "../lib/types";
import { PRIORITIES, PRIORITY_COLORS, PRIORITY_ICONS, PRIORITY_LABELS } from "../lib/priority";
import { DEFAULT_PROJECT_ICON } from "../lib/project-style";
import { toISODate } from "../lib/date-utils";

export interface TodoFormSubmitValues {
  title: string;
  notes: string;
  projectId: string;
  priority: Priority;
  dueDate?: string;
}

interface TodoFormValues {
  title: string;
  notes: string;
  projectId: string;
  priority: string;
  dueDate: Date | null;
}

interface TodoFormProps {
  todo?: Todo;
  projects: Project[];
  onSubmit: (values: TodoFormSubmitValues) => Promise<void>;
}

export function TodoForm({ todo, projects, onSubmit }: TodoFormProps) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | undefined>();

  async function handleSubmit(values: TodoFormValues) {
    const title = values.title.trim();
    if (!title) {
      setTitleError("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        notes: values.notes,
        projectId: values.projectId,
        priority: values.priority as Priority,
        dueDate: values.dueDate ? toISODate(values.dueDate) : undefined,
      });
      pop();
    } catch (error) {
      await showToast({ style: Toast.Style.Failure, title: "Something went wrong", message: String(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm title={todo ? "Save Todo" : "Create Todo"} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        placeholder="What needs to be done?"
        defaultValue={todo?.title}
        error={titleError}
        onChange={() => setTitleError(undefined)}
      />
      <Form.TextArea
        id="notes"
        title="Notes"
        placeholder="Add details… (Markdown supported)"
        defaultValue={todo?.notes}
      />
      <Form.Dropdown id="projectId" title="Project" defaultValue={todo?.projectId ?? INBOX_PROJECT_ID}>
        {projects.map((project) => (
          <Form.Dropdown.Item
            key={project.id}
            value={project.id}
            title={project.name}
            icon={{ source: (project.icon as Icon) ?? DEFAULT_PROJECT_ICON, tintColor: project.color }}
          />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="priority" title="Priority" defaultValue={todo?.priority ?? "medium"}>
        {PRIORITIES.map((priority) => (
          <Form.Dropdown.Item
            key={priority}
            value={priority}
            title={PRIORITY_LABELS[priority]}
            icon={{ source: PRIORITY_ICONS[priority], tintColor: PRIORITY_COLORS[priority] }}
          />
        ))}
      </Form.Dropdown>
      <Form.DatePicker
        id="dueDate"
        title="Due Date"
        type={Form.DatePicker.Type.Date}
        defaultValue={todo?.dueDate ? new Date(todo.dueDate) : null}
      />
    </Form>
  );
}
