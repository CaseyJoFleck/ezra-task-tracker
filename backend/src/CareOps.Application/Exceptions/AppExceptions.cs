namespace CareOps.Application.Exceptions;

public sealed class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

public sealed class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message) { }
}
