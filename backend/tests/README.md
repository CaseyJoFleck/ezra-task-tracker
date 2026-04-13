# Backend tests

Requires the **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** (same as the rest of the solution).

## Projects

| Project | What it covers |
|---------|----------------|
| **CareOps.Application.Tests** | Unit tests: FluentValidation rules (`CreateTaskValidator`, `CreateMemberValidator`, etc.) and `TaskItemRules`. |
| **CareOps.Api.Tests** | Integration tests: HTTP calls via `WebApplicationFactory<Program>`, temporary SQLite database, `ASPNETCORE_ENVIRONMENT=Testing` (relaxed rate limits). Exercises members/tasks endpoints, validation responses, filters, and CRUD flows. |

## Run everything

From `backend/`:

```bash
dotnet test CareOps.sln
```

## Useful options

Run a single test project:

```bash
dotnet test tests/CareOps.Api.Tests/CareOps.Api.Tests.csproj
dotnet test tests/CareOps.Application.Tests/CareOps.Application.Tests.csproj
```

Filter by test name (class or method):

```bash
dotnet test CareOps.sln --filter "FullyQualifiedName~TasksApiIntegrationTests"
```

More verbose output:

```bash
dotnet test CareOps.sln --logger "console;verbosity=normal"
```

Restore and build are implied; use `dotnet test CareOps.sln --no-restore` only if you already restored.
