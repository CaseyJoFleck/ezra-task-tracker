using CareOps.Application.Members;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CareOps.Api.Controllers;

[ApiController]
[Route("api/members")]
[Produces("application/json")]
public sealed class MembersController : ControllerBase
{
    private readonly IMemberService _members;

    public MembersController(IMemberService members) => _members = members;

    /// <summary>List all members.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MemberResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MemberResponse>>> GetList(CancellationToken cancellationToken)
    {
        var list = await _members.ListAsync(cancellationToken);
        return Ok(list);
    }

    /// <summary>Create a member.</summary>
    [HttpPost]
    [EnableRateLimiting("mutating")]
    [ProducesResponseType(typeof(MemberResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MemberResponse>> Create([FromBody] CreateMemberRequest request, CancellationToken cancellationToken)
    {
        var created = await _members.CreateAsync(request, cancellationToken);
        return Created($"/api/members/{created.Id}", created);
    }
}
