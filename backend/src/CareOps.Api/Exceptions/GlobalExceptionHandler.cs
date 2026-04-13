using System.Diagnostics;
using CareOps.Application.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace CareOps.Api.Exceptions;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;

        if (exception is DbUpdateException dbx && dbx.InnerException is SqliteException sqlInner)
            exception = sqlInner;

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
            case SqliteException sql:
                _logger.LogWarning(sql, "SQLite error. TraceId: {TraceId}", traceId);
                var sqlDetail = _env.IsDevelopment()
                    ? sql.Message
                    : "The database is busy or unavailable. Please retry.";
                await WriteProblemAsync(
                    httpContext,
                    StatusCodes.Status503ServiceUnavailable,
                    "Database unavailable",
                    sqlDetail,
                    traceToken: traceId,
                    cancellationToken: cancellationToken);
                return true;
        }

        _logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", traceId);
        var detail = _env.IsDevelopment()
            ? $"{exception.GetType().Name}: {exception.Message}\n{exception.InnerException?.Message}".Trim()
            : "An unexpected error occurred.";

        await WriteProblemAsync(
            httpContext,
            StatusCodes.Status500InternalServerError,
            "Server Error",
            detail,
            traceId,
            cancellationToken);
        return true;
    }

    private static async Task WriteProblemAsync(
        HttpContext httpContext,
        int status,
        string title,
        string detail,
        string traceToken,
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
        problem.Extensions["traceId"] = traceToken;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
    }
}
