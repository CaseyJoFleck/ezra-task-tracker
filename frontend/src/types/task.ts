/** Aligns with API JSON (camelCase enums from backend). */
export type TaskItemStatus = "todo" | "inProgress" | "completed";
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
