import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { TaskItem } from "@/types/task";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { StatusBadge } from "@/components/tasks/StatusBadge";

type Props = {
  task: TaskItem;
  selected: boolean;
  onSelect: () => void;
};

export function TaskListItem({ task, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border bg-white p-4 text-left shadow-card transition-all hover:shadow-card-hover",
        selected
          ? "border-sky-300 ring-2 ring-sky-200/80"
          : "border-slate-100 hover:border-slate-200",
      )}
    >
      <h3 className="font-semibold text-slate-900">{task.title}</h3>
      {task.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{task.description}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        <span className="text-xs text-slate-500">
          {task.assigneeDisplayName ?? "Unassigned"}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Due {task.dueDateUtc ? formatDate(task.dueDateUtc) : "—"}
        {task.isOverdue && task.status !== "completed" ? (
          <span className="ml-2 font-medium text-amber-800">Overdue</span>
        ) : null}
      </p>
    </button>
  );
}
