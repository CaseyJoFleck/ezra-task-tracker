import type {
  SortDirection,
  TaskItem,
  TaskItemStatus,
  TaskPriority,
  TaskSortField,
} from "@/types/task";

export function filterTasks(
  tasks: TaskItem[],
  search: string,
  status: TaskItemStatus | "all",
  priority: TaskPriority | "all",
  assigneeMemberId: string | "all",
): TaskItem[] {
  const q = search.trim().toLowerCase();
  return tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false;
    if (status !== "all" && t.status !== status) return false;
    if (priority !== "all" && t.priority !== priority) return false;
    if (assigneeMemberId !== "all") {
      if (assigneeMemberId === "unassigned") {
        if (t.assigneeMemberId !== null) return false;
      } else if (t.assigneeMemberId !== assigneeMemberId) {
        return false;
      }
    }
    return true;
  });
}

export function sortTasks(
  tasks: TaskItem[],
  sortBy: TaskSortField,
  sortDir: SortDirection,
): TaskItem[] {
  const mult = sortDir === "desc" ? -1 : 1;
  const copy = [...tasks];
  copy.sort((a, b) => {
    if (sortBy === "created") {
      return mult * (new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime());
    }
    if (sortBy === "due") {
      const ad = a.dueDateUtc ? new Date(a.dueDateUtc).getTime() : Number.NEGATIVE_INFINITY;
      const bd = b.dueDateUtc ? new Date(b.dueDateUtc).getTime() : Number.NEGATIVE_INFINITY;
      return mult * (ad - bd);
    }
    const pr: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2 };
    return mult * (pr[a.priority] - pr[b.priority]);
  });
  return copy;
}

export function taskStats(tasks: TaskItem[]) {
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "inProgress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const overdue = tasks.filter((t) => t.isOverdue && t.status !== "completed").length;
  return { total, inProgress, overdue, completed };
}
