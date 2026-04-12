using System.Diagnostics;
using CareOps.Application.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace CareOps.Api.Exceptions;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;

        switch (exception)
        {
            case NotFoundException nf:
                await WriteProblemAsync(httpContext, StatusCodes.Status404NotFound, "Not Found", nf.Message, traceId, cancellationToken);
                return true;
            case BadRequestException br:
                await WriteProblemAsync(httpContext, StatusCodes.Status400BadRequest, "Bad Request", br.Message, traceId, cancellationToken);
                return true;
            case FluentValidation.ValidationException ve:
                var errors = ve.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
                var validation = new HttpValidationProblemDetails(errors)
                {
                    Title = "Validation failed",
                    Status = StatusCodes.Status400BadRequest,
                    Instance = httpContext.Request.Path,
                };
                validation.Extensions["traceId"] = traceId;
                httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                await httpContext.Response.WriteAsJsonAsync(validation, cancellationToken);
                return true;
        }

        _logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", traceId);
        await WriteProblemAsync(
            httpContext,
            StatusCodes.Status500InternalServerError,
            "Server Error",
            "An unexpected error occurred.",
            traceId,
            cancellationToken);
        return true;
    }

    private static async Task WriteProblemAsync(
        HttpContext httpContext,
        int status,
        string title,
        string detail,
        string traceId,
        CancellationToken cancellationToken)
    {
        httpContext.Response.StatusCode = status;
        var problem = new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = status,
            Instance = httpContext.Request.Path,
        };
        problem.Extensions["traceId"] = traceId;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
    }
}
