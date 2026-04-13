import { cn } from "@/lib/cn";
import type { TaskPriority } from "@/types/task";

const labels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const styles: Record<TaskPriority, string> = {
  low: "border-stone-200 bg-stone-100 text-stone-700",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  high: "border-red-200 bg-red-50 text-red-800",
};

export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[priority],
        className,
      )}
    >
      {labels[priority]}
    </span>
  );
}
