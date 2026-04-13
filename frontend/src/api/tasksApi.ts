import { apiFetch } from "@/api/client";
import type {
  SortDirection,
  TaskItem,
  TaskItemStatus,
  TaskPriority,
  TaskSortField,
} from "@/types/task";

export type TaskListParams = {
  status?: TaskItemStatus;
  priority?: TaskPriority;
  assigneeMemberId?: string;
  search?: string;
  sortBy: TaskSortField;
  sortDir: SortDirection;
};

function buildTasksQuery(params: Partial<TaskListParams>): string {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.priority) sp.set("priority", params.priority);
  if (params.assigneeMemberId) sp.set("assigneeMemberId", params.assigneeMemberId);
  if (params.search?.trim()) sp.set("search", params.search.trim());
  if (params.sortBy) sp.set("sortBy", params.sortBy);
  if (params.sortDir) sp.set("sortDir", params.sortDir);
  const q = sp.toString();
  return q ? `?${q}` : "";
}

/** All tasks (backend default sort) — for stats cards. */
export async function fetchTasksForStats(): Promise<TaskItem[]> {
  return apiFetch<TaskItem[]>("/api/tasks");
}

/** Filtered/sorted list. When `unassignedOnly`, the API is called without assignee filter and results are filtered client-side (no unassigned-only query on the server). */
export async function fetchTasksList(
  params: TaskListParams,
  options: { unassignedOnly?: boolean } = {},
): Promise<TaskItem[]> {
  const { unassignedOnly } = options;
  const serverParams: Partial<TaskListParams> = {
    sortBy: params.sortBy,
    sortDir: params.sortDir,
  };
  if (params.status) serverParams.status = params.status;
  if (params.priority) serverParams.priority = params.priority;
  if (params.search?.trim()) serverParams.search = params.search;
  if (params.assigneeMemberId) serverParams.assigneeMemberId = params.assigneeMemberId;

  const list = await apiFetch<TaskItem[]>(`/api/tasks${buildTasksQuery(serverParams)}`);
  if (unassignedOnly) {
    return list.filter((t) => t.assigneeMemberId == null);
  }
  return list;
}

export type CreateTaskBody = {
  title: string;
  description: string | null;
  status: TaskItemStatus;
  priority: TaskPriority;
  assigneeMemberId: string | null;
  dueDateUtc: string | null;
};

export type UpdateTaskBody = CreateTaskBody;

export async function createTask(body: CreateTaskBody): Promise<TaskItem> {
  return apiFetch<TaskItem>("/api/tasks", {
    method: "POST",
    body: JSON.stringify({
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      assigneeMemberId: body.assigneeMemberId,
      dueDateUtc: body.dueDateUtc,
    }),
  });
}

export async function updateTask(id: string, body: UpdateTaskBody): Promise<TaskItem> {
  return apiFetch<TaskItem>(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      assigneeMemberId: body.assigneeMemberId,
      dueDateUtc: body.dueDateUtc,
    }),
  });
}

export async function patchTaskStatus(id: string, status: TaskItemStatus): Promise<TaskItem> {
  return apiFetch<TaskItem>(`/api/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" });
}
