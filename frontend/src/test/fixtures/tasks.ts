import type { TaskItem } from "@/types/task";

const iso = "2026-04-12T12:00:00.000Z";

export function makeTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    id: "task-1",
    title: "Sample task",
    description: null,
    status: "todo",
    priority: "medium",
    assigneeMemberId: null,
    assigneeDisplayName: null,
    dueDateUtc: null,
    isOverdue: false,
    completedAtUtc: null,
    createdAtUtc: iso,
    updatedAtUtc: iso,
    ...overrides,
  };
}
