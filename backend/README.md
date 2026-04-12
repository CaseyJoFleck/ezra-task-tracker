# CareOps backend

ASP.NET Core 8 Web API: **Api** → **Application** → **Domain** ← **Infrastructure** (EF Core + SQLite).

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

## Run in Docker (from repo root)

```bash
docker compose build api
docker compose up api
```

Uses **`Data Source=/data/careops.db`** with a named volume. Swagger is enabled when `ASPNETCORE_ENVIRONMENT=Development` (default in Compose).

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
