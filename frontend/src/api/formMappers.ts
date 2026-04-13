import type { CreateTaskBody, UpdateTaskBody } from "@/api/tasksApi";
import type { TaskFormValues } from "@/schemas/taskForm";

export function taskFormToCreateBody(v: TaskFormValues): CreateTaskBody {
  return {
    title: v.title.trim(),
    description: v.description?.trim() ? v.description.trim() : null,
    status: v.status,
    priority: v.priority,
    assigneeMemberId: v.assigneeMemberId?.trim() ? v.assigneeMemberId.trim() : null,
    dueDateUtc: v.dueDate?.trim() ? new Date(v.dueDate).toISOString() : null,
  };
}

export function taskFormToUpdateBody(v: TaskFormValues): UpdateTaskBody {
  return taskFormToCreateBody(v);
}
