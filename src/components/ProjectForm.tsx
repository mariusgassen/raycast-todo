import { useState } from "react";
import { Action, ActionPanel, Form, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { Project } from "../lib/types";
import { PROJECT_COLORS, PROJECT_ICONS } from "../lib/project-style";

export interface ProjectFormSubmitValues {
  name: string;
  color: string;
  icon?: string;
}

interface ProjectFormValues {
  name: string;
  color: string;
  icon: string;
}

interface ProjectFormProps {
  project?: Project;
  onSubmit: (values: ProjectFormSubmitValues) => Promise<void>;
}

export function ProjectForm({ project, onSubmit }: ProjectFormProps) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();

  async function handleSubmit(values: ProjectFormValues) {
    const name = values.name.trim();
    if (!name) {
      setNameError("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name, color: values.color, icon: values.icon || undefined });
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
          <Action.SubmitForm title={project ? "Save Project" : "Create Project"} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Name"
        placeholder="Project name"
        defaultValue={project?.name}
        error={nameError}
        onChange={() => setNameError(undefined)}
      />
      <Form.Dropdown id="color" title="Color" defaultValue={project?.color ?? PROJECT_COLORS[0].value}>
        {PROJECT_COLORS.map((color) => (
          <Form.Dropdown.Item
            key={color.value}
            value={color.value}
            title={color.name}
            icon={{ source: Icon.CircleFilled, tintColor: color.value }}
          />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="icon" title="Icon" defaultValue={project?.icon ?? PROJECT_ICONS[0]}>
        {PROJECT_ICONS.map((icon) => (
          <Form.Dropdown.Item key={icon} value={icon} title={icon.replace(/-/g, " ")} icon={icon} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
