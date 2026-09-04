import { describe, expect, it } from "vitest";
import {
  formatDueDate,
  getDueBucket,
  groupTodosByDueDate,
  isDueTodayOrOverdue,
  isOverdue,
  parseTitleWithDueDate,
  toISODate,
} from "./date-utils";
import { Todo } from "./types";

// Friday, September 4, 2026.
const NOW = new Date(2026, 8, 4);

function todo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: "1",
    title: "Test",
    notes: "",
    projectId: "inbox",
    priority: "medium",
    completed: false,
    createdAt: NOW.toISOString(),
    ...overrides,
  };
}

describe("getDueBucket", () => {
  it("buckets a todo with no due date as noDate", () => {
    expect(getDueBucket(todo(), NOW)).toBe("noDate");
  });

  it("buckets a past due date as overdue", () => {
    expect(getDueBucket(todo({ dueDate: toISODate(new Date(2026, 8, 1)) }), NOW)).toBe("overdue");
  });

  it("buckets today as today", () => {
    expect(getDueBucket(todo({ dueDate: toISODate(NOW) }), NOW)).toBe("today");
  });

  it("buckets 6 days out as thisWeek (inclusive boundary)", () => {
    expect(getDueBucket(todo({ dueDate: toISODate(new Date(2026, 8, 10)) }), NOW)).toBe("thisWeek");
  });

  it("buckets 7 days out as later", () => {
    expect(getDueBucket(todo({ dueDate: toISODate(new Date(2026, 8, 11)) }), NOW)).toBe("later");
  });
});

describe("isOverdue / isDueTodayOrOverdue", () => {
  it("a completed todo is never overdue, even with a past due date", () => {
    const t = todo({ dueDate: toISODate(new Date(2026, 8, 1)), completed: true });
    expect(isOverdue(t, NOW)).toBe(false);
    expect(isDueTodayOrOverdue(t, NOW)).toBe(false);
  });

  it("an open past-due todo is overdue and due-today-or-overdue", () => {
    const t = todo({ dueDate: toISODate(new Date(2026, 8, 1)) });
    expect(isOverdue(t, NOW)).toBe(true);
    expect(isDueTodayOrOverdue(t, NOW)).toBe(true);
  });

  it("a todo due today is not overdue but is due-today-or-overdue", () => {
    const t = todo({ dueDate: toISODate(NOW) });
    expect(isOverdue(t, NOW)).toBe(false);
    expect(isDueTodayOrOverdue(t, NOW)).toBe(true);
  });

  it("a todo due later is neither", () => {
    const t = todo({ dueDate: toISODate(new Date(2026, 8, 20)) });
    expect(isOverdue(t, NOW)).toBe(false);
    expect(isDueTodayOrOverdue(t, NOW)).toBe(false);
  });
});

describe("groupTodosByDueDate", () => {
  it("groups todos into fixed, ordered buckets", () => {
    const todos = [
      todo({ id: "later", dueDate: toISODate(new Date(2026, 8, 20)) }),
      todo({ id: "today", dueDate: toISODate(NOW) }),
      todo({ id: "noDate" }),
      todo({ id: "overdue", dueDate: toISODate(new Date(2026, 8, 1)) }),
    ];

    const groups = groupTodosByDueDate(todos);

    expect(groups.map((g) => g.bucket)).toEqual(["overdue", "today", "thisWeek", "later", "noDate"]);
    expect(groups.find((g) => g.bucket === "overdue")?.todos.map((t) => t.id)).toEqual(["overdue"]);
    expect(groups.find((g) => g.bucket === "today")?.todos.map((t) => t.id)).toEqual(["today"]);
    expect(groups.find((g) => g.bucket === "later")?.todos.map((t) => t.id)).toEqual(["later"]);
    expect(groups.find((g) => g.bucket === "noDate")?.todos.map((t) => t.id)).toEqual(["noDate"]);
    expect(groups.find((g) => g.bucket === "thisWeek")?.todos).toEqual([]);
  });
});

describe("formatDueDate", () => {
  it("labels today, tomorrow and yesterday", () => {
    expect(formatDueDate(toISODate(NOW), NOW)).toBe("Today");
    expect(formatDueDate(toISODate(new Date(2026, 8, 5)), NOW)).toBe("Tomorrow");
    expect(formatDueDate(toISODate(new Date(2026, 8, 3)), NOW)).toBe("Yesterday");
  });
});

describe("parseTitleWithDueDate", () => {
  it("parses English relative dates and strips them from the title", () => {
    const result = parseTitleWithDueDate("Buy milk tomorrow", NOW);
    expect(result.title).toBe("Buy milk");
    expect(result.dueDate).toBe(toISODate(new Date(2026, 8, 5)));
  });

  it("parses German relative dates", () => {
    const result = parseTitleWithDueDate("Zahnarzt anrufen morgen", NOW);
    expect(result.title).toBe("Zahnarzt anrufen");
    expect(result.dueDate).toBe(toISODate(new Date(2026, 8, 5)));
  });

  it("parses 'in N days' / 'in N tagen'", () => {
    expect(parseTitleWithDueDate("Pay rent in 3 days", NOW).dueDate).toBe(toISODate(new Date(2026, 8, 7)));
    expect(parseTitleWithDueDate("Miete zahlen in 3 tagen", NOW).dueDate).toBe(toISODate(new Date(2026, 8, 7)));
  });

  it("parses a weekday name, rolling to the next occurrence", () => {
    // NOW is Friday, Sept 4 2026 — the next Monday is Sept 7.
    const result = parseTitleWithDueDate("Review PR monday", NOW);
    expect(result.title).toBe("Review PR");
    expect(result.dueDate).toBe(toISODate(new Date(2026, 8, 7)));
  });

  it("strips a leading 'on'/'am' before the weekday", () => {
    const result = parseTitleWithDueDate("Review PR on monday", NOW);
    expect(result.title).toBe("Review PR");
    expect(result.dueDate).toBe(toISODate(new Date(2026, 8, 7)));
  });

  it("leaves titles without a recognizable date phrase untouched", () => {
    const result = parseTitleWithDueDate("Just a plain title", NOW);
    expect(result.title).toBe("Just a plain title");
    expect(result.dueDate).toBeUndefined();
  });

  it("does not strip a date phrase that would leave an empty title", () => {
    const result = parseTitleWithDueDate("Morgen", NOW);
    expect(result.title).toBe("Morgen");
    expect(result.dueDate).toBeUndefined();
  });
});
