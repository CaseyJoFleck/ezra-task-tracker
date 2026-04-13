import { cn } from "@/lib/cn";
import type { TaskItemStatus } from "@/types/task";

const labels: Record<TaskItemStatus, string> = {
  todo: "Todo",
  inProgress: "In Progress",
  completed: "Completed",
};

const styles: Record<TaskItemStatus, string> = {
  todo: "border-slate-200 bg-slate-100 text-slate-700",
  inProgress: "border-sky-200 bg-sky-50 text-sky-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function StatusBadge({ status, className }: { status: TaskItemStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
