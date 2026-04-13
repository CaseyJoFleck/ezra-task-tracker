using CareOps.Application.Abstractions;
using CareOps.Application.Exceptions;
using CareOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace CareOps.Application.Members;

public interface IMemberService
{
    Task<IReadOnlyList<MemberResponse>> ListAsync(CancellationToken cancellationToken = default);
    Task<MemberResponse> CreateAsync(CreateMemberRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public sealed class MemberService : IMemberService
{
    private readonly IApplicationDbContext _db;

    public MemberService(IApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<MemberResponse>> ListAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _db.Members
            .AsNoTracking()
            .OrderBy(m => m.DisplayName)
            .Select(m => new MemberResponse(m.Id, m.DisplayName, m.Email, m.Title, m.CreatedAtUtc))
            .ToListAsync(cancellationToken);
        return rows;
    }

    public async Task<MemberResponse> CreateAsync(CreateMemberRequest request, CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var entity = new Member
        {
            Id = Guid.NewGuid(),
            DisplayName = request.DisplayName.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            Title = string.IsNullOrWhiteSpace(request.Title) ? null : request.Title.Trim(),
            CreatedAtUtc = now,
        };
        _db.Members.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return new MemberResponse(entity.Id, entity.DisplayName, entity.Email, entity.Title, entity.CreatedAtUtc);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Members.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        if (entity is null)
            throw new NotFoundException("Member not found.");

        _db.Members.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
