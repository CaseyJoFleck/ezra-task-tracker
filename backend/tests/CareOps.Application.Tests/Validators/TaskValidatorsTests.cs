using CareOps.Application.Tasks;
using CareOps.Domain;
using FluentAssertions;

namespace CareOps.Application.Tests.Validators;

public class TaskValidatorsTests
{
    private readonly CreateTaskValidator _create = new();
    private readonly UpdateTaskStatusValidator _patchStatus = new();

    [Fact]
    public async Task Create_task_empty_title_fails()
    {
        var r = await _create.ValidateAsync(new CreateTaskRequest { Title = "" });
        r.IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task Update_task_status_validator_accepts_enum_values()
    {
        var r = await _patchStatus.ValidateAsync(new UpdateTaskStatusRequest { Status = TaskItemStatus.Completed });
        r.IsValid.Should().BeTrue();
    }
}
