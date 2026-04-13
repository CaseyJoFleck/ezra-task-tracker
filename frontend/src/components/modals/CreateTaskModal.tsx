import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import type { Member } from "@/types/member";
import { taskFormSchema, type TaskFormValues } from "@/schemas/taskForm";

type Props = {
  open: boolean;
  onClose: () => void;
  members: Member[];
};

export function CreateTaskModal({ open, onClose, members }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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

  const onSubmit = async (_data: TaskFormValues) => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Task created", {
      description: "This is a demo — connect to the API when ready.",
    });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={isSubmitting ? () => {} : onClose} title="Create task" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="create-title" className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="create-title"
            autoComplete="off"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
            {...register("title")}
          />
          {errors.title ? (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="create-desc" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="create-desc"
            rows={3}
            disabled={isSubmitting}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
            {...register("description")}
          />
          {errors.description ? (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="create-status" className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="create-status"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
              {...register("status")}
            >
              <option value="todo">Todo</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label htmlFor="create-priority" className="block text-sm font-medium text-slate-700">
              Priority
            </label>
            <select
              id="create-priority"
              disabled={isSubmitting}
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
            <label htmlFor="create-assignee" className="block text-sm font-medium text-slate-700">
              Assignee
            </label>
            <select
              id="create-assignee"
              disabled={isSubmitting}
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
            <label htmlFor="create-due" className="block text-sm font-medium text-slate-700">
              Due date
            </label>
            <input
              id="create-due"
              type="datetime-local"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none ring-slate-300 focus:ring-2 disabled:bg-slate-50"
              {...register("dueDate")}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
