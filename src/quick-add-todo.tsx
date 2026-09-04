import { Toast, showHUD, showToast } from "@raycast/api";
import { addTodo } from "./lib/storage";
import { parseTitleWithDueDate } from "./lib/date-utils";

interface Arguments {
  title: string;
}

export default async function QuickAddTodoCommand(props: { arguments: Arguments }) {
  const rawTitle = props.arguments.title?.trim();
  if (!rawTitle) {
    await showHUD("⚠️ Please provide a title");
    return;
  }

  const { title, dueDate } = parseTitleWithDueDate(rawTitle);

  try {
    await addTodo({ title, dueDate });
    const dueSuffix = dueDate ? ` (due ${new Date(dueDate).toLocaleDateString()})` : "";
    await showHUD(`✅ Added "${title}"${dueSuffix}`);
  } catch (error) {
    await showToast({ style: Toast.Style.Failure, title: "Failed to add todo", message: String(error) });
  }
}
