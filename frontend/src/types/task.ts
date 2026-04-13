/** Aligns with API JSON (camelCase enums from backend). */
export type TaskItemStatus = "todo" | "inProgress" | "completed" | "canceled";

/** Todo or in progress — can be overdue and appears in the “active” section when sorting. */
export function isActiveTaskStatus(s: TaskItemStatus): boolean {
  return s === "todo" || s === "inProgress";
}

/** Completed or canceled — sorted to the bottom; not overdue. */
export function isTerminalTaskStatus(s: TaskItemStatus): boolean {
  return s === "completed" || s === "canceled";
}
export type TaskPriority = "low" | "medium" | "high";

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskItemStatus;
  priority: TaskPriority;
  assigneeMemberId: string | null;
  assigneeDisplayName: string | null;
  dueDateUtc: string | null;
  isOverdue: boolean;
  completedAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export type TaskSortField = "created" | "due" | "priority";
export type SortDirection = "asc" | "desc";
