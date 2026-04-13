using CareOps.Application.Abstractions;
using CareOps.Application.Exceptions;
using CareOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace CareOps.Application.Tasks;

public interface ITaskService
{
    Task<IReadOnlyList<TaskItemResponse>> ListAsync(
        TaskListQuery query,
        CancellationToken cancellationToken = default);
    Task<TaskItemResponse> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TaskItemResponse> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default);
    Task<TaskItemResponse> UpdateAsync(
        Guid id,
        UpdateTaskRequest request,
        CancellationToken cancellationToken = default);
    Task<TaskItemResponse> UpdateStatusAsync(
        Guid id,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public sealed class TaskService : ITaskService
{
    private readonly IApplicationDbContext _db;

    public TaskService(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<TaskItemResponse>> ListAsync(
        TaskListQuery query,
        CancellationToken cancellationToken = default)
    {
        var q = _db.TaskItems.AsNoTracking().Include(t => t.Assignee).AsQueryable();

        if (query.Status.HasValue)
            q = q.Where(t => t.Status == query.Status.Value);
        if (query.Priority.HasValue)
            q = q.Where(t => t.Priority == query.Priority.Value);
        if (query.AssigneeMemberId.HasValue)
            q = q.Where(t => t.AssigneeMemberId == query.AssigneeMemberId.Value);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim();
            q = q.Where(t => t.Title.Contains(s));
        }

        // SQLite + EF Core: DateTimeOffset predicates and some enum comparisons may not translate.
        // Filter overdue after materialization (same as in-memory sort below).
        var list = await q.ToListAsync(cancellationToken);

        if (query.OverdueOnly == true)
        {
            var now = DateTimeOffset.UtcNow;
            list = list.Where(t =>
                t.DueDateUtc != null
                && t.DueDateUtc < now
                && TaskItemRules.IsActiveStatus(t.Status)).ToList();
        }

        var sortBy = (query.SortBy ?? "created").ToLowerInvariant();
        var desc = string.Equals(query.SortDir, "desc", StringComparison.OrdinalIgnoreCase);

        var ordered = ApplySort(list, sortBy, desc);
        return ordered.Select(Map).ToList();
    }

    public async Task<TaskItemResponse> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.TaskItems
            .AsNoTracking()
            .Include(t => t.Assignee)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (entity is null)
            throw new NotFoundException("Task not found.");
        return Map(entity);
    }

    public async Task<TaskItemResponse> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        if (request.AssigneeMemberId.HasValue)
            await EnsureMemberExistsAsync(request.AssigneeMemberId.Value, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var entity = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Status = request.Status,
            Priority = request.Priority,
            AssigneeMemberId = request.AssigneeMemberId,
            DueDateUtc = request.DueDateUtc,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };
        TaskItemRules.ApplyCompletionTimestamp(entity, entity.Status, now);
        _db.TaskItems.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        await _db.TaskItems.Entry(entity).Reference(e => e.Assignee).LoadAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<TaskItemResponse> UpdateAsync(
        Guid id,
        UpdateTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await _db.TaskItems.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (entity is null)
            throw new NotFoundException("Task not found.");

        if (request.AssigneeMemberId.HasValue)
            await EnsureMemberExistsAsync(request.AssigneeMemberId.Value, cancellationToken);

        entity.Title = request.Title.Trim();
        entity.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        entity.Status = request.Status;
        entity.Priority = request.Priority;
        entity.AssigneeMemberId = request.AssigneeMemberId;
        entity.DueDateUtc = request.DueDateUtc;
        entity.UpdatedAtUtc = DateTimeOffset.UtcNow;
        TaskItemRules.ApplyCompletionTimestamp(entity, entity.Status, DateTimeOffset.UtcNow);

        await _db.SaveChangesAsync(cancellationToken);
        await _db.TaskItems.Entry(entity).Reference(e => e.Assignee).LoadAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<TaskItemResponse> UpdateStatusAsync(
        Guid id,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await _db.TaskItems.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (entity is null)
            throw new NotFoundException("Task not found.");

        var utc = DateTimeOffset.UtcNow;
        entity.Status = request.Status;
        entity.UpdatedAtUtc = utc;
        TaskItemRules.ApplyCompletionTimestamp(entity, request.Status, utc);
        await _db.SaveChangesAsync(cancellationToken);
        await _db.TaskItems.Entry(entity).Reference(e => e.Assignee).LoadAsync(cancellationToken);
        return Map(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.TaskItems.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (entity is null)
            throw new NotFoundException("Task not found.");
        _db.TaskItems.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Active (todo / in progress) first; terminal (completed / canceled) last. Within each group, applies the requested sort.
    /// </summary>
    private static IEnumerable<TaskItem> ApplySort(IReadOnlyList<TaskItem> list, string sortBy, bool desc)
    {
        var byCompletion = list.OrderBy(t => TaskItemRules.IsTerminalStatus(t.Status));
        return sortBy switch
        {
            "due" => desc
                ? byCompletion.ThenByDescending(t => t.DueDateUtc).ThenByDescending(t => t.CreatedAtUtc)
                : byCompletion.ThenBy(t => t.DueDateUtc).ThenBy(t => t.CreatedAtUtc),
            "priority" => desc
                ? byCompletion.ThenByDescending(t => t.Priority).ThenByDescending(t => t.CreatedAtUtc)
                : byCompletion.ThenBy(t => t.Priority).ThenBy(t => t.CreatedAtUtc),
            _ => desc
                ? byCompletion.ThenByDescending(t => t.CreatedAtUtc)
                : byCompletion.ThenBy(t => t.CreatedAtUtc),
        };
    }

    private async Task EnsureMemberExistsAsync(Guid memberId, CancellationToken cancellationToken)
    {
        var exists = await _db.Members.AsNoTracking().AnyAsync(m => m.Id == memberId, cancellationToken);
        if (!exists)
            throw new BadRequestException("Assignee member does not exist.");
    }

    private static TaskItemResponse Map(TaskItem t)
    {
        var now = DateTimeOffset.UtcNow;
        var overdue = TaskItemRules.IsOverdue(t.DueDateUtc, t.Status, now);
        return new TaskItemResponse(
            t.Id,
            t.Title,
            t.Description,
            t.Status,
            t.Priority,
            t.AssigneeMemberId,
            t.Assignee?.DisplayName,
            t.DueDateUtc,
            overdue,
            t.CompletedAtUtc,
            t.CreatedAtUtc,
            t.UpdatedAtUtc);
    }
}
