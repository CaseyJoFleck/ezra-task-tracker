using CareOps.Domain;
using Microsoft.EntityFrameworkCore;

namespace CareOps.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task EnsureSeededAsync(ApplicationDbContext db, CancellationToken cancellationToken = default)
    {
        await db.Database.EnsureCreatedAsync(cancellationToken);
        await ApplySqlitePragmasAsync(db, cancellationToken);

        if (await db.Members.AnyAsync(cancellationToken))
            return;

        var now = DateTimeOffset.UtcNow;
        var m1 = new Member { Id = Guid.NewGuid(), DisplayName = "Alex Rivera", Email = "alex@careops.local", Title = "Care Ops Lead", CreatedAtUtc = now };
        var m2 = new Member { Id = Guid.NewGuid(), DisplayName = "Jordan Lee", Email = "jordan@careops.local", Title = "Coordinator", CreatedAtUtc = now };
        var m3 = new Member { Id = Guid.NewGuid(), DisplayName = "Sam Patel", Email = "sam@careops.local", Title = "Vendor Liaison", CreatedAtUtc = now };

        db.Members.AddRange(m1, m2, m3);

        db.TaskItems.AddRange(
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Follow up with linen vendor contract renewal",
                Description = "Confirm pricing for Q3 and capture signed addendum.",
                Status = TaskItemStatus.InProgress,
                Priority = TaskPriority.High,
                AssigneeMemberId = m1.Id,
                DueDateUtc = now.AddDays(2),
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            },
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Update room turnover checklist template",
                Status = TaskItemStatus.Todo,
                Priority = TaskPriority.Medium,
                AssigneeMemberId = m2.Id,
                DueDateUtc = now.AddDays(7),
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            },
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Archive last month ops meeting notes",
                Status = TaskItemStatus.Completed,
                Priority = TaskPriority.Low,
                AssigneeMemberId = m3.Id,
                DueDateUtc = now.AddDays(-1),
                CompletedAtUtc = now.AddDays(-2),
                CreatedAtUtc = now.AddDays(-10),
                UpdatedAtUtc = now.AddDays(-2),
            },
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Schedule fire drill walkthrough with facilities",
                Status = TaskItemStatus.Todo,
                Priority = TaskPriority.High,
                AssigneeMemberId = null,
                DueDateUtc = now.AddDays(-3),
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            },
            new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = "Retire legacy badge printer request form",
                Description = "Superseded by intake v2.",
                Status = TaskItemStatus.Canceled,
                Priority = TaskPriority.Low,
                AssigneeMemberId = null,
                DueDateUtc = now.AddDays(14),
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            });

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task ApplySqlitePragmasAsync(ApplicationDbContext db, CancellationToken cancellationToken)
    {
        await db.Database.ExecuteSqlRawAsync("PRAGMA journal_mode=WAL;", cancellationToken);
        await db.Database.ExecuteSqlRawAsync("PRAGMA busy_timeout=5000;", cancellationToken);
    }
}
