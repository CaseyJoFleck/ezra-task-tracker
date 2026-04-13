# CareOps backend

ASP.NET Core **10** Web API: **Api** → **Application** → **Domain** ← **Infrastructure** (EF Core + SQLite). All projects target **`net10.0`** (see `Directory.Build.props`).

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)

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

The image uses **.NET 10** (`sdk:10.0` / `aspnet:10.0-alpine`). SQLite uses **`Data Source=/data/careops.db`** with a named volume. Swagger is enabled when `ASPNETCORE_ENVIRONMENT=Development` (default in Compose).

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

Development uses **`EnsureCreated`** plus seed data when the database is empty. For production-grade migrations, add EF migrations in a follow-up and replace `EnsureCreated` with `Migrate()`.
