import { TaskListItem } from "@/components/tasks/TaskListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { TaskItem } from "@/types/task";

type Props = {
  tasks: TaskItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
};

export function TaskList({
  tasks,
  selectedId,
  onSelect,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3 py-2" aria-busy="true" aria-label="Loading tasks">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <p className="pt-2 text-center text-xs text-slate-500">Loading tasks…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load tasks"
        message={errorMessage ?? "Something went wrong."}
        onRetry={onRetry}
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks match your filters"
        description="Try adjusting search or filters, or create a new task to get started."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskListItem
            task={task}
            selected={selectedId === task.id}
            onSelect={() => onSelect(task.id)}
          />
        </li>
      ))}
    </ul>
  );
}
