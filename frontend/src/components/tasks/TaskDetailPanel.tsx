import { Calendar, Pencil, Trash2, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatDateTime } from "@/lib/format";
import { isActiveTaskStatus, isTerminalTaskStatus, type TaskItem } from "@/types/task";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { StatusBadge } from "@/components/tasks/StatusBadge";

type Props = {
  task: TaskItem | null;
  onEdit: () => void;
  onDelete: () => void;
  onMarkComplete: () => void;
  onReopen: () => void;
  /** Disables Mark complete / Reopen while PATCH status is in flight */
  statusActionBusy?: boolean;
};

export function TaskDetailPanel({
  task,
  onEdit,
  onDelete,
  onMarkComplete,
  onReopen,
  statusActionBusy,
}: Props) {
  if (!task) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-card">
        <EmptyState
          title="Select a task"
          description="Choose a task from the list to view details, edit, or update status."
        />
      </div>
    );
  }

  const canComplete = isActiveTaskStatus(task.status);
  const canReopen = isTerminalTaskStatus(task.status);
  const isDone = isTerminalTaskStatus(task.status);

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-card">
      <div
        className={cn(
          "border-b border-slate-100 px-6 py-5",
          isDone && "bg-slate-50/80",
        )}
      >
        <h2
          className={cn(
            "text-xl font-semibold",
            isDone ? "text-slate-500 line-through decoration-slate-400" : "text-slate-900",
          )}
        >
          {task.title}
        </h2>
        {task.description ? (
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed",
              isDone ? "text-slate-500" : "text-slate-600",
            )}
          >
            {task.description}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-slate-400">No description</p>
        )}
      </div>
      <dl className="space-y-4 px-6 py-5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <dt className="w-28 shrink-0 font-medium text-slate-500">Status</dt>
          <dd>
            <StatusBadge status={task.status} />
          </dd>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <dt className="w-28 shrink-0 font-medium text-slate-500">Priority</dt>
          <dd>
            <PriorityBadge priority={task.priority} />
          </dd>
        </div>
        <div className="flex flex-wrap gap-2">
          <dt className="w-28 shrink-0 font-medium text-slate-500">Assignee</dt>
          <dd className="text-slate-800">{task.assigneeDisplayName ?? "Unassigned"}</dd>
        </div>
        <div className="flex flex-wrap gap-2">
          <dt className="flex w-32 shrink-0 items-center gap-1 font-medium text-slate-500">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            Due date
          </dt>
          <dd className="text-slate-800">
            {task.dueDateUtc ? formatDate(task.dueDateUtc) : "—"}
            {task.isOverdue && isActiveTaskStatus(task.status) ? (
              <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900">
                Overdue
              </span>
            ) : null}
          </dd>
        </div>
        <div className="border-t border-slate-100 pt-4 text-xs text-slate-500">
          <p>Created {formatDateTime(task.createdAtUtc)}</p>
          <p className="mt-1">Updated {formatDateTime(task.updatedAtUtc)}</p>
          {task.completedAtUtc ? (
            <p className="mt-1">Completed {formatDateTime(task.completedAtUtc)}</p>
          ) : null}
        </div>
      </dl>
      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-6 py-4">
        <Button type="button" variant="secondary" onClick={onEdit} disabled={statusActionBusy}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        {canComplete ? (
          <Button type="button" onClick={onMarkComplete} disabled={statusActionBusy}>
            <CheckCircle className="h-4 w-4" />
            {statusActionBusy ? "Updating…" : "Mark complete"}
          </Button>
        ) : null}
        {canReopen ? (
          <Button type="button" variant="secondary" onClick={onReopen} disabled={statusActionBusy}>
            <RotateCcw className="h-4 w-4" />
            {statusActionBusy ? "Updating…" : "Reopen"}
          </Button>
        ) : null}
        <Button type="button" variant="danger" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
