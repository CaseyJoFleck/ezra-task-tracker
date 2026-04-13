using CareOps.Domain;

namespace CareOps.Application.Tasks;

public static class TaskItemRules
{
    public static bool IsActiveStatus(TaskItemStatus status) =>
        status is TaskItemStatus.Todo or TaskItemStatus.InProgress;

    /// <summary>Completed and canceled sort to the bottom of lists and do not count as overdue.</summary>
    public static bool IsTerminalStatus(TaskItemStatus status) =>
        status is TaskItemStatus.Completed or TaskItemStatus.Canceled;

    public static bool IsOverdue(DateTimeOffset? dueDateUtc, TaskItemStatus status, DateTimeOffset utcNow) =>
        dueDateUtc.HasValue
        && dueDateUtc < utcNow
        && IsActiveStatus(status);

    public static void ApplyCompletionTimestamp(TaskItem entity, TaskItemStatus status, DateTimeOffset utcNow)
    {
        if (status == TaskItemStatus.Completed)
            entity.CompletedAtUtc ??= utcNow;
        else
            entity.CompletedAtUtc = null;
    }
}
