# CareOps backend

ASP.NET Core **8 (LTS)** Web API: **Api** → **Application** → **Domain** ← **Infrastructure** (EF Core + SQLite). All projects target **`net8.0`** (see `Directory.Build.props`).

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## Run locally

```bash
cd backend
dotnet restore CareOps.sln
dotnet run --project src/CareOps.Api/CareOps.Api.csproj
```

- API: **http://localhost:5000**
- Swagger: **http://localhost:5000/swagger** (Development)
- Health: **GET http://localhost:5000/health**

SQLite file defaults to **`careops.db`** in the API project directory (`src/CareOps.Api/`). Override with `ConnectionStrings__Default` in environment or `appsettings.json`.

## Run tests

```bash
cd backend
dotnet test CareOps.sln
```

See [tests/README.md](tests/README.md) for integration vs unit layout and filtering examples.

## Run in Docker (from repo root)

```bash
docker compose build api
docker compose up api
```

The image uses **.NET 8** (`sdk:8.0` / `aspnet:8.0-alpine`). SQLite uses **`Data Source=/data/careops.db`** with a named volume. Swagger is enabled when `ASPNETCORE_ENVIRONMENT=Development` (default in Compose).

## API surface (summary)

| Method | Route |
|--------|--------|
| GET | `/api/members` |
| POST | `/api/members` |
| GET | `/api/tasks` (optional query: `status`, `priority`, `assigneeMemberId`, `search`, `sortBy`, `sortDir`, `overdueOnly`) |
| GET | `/api/tasks/{id}` |
| POST | `/api/tasks` |
| PUT | `/api/tasks/{id}` |
| PATCH | `/api/tasks/{id}/status` |
| DELETE | `/api/tasks/{id}` |
| GET | `/health` |

Enums in JSON are **camelCase strings** (e.g. `todo`, `completed`, `high`).

## Database

I used **`EnsureCreated`** plus seed data to keep local setup friction low for this take-home and optimize reviewer experience. If this project continued beyond the submission, I would switch to a standard EF Core migrations workflow so schema evolution is explicit and versioned.
