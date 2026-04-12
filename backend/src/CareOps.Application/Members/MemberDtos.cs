namespace CareOps.Application.Members;

public sealed record MemberResponse(
    Guid Id,
    string DisplayName,
    string? Email,
    string? Title,
    DateTimeOffset CreatedAtUtc);

public sealed class CreateMemberRequest
{
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Title { get; set; }
}
