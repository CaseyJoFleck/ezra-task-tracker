using System.Net;
using System.Net.Http.Json;
using CareOps.Api.Tests.Support;
using CareOps.Application.Members;
using FluentAssertions;

namespace CareOps.Api.Tests.Integration;

public class MembersApiIntegrationTests : IClassFixture<CareOpsApiFactory>
{
    private readonly CareOpsApiFactory _factory;

    public MembersApiIntegrationTests(CareOpsApiFactory factory) => _factory = factory;

    [Fact]
    public async Task List_members_after_seed_returns_three_members()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var res = await client.GetAsync("/api/members");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<List<MemberResponse>>(ApiTestJson.Options);
        list.Should().NotBeNull().And.HaveCount(3);
        list!.Select(m => m.DisplayName).Should().Contain(new[] { "Alex Rivera", "Jordan Lee", "Sam Patel" });
    }

    [Fact]
    public async Task Create_member_returns_created_and_list_includes_member()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var body = new CreateMemberRequest { DisplayName = "Test Ops", Email = "ops@careops.local", Title = "Tester" };
        var create = await client.PostAsJsonAsync("/api/members", body, ApiTestJson.Options);
        create.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await create.Content.ReadFromJsonAsync<MemberResponse>(ApiTestJson.Options);
        created.Should().NotBeNull();
        created!.DisplayName.Should().Be("Test Ops");

        var listRes = await client.GetAsync("/api/members");
        var list = await listRes.Content.ReadFromJsonAsync<List<MemberResponse>>(ApiTestJson.Options);
        list.Should().NotBeNull();
        list!.Should().Contain(m => m.Id == created.Id && m.DisplayName == "Test Ops");
    }

    [Fact]
    public async Task Create_member_empty_display_name_returns_400_validation()
    {
        await _factory.ResetDatabaseAsync();
        var client = _factory.CreateClient();

        var body = new CreateMemberRequest { DisplayName = "" };
        var res = await client.PostAsJsonAsync("/api/members", body, ApiTestJson.Options);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
