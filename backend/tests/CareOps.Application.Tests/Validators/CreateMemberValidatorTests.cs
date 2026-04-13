using CareOps.Application.Members;
using FluentAssertions;

namespace CareOps.Application.Tests.Validators;

public class CreateMemberValidatorTests
{
    private readonly CreateMemberValidator _validator = new();

    [Fact]
    public async Task Valid_request_passes()
    {
        var r = await _validator.ValidateAsync(new CreateMemberRequest
        {
            DisplayName = "A",
            Email = "a@b.co",
        });
        r.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Empty_display_name_fails()
    {
        var r = await _validator.ValidateAsync(new CreateMemberRequest { DisplayName = "" });
        r.IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task Invalid_email_when_provided_fails()
    {
        var r = await _validator.ValidateAsync(new CreateMemberRequest
        {
            DisplayName = "A",
            Email = "not-an-email",
        });
        r.IsValid.Should().BeFalse();
    }
}
