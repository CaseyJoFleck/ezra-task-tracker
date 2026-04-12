using CareOps.Application.Tasks;
using CareOps.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CareOps.Api.Controllers;

[ApiController]
[Route("api/tasks")]
[Produces("application/json")]
public sealed class TasksController : ControllerBase
{
    private readonly ITaskService _tasks;

    public TasksController(ITaskService tasks) => _tasks = tasks;

    /// <summary>List tasks with optional filters.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TaskItemResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TaskItemResponse>>> GetList(
        [FromQuery] TaskStatus? status,
        [FromQuery] TaskPriority? priority,
        [FromQuery] Guid? assigneeMemberId,
        [FromQuery] string? search,
        [FromQuery] string sortBy = "created",
        [FromQuery] string sortDir = "desc",
        [FromQuery] bool? overdueOnly = null,
        CancellationToken cancellationToken = default)
    {
        var query = new TaskListQuery
        {
            Status = status,
            Priority = priority,
            AssigneeMemberId = assigneeMemberId,
            Search = search,
            SortBy = sortBy,
            SortDir = sortDir,
            OverdueOnly = overdueOnly,
        };
        var list = await _tasks.ListAsync(query, cancellationToken);
        return Ok(list);
    }

    /// <summary>Get a single task.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskItemResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var task = await _tasks.GetAsync(id, cancellationToken);
        return Ok(task);
    }

    /// <summary>Create a task.</summary>
    [HttpPost]
    [EnableRateLimiting("mutating")]
    [ProducesResponseType(typeof(TaskItemResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskItemResponse>> Create([FromBody] CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var created = await _tasks.CreateAsync(request, cancellationToken);
        return Created($"/api/tasks/{created.Id}", created);
    }

    /// <summary>Replace a task.</summary>
    [HttpPut("{id:guid}")]
    [EnableRateLimiting("mutating")]
    [ProducesResponseType(typeof(TaskItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskItemResponse>> Update(Guid id, [FromBody] UpdateTaskRequest request, CancellationToken cancellationToken)
    {
        var updated = await _tasks.UpdateAsync(id, request, cancellationToken);
        return Ok(updated);
    }

    /// <summary>Update task status (complete / reopen / in progress).</summary>
    [HttpPatch("{id:guid}/status")]
    [EnableRateLimiting("mutating")]
    [ProducesResponseType(typeof(TaskItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskItemResponse>> PatchStatus(Guid id, [FromBody] UpdateTaskStatusRequest request, CancellationToken cancellationToken)
    {
        var updated = await _tasks.UpdateStatusAsync(id, request, cancellationToken);
        return Ok(updated);
    }

    /// <summary>Delete a task.</summary>
    [HttpDelete("{id:guid}")]
    [EnableRateLimiting("mutating")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _tasks.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
