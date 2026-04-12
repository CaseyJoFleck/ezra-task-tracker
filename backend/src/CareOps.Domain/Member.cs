namespace CareOps.Domain;

public class Member
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Title { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }

    public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
}
