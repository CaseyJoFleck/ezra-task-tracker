using CareOps.Application.Members;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CareOps.Api.Controllers;

[ApiController]
[Route("api/members")]
[Produces("application/json")]
public sealed class MembersController : ControllerBase
{
    private readonly IMemberService _members;
    private readonly IValidator<CreateMemberRequest> _createValidator;

    public MembersController(
        IMemberService members,
        IValidator<CreateMemberRequest> createValidator)
    {
        _members = members;
        _createValidator = createValidator;
    }

    /// <summary>List all members.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MemberResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MemberResponse>>> GetList(
        CancellationToken cancellationToken)
    {
        var members = await _members.ListAsync(cancellationToken);
        return Ok(members);
    }

    /// <summary>Create a member.</summary>
    [HttpPost]
    [EnableRateLimiting("mutating")]
    [ProducesResponseType(typeof(MemberResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MemberResponse>> Create(
        [FromBody] CreateMemberRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }

            return ValidationProblem(ModelState);
        }

        var created = await _members.CreateAsync(request, cancellationToken);
        return Created($"/api/members/{created.Id}", created);
    }

    /// <summary>Delete a member. Tasks assigned to this member become unassigned.</summary>
    [HttpDelete("{id:guid}")]
    [EnableRateLimiting("mutating")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _members.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
