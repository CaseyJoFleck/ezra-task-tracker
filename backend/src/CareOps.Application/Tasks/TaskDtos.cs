using CareOps.Domain;

namespace CareOps.Application.Tasks;

public sealed record TaskItemResponse(
    Guid Id,
    string Title,
    string? Description,
    TaskStatus Status,
    TaskPriority Priority,
    Guid? AssigneeMemberId,
    string? AssigneeDisplayName,
    DateTimeOffset? DueDateUtc,
    bool IsOverdue,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Todo;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public Guid? AssigneeMemberId { get; set; }
    public DateTimeOffset? DueDateUtc { get; set; }
}

public sealed class UpdateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public Guid? AssigneeMemberId { get; set; }
    public DateTimeOffset? DueDateUtc { get; set; }
}

public sealed class UpdateTaskStatusRequest
{
    public TaskStatus Status { get; set; }
}
