import { Color, Icon } from "@raycast/api";

export const PROJECT_COLORS: { name: string; value: Color }[] = [
  { name: "Red", value: Color.Red },
  { name: "Orange", value: Color.Orange },
  { name: "Yellow", value: Color.Yellow },
  { name: "Green", value: Color.Green },
  { name: "Blue", value: Color.Blue },
  { name: "Purple", value: Color.Purple },
  { name: "Magenta", value: Color.Magenta },
  { name: "Gray", value: Color.SecondaryText },
];

export const PROJECT_ICONS: Icon[] = [
  Icon.Circle,
  Icon.Star,
  Icon.House,
  Icon.Building,
  Icon.Cart,
  Icon.Heart,
  Icon.Book,
  Icon.Code,
  Icon.Airplane,
  Icon.Bolt,
  Icon.Bug,
  Icon.Envelope,
];

export const DEFAULT_PROJECT_ICON = Icon.Circle;
