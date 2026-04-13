using CareOps.Domain;

namespace CareOps.Application.Tasks;

public static class TaskItemRules
{
    public static bool IsOverdue(DateTimeOffset? dueDateUtc, TaskItemStatus status, DateTimeOffset utcNow) =>
        dueDateUtc.HasValue
        && dueDateUtc < utcNow
        && status != TaskItemStatus.Completed;

    public static void ApplyCompletionTimestamp(TaskItem entity, TaskItemStatus status, DateTimeOffset utcNow)
    {
        if (status == TaskItemStatus.Completed)
            entity.CompletedAtUtc ??= utcNow;
        else
            entity.CompletedAtUtc = null;
    }
}
