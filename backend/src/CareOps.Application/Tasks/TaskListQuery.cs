using CareOps.Domain;

namespace CareOps.Application.Tasks;

public sealed class TaskListQuery
{
    public TaskItemStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public Guid? AssigneeMemberId { get; set; }
    public string? Search { get; set; }
    public string SortBy { get; set; } = "created";
    public string SortDir { get; set; } = "desc";
    public bool? OverdueOnly { get; set; }
}
