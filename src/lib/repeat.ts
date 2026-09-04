import { RepeatRule, RepeatUnit } from "./types";

export const REPEAT_UNITS: RepeatUnit[] = ["day", "week", "month", "year"];

export const REPEAT_UNIT_LABELS: Record<RepeatUnit, { singular: string; plural: string }> = {
  day: { singular: "Day", plural: "Days" },
  week: { singular: "Week", plural: "Weeks" },
  month: { singular: "Month", plural: "Months" },
  year: { singular: "Year", plural: "Years" },
};

export function formatRepeatRule(repeat: RepeatRule): string {
  const { singular, plural } = REPEAT_UNIT_LABELS[repeat.unit];
  if (repeat.interval === 1) {
    return `Every ${singular.toLowerCase()}`;
  }
  return `Every ${repeat.interval} ${plural.toLowerCase()}`;
}
