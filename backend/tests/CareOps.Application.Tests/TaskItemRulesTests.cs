using CareOps.Application.Tasks;
using CareOps.Domain;
using FluentAssertions;

namespace CareOps.Application.Tests;

public class TaskItemRulesTests
{
    private static readonly DateTimeOffset FixedNow = DateTimeOffset.Parse("2026-04-12T12:00:00Z");

    [Fact]
    public void IsOverdue_true_when_past_due_and_not_completed()
    {
        var due = FixedNow.AddDays(-1);
        TaskItemRules.IsOverdue(due, TaskItemStatus.Todo, FixedNow).Should().BeTrue();
        TaskItemRules.IsOverdue(due, TaskItemStatus.InProgress, FixedNow).Should().BeTrue();
    }

    [Fact]
    public void IsOverdue_false_when_completed_or_no_due_or_future_due()
    {
        var past = FixedNow.AddDays(-1);
        TaskItemRules.IsOverdue(past, TaskItemStatus.Completed, FixedNow).Should().BeFalse();
        TaskItemRules.IsOverdue(null, TaskItemStatus.Todo, FixedNow).Should().BeFalse();
        TaskItemRules.IsOverdue(FixedNow.AddDays(1), TaskItemStatus.Todo, FixedNow).Should().BeFalse();
    }

    [Fact]
    public void ApplyCompletionTimestamp_sets_completed_at_once_and_clears_when_reopened()
    {
        var utc = FixedNow;
        var entity = new TaskItem { CompletedAtUtc = null };

        TaskItemRules.ApplyCompletionTimestamp(entity, TaskItemStatus.Completed, utc);
        entity.CompletedAtUtc.Should().Be(utc);

        TaskItemRules.ApplyCompletionTimestamp(entity, TaskItemStatus.Completed, utc.AddHours(1));
        entity.CompletedAtUtc.Should().Be(utc);

        TaskItemRules.ApplyCompletionTimestamp(entity, TaskItemStatus.Todo, utc.AddHours(2));
        entity.CompletedAtUtc.Should().BeNull();
    }
}
