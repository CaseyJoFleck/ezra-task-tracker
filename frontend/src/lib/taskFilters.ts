import { isActiveTaskStatus, type TaskItem } from "@/types/task";

export function taskStats(tasks: TaskItem[]) {
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "inProgress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const canceled = tasks.filter((t) => t.status === "canceled").length;
  const overdue = tasks.filter((t) => t.isOverdue && isActiveTaskStatus(t.status)).length;
  return { total, inProgress, overdue, completed, canceled };
}
