using CareOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace CareOps.Application.Abstractions;

public interface IApplicationDbContext
{
    DbSet<Member> Members { get; }
    DbSet<TaskItem> TaskItems { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
