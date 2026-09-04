import { useState } from "react";
import { Action, ActionPanel, Form, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { INBOX_PROJECT_ID, Priority, Project, RepeatRule, RepeatUnit, Todo } from "../lib/types";
import { PRIORITIES, PRIORITY_COLORS, PRIORITY_ICONS, PRIORITY_LABELS } from "../lib/priority";
import { DEFAULT_PROJECT_ICON } from "../lib/project-style";
import { REPEAT_UNITS, REPEAT_UNIT_LABELS } from "../lib/repeat";
import { toISODate } from "../lib/date-utils";

export interface TodoFormSubmitValues {
  title: string;
  notes: string;
  projectId: string;
  priority: Priority;
  dueDate?: string;
  repeat?: RepeatRule;
}

type RepeatDropdownValue = RepeatUnit | "none";

interface TodoFormValues {
  title: string;
  notes: string;
  projectId: string;
  priority: string;
  dueDate: Date | null;
  repeatUnit: RepeatDropdownValue;
  repeatInterval: string;
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
  const [dueDateError, setDueDateError] = useState<string | undefined>();
  const [repeatIntervalError, setRepeatIntervalError] = useState<string | undefined>();
  const [repeatUnit, setRepeatUnit] = useState<RepeatDropdownValue>(todo?.repeat?.unit ?? "none");

  async function handleSubmit(values: TodoFormValues) {
    const title = values.title.trim();
    if (!title) {
      setTitleError("Title is required");
      return;
    }

    let repeat: RepeatRule | undefined;
    if (values.repeatUnit !== "none") {
      const interval = parseInt(values.repeatInterval, 10);
      if (!Number.isInteger(interval) || interval < 1) {
        setRepeatIntervalError("Enter a whole number of 1 or more");
        return;
      }
      if (!values.dueDate) {
        setDueDateError("Repeat requires a due date");
        return;
      }
      repeat = { unit: values.repeatUnit, interval };
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        notes: values.notes,
        projectId: values.projectId,
        priority: values.priority as Priority,
        dueDate: values.dueDate ? toISODate(values.dueDate) : undefined,
        repeat,
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
        error={dueDateError}
        onChange={() => setDueDateError(undefined)}
      />
      <Form.Dropdown
        id="repeatUnit"
        title="Repeat"
        value={repeatUnit}
        onChange={(value) => setRepeatUnit(value as RepeatDropdownValue)}
      >
        <Form.Dropdown.Item value="none" title="Never" icon={Icon.XMarkCircle} />
        {REPEAT_UNITS.map((unit) => (
          <Form.Dropdown.Item key={unit} value={unit} title={REPEAT_UNIT_LABELS[unit].plural} icon={Icon.Repeat} />
        ))}
      </Form.Dropdown>
      {repeatUnit !== "none" && (
        <Form.TextField
          id="repeatInterval"
          title="Every"
          placeholder="1"
          defaultValue={String(todo?.repeat?.interval ?? 1)}
          info={`e.g. 2 = every 2 ${REPEAT_UNIT_LABELS[repeatUnit].plural.toLowerCase()}`}
          error={repeatIntervalError}
          onChange={() => setRepeatIntervalError(undefined)}
        />
      )}
    </Form>
  );
}
