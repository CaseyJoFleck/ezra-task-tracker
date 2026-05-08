using System.Net;
using System.Net.Http.Json;
using CareOps.Api.Tests.Support;
using CareOps.Application.Members;
using CareOps.Application.Tasks;
using CareOps.Domain;
using FluentAssertions;

namespace CareOps.Api.Tests.Integration;

public class TasksApiIntegrationTests : IClassFixture<CareOpsApiFactory>
{
    private readonly CareOpsApiFactory _factory;

    public TasksApiIntegrationTests(CareOpsApiFactory factory) => _factory = factory;

    [Fact]
    public async Task List_tasks_after_seed_returns_five_tasks()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var res = await client.GetAsync("/api/tasks");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<List<TaskItemResponse>>(ApiTestJson.Options);
        list.Should().NotBeNull().And.HaveCount(5);
    }

    [Fact]
    public async Task Get_task_by_id_returns_task()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var listRes = await client.GetAsync("/api/tasks");
        var tasks = await listRes.Content.ReadFromJsonAsync<List<TaskItemResponse>>(ApiTestJson.Options);
        var id = tasks!.First().Id;

        var res = await client.GetAsync($"/api/tasks/{id}");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var task = await res.Content.ReadFromJsonAsync<TaskItemResponse>(ApiTestJson.Options);
        task.Should().NotBeNull();
        task!.Id.Should().Be(id);
    }

    [Fact]
    public async Task Get_task_by_id_unknown_returns_404()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var res = await client.GetAsync($"/api/tasks/{Guid.NewGuid()}");
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_task_with_valid_assignee_returns_created()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var members = await client.GetFromJsonAsync<List<MemberResponse>>("/api/members", ApiTestJson.Options);
        var assigneeId = members!.First().Id;

        var body = new CreateTaskRequest
        {
            Title = "Integration task",
            Status = TaskItemStatus.Todo,
            Priority = TaskPriority.Medium,
            AssigneeMemberId = assigneeId,
        };
        var res = await client.PostAsJsonAsync("/api/tasks", body, ApiTestJson.Options);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var task = await res.Content.ReadFromJsonAsync<TaskItemResponse>(ApiTestJson.Options);
        task!.Title.Should().Be("Integration task");
        task.AssigneeMemberId.Should().Be(assigneeId);
    }

    [Fact]
    public async Task Create_task_unknown_assignee_returns_400()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var body = new CreateTaskRequest
        {
            Title = "Bad assignee",
            AssigneeMemberId = Guid.NewGuid(),
        };
        var res = await client.PostAsJsonAsync("/api/tasks", body, ApiTestJson.Options);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task List_tasks_filter_by_status_todo()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var res = await client.GetAsync("/api/tasks?status=todo");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<List<TaskItemResponse>>(ApiTestJson.Options);
        list.Should().NotBeNull();
        list!.Should().OnlyContain(t => t.Status == TaskItemStatus.Todo);
    }

    [Fact]
    public async Task List_tasks_filter_by_status_canceled()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var res = await client.GetAsync("/api/tasks?status=canceled");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<List<TaskItemResponse>>(ApiTestJson.Options);
        list.Should().NotBeNull();
        list!.Should().OnlyContain(t => t.Status == TaskItemStatus.Canceled);
    }

    [Fact]
    public async Task List_tasks_search_finds_vendor_in_title()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var res = await client.GetAsync("/api/tasks?search=vendor");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<List<TaskItemResponse>>(ApiTestJson.Options);
        list.Should().NotBeNull();
        list!.Should().Contain(t => t.Title.Contains("vendor", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task List_tasks_sort_by_created_desc_puts_terminal_statuses_last_then_newest_first()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var res = await client.GetAsync("/api/tasks?sortBy=created&sortDir=desc");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<List<TaskItemResponse>>(ApiTestJson.Options);
        list.Should().NotBeNull();
        var rows = list!;

        var firstTerminal = rows.FindIndex(t => TaskItemRules.IsTerminalStatus(t.Status));
        if (firstTerminal >= 0)
        {
            rows.Take(firstTerminal).Should().OnlyContain(t => !TaskItemRules.IsTerminalStatus(t.Status));
            rows.Skip(firstTerminal).Should().OnlyContain(t => TaskItemRules.IsTerminalStatus(t.Status));
        }

        var active = rows.TakeWhile(t => !TaskItemRules.IsTerminalStatus(t.Status)).ToList();
        var terminal = rows.SkipWhile(t => !TaskItemRules.IsTerminalStatus(t.Status)).ToList();
        active.Should().BeInDescendingOrder(t => t.CreatedAtUtc);
        terminal.Should().BeInDescendingOrder(t => t.CreatedAtUtc);
    }

    [Fact]
    public async Task List_tasks_overdue_only_returns_non_completed_past_due()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var res = await client.GetAsync("/api/tasks?overdueOnly=true");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<List<TaskItemResponse>>(ApiTestJson.Options);
        list.Should().NotBeNull();
        list!.Should().OnlyContain(t => t.IsOverdue);
    }

    [Fact]
    public async Task Update_task_persists_changes()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var tasks = await client.GetFromJsonAsync<List<TaskItemResponse>>("/api/tasks", ApiTestJson.Options);
        var id = tasks!.First(t => t.Status == TaskItemStatus.Todo).Id;

        var put = new UpdateTaskRequest
        {
            Title = "Updated title",
            Description = "Updated desc",
            Status = TaskItemStatus.InProgress,
            Priority = TaskPriority.High,
            AssigneeMemberId = null,
            DueDateUtc = DateTimeOffset.UtcNow.AddDays(1),
        };
        var res = await client.PutAsJsonAsync($"/api/tasks/{id}", put, ApiTestJson.Options);
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await res.Content.ReadFromJsonAsync<TaskItemResponse>(ApiTestJson.Options);
        updated!.Title.Should().Be("Updated title");
        updated.Status.Should().Be(TaskItemStatus.InProgress);

        var get = await client.GetAsync($"/api/tasks/{id}");
        var again = await get.Content.ReadFromJsonAsync<TaskItemResponse>(ApiTestJson.Options);
        again!.Title.Should().Be("Updated title");
    }

    [Fact]
    public async Task Patch_status_to_completed_sets_completed_at()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var tasks = await client.GetFromJsonAsync<List<TaskItemResponse>>("/api/tasks", ApiTestJson.Options);
        var id = tasks!.First(t => t.Status == TaskItemStatus.Todo).Id;

        var patch = new UpdateTaskStatusRequest { Status = TaskItemStatus.Completed };
        var res = await client.PatchAsJsonAsync($"/api/tasks/{id}/status", patch, ApiTestJson.Options);
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var task = await res.Content.ReadFromJsonAsync<TaskItemResponse>(ApiTestJson.Options);
        task!.Status.Should().Be(TaskItemStatus.Completed);
        task.CompletedAtUtc.Should().NotBeNull();
    }

    [Fact]
    public async Task Delete_task_then_get_returns_404()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var tasks = await client.GetFromJsonAsync<List<TaskItemResponse>>("/api/tasks", ApiTestJson.Options);
        var id = tasks!.First().Id;

        var del = await client.DeleteAsync($"/api/tasks/{id}");
        del.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var get = await client.GetAsync($"/api/tasks/{id}");
        get.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Put_patch_delete_unknown_task_return_404()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();
        var id = Guid.NewGuid();

        var put = new UpdateTaskRequest
        {
            Title = "x",
            Status = TaskItemStatus.Todo,
            Priority = TaskPriority.Low,
        };
        (await client.PutAsJsonAsync($"/api/tasks/{id}", put, ApiTestJson.Options)).StatusCode.Should().Be(HttpStatusCode.NotFound);

        (await client.PatchAsJsonAsync($"/api/tasks/{id}/status", new UpdateTaskStatusRequest { Status = TaskItemStatus.Completed }, ApiTestJson.Options))
            .StatusCode.Should().Be(HttpStatusCode.NotFound);

        (await client.DeleteAsync($"/api/tasks/{id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_task_empty_title_returns_400()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var body = new CreateTaskRequest { Title = "" };
        var res = await client.PostAsJsonAsync("/api/tasks", body, ApiTestJson.Options);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
