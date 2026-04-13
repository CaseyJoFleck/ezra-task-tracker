import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ApiError, getProblemMessage } from "@/api/client";
import { taskFormToUpdateBody } from "@/api/formMappers";
import { applyServerValidationErrors } from "@/api/validation";
import { updateTask } from "@/api/tasksApi";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import type { Member } from "@/types/member";
import type { TaskItem } from "@/types/task";
import { taskFormSchema, type TaskFormValues } from "@/schemas/taskForm";

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  task: TaskItem | null;
  members: Member[];
};

export function EditTaskModal({ open, onClose, task, members }: Props) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assigneeMemberId: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (!task || !open) return;
    reset({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      assigneeMemberId: task.assigneeMemberId ?? "",
      dueDate: toDatetimeLocal(task.dueDateUtc),
    });
  }, [task, open, reset]);

  const mutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReturnType<typeof taskFormToUpdateBody> }) =>
      updateTask(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated");
      onClose();
    },
    onError: (err: unknown) => {
      if (!applyServerValidationErrors(err, setError)) {
        const msg = err instanceof ApiError ? getProblemMessage(err.body) : "Could not update task";
        toast.error(msg);
      }
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    if (!task) return;
    mutation.mutate({ id: task.id, body: taskFormToUpdateBody(data) });
  };

  const busy = mutation.isPending;

  if (!task) return null;

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title="Edit task" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="edit-title"
            disabled={busy}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
            {...register("title")}
          />
          {errors.title ? (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="edit-desc" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="edit-desc"
            rows={3}
            disabled={busy}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
            {...register("description")}
          />
          {errors.description ? (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="edit-status"
              disabled={busy}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
              {...register("status")}
            >
              <option value="todo">Todo</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-priority" className="block text-sm font-medium text-slate-700">
              Priority
            </label>
            <select
              id="edit-priority"
              disabled={busy}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
              {...register("priority")}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-assignee" className="block text-sm font-medium text-slate-700">
              Assignee
            </label>
            <select
              id="edit-assignee"
              disabled={busy}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
              {...register("assigneeMemberId")}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-due" className="block text-sm font-medium text-slate-700">
              Due date
            </label>
            <input
              id="edit-due"
              type="datetime-local"
              disabled={busy}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
              {...register("dueDate")}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
