import { useMemo } from "react";
import { Action, ActionPanel, Alert, Icon, Keyboard, List, confirmAlert } from "@raycast/api";
import { useTodos } from "./hooks/useTodos";
import { ProjectForm, ProjectFormSubmitValues } from "./components/ProjectForm";
import { INBOX_PROJECT_ID, Project } from "./lib/types";
import { DEFAULT_PROJECT_ICON } from "./lib/project-style";

export default function ManageProjectsCommand() {
  const { projects, todos, isLoading, createProject, editProject, removeProject } = useTodos();

  const openTodoCountByProject = useMemo(() => {
    const counts = new Map<string, number>();
    for (const todo of todos) {
      if (todo.completed) continue;
      counts.set(todo.projectId, (counts.get(todo.projectId) ?? 0) + 1);
    }
    return counts;
  }, [todos]);

  async function handleCreate(values: ProjectFormSubmitValues) {
    await createProject(values);
  }

  return (
    <List isLoading={isLoading}>
      <List.EmptyView
        icon={Icon.Folder}
        title="No Projects"
        description="Press ⌘N to add your first project."
        actions={
          <ActionPanel>
            <Action.Push
              icon={Icon.Plus}
              title="New Project"
              shortcut={Keyboard.Shortcut.Common.New}
              target={<ProjectForm onSubmit={handleCreate} />}
            />
          </ActionPanel>
        }
      />
      <List.Section title="Projects" subtitle={String(projects.length)}>
        {projects.map((project) => (
          <ProjectListItem
            key={project.id}
            project={project}
            openTodoCount={openTodoCountByProject.get(project.id) ?? 0}
            onSubmitEdit={async (values) => editProject(project.id, values)}
            onSubmitCreate={handleCreate}
            onDelete={() => removeProject(project.id)}
          />
        ))}
      </List.Section>
    </List>
  );
}

interface ProjectListItemProps {
  project: Project;
  openTodoCount: number;
  onSubmitEdit: (values: ProjectFormSubmitValues) => Promise<void>;
  onSubmitCreate: (values: ProjectFormSubmitValues) => Promise<void>;
  onDelete: () => void;
}

function ProjectListItem({ project, openTodoCount, onSubmitEdit, onSubmitCreate, onDelete }: ProjectListItemProps) {
  const isInbox = project.id === INBOX_PROJECT_ID;

  async function handleDelete() {
    const confirmed = await confirmAlert({
      title: "Delete Project",
      message: `Delete "${project.name}"? Its todos will move to Inbox.`,
      primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
    });
    if (confirmed) onDelete();
  }

  return (
    <List.Item
      title={project.name}
      icon={{ source: (project.icon as Icon) ?? DEFAULT_PROJECT_ICON, tintColor: project.color }}
      accessories={[{ text: `${openTodoCount} open` }]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.Push
              icon={Icon.Plus}
              title="New Project"
              shortcut={Keyboard.Shortcut.Common.New}
              target={<ProjectForm onSubmit={onSubmitCreate} />}
            />
            <Action.Push
              icon={Icon.Pencil}
              title="Edit Project"
              shortcut={Keyboard.Shortcut.Common.Edit}
              target={<ProjectForm project={project} onSubmit={onSubmitEdit} />}
            />
          </ActionPanel.Section>
          {!isInbox && (
            <ActionPanel.Section>
              <Action
                icon={Icon.Trash}
                title="Delete Project"
                style={Action.Style.Destructive}
                shortcut={Keyboard.Shortcut.Common.Remove}
                onAction={handleDelete}
              />
            </ActionPanel.Section>
          )}
        </ActionPanel>
      }
    />
  );
}
