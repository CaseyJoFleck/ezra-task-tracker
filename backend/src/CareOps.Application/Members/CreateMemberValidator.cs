using FluentValidation;

namespace CareOps.Application.Members;

public sealed class CreateMemberValidator : AbstractValidator<CreateMemberRequest>
{
    public CreateMemberValidator()
    {
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email)
            .MaximumLength(320)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.Title).MaximumLength(120);
    }
}
