import { Color, Icon } from "@raycast/api";
import { Priority } from "./types";

export const PRIORITIES: Priority[] = ["high", "medium", "low"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const PRIORITY_COLORS: Record<Priority, Color> = {
  high: Color.Red,
  medium: Color.Yellow,
  low: Color.SecondaryText,
};

export const PRIORITY_ICONS: Record<Priority, Icon> = {
  high: Icon.ExclamationMark,
  medium: Icon.Circle,
  low: Icon.CircleProgress25,
};
