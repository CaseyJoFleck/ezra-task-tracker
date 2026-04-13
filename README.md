# Care Operations Task Tracker

Production-minded **internal** MVP for a small **care operations** team: tasks and members, filters, search, overdue visibility—**healthcare-adjacent, not clinical**. No patient data, no PHI, no clinical workflows.

**Backend:** ASP.NET Core **10** Web API, EF Core + SQLite, layered architecture, FluentValidation, health checks, rate limiting, Swagger, and automated tests. **Frontend:** still a static Docker placeholder; a React + TypeScript + Vite app is planned.

## Repository layout

```
ezra-task-tracker/
├── README.md
├── docker-compose.yml
├── .env.example
├── .dockerignore
├── .gitignore
├── backend/
│   ├── CareOps.sln
│   ├── Directory.Build.props      # shared TargetFramework: net10.0
│   ├── Dockerfile                 # SDK/runtime 10.0
│   ├── src/
│   │   ├── CareOps.Api/           # Web API, Program.cs, controllers
│   │   ├── CareOps.Application/   # services, validators, DTOs
│   │   ├── CareOps.Domain/        # entities, enums
│   │   └── CareOps.Infrastructure/ # EF Core, SQLite, seed
│   └── tests/                     # CareOps.Api.Tests (integration), CareOps.Application.Tests (unit)
├── frontend/
│   ├── Dockerfile               # placeholder static page until Vite app exists
│   └── ...
└── docs/
    └── ...
```

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/product-brief.md](docs/product-brief.md) | Concept, scope, assumptions, tradeoffs, future work |
| [docs/architecture.md](docs/architecture.md) | Diagrams, entities, API routes, CORS, rate limits, security, scaling, **local Docker steps** |
| [docs/adr-001-key-decisions.md](docs/adr-001-key-decisions.md) | Stack and layering decisions |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Phased delivery notes |

## Prerequisites

- **[.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)** (solution targets `net10.0` via `backend/Directory.Build.props`).
- For Docker: [Docker](https://docs.docker.com/get-docker/) with Compose v2.

## Local setup

### Backend (recommended for API work)

1. From `backend/`:

   ```bash
   dotnet restore CareOps.sln
   dotnet run --project src/CareOps.Api/CareOps.Api.csproj
   ```

2. Open **http://localhost:5000/swagger** and **GET http://localhost:5000/health**.

### Backend tests

From **`backend/`**:

```bash
dotnet test CareOps.sln
```

See [backend/tests/README.md](backend/tests/README.md) for project breakdown and useful options.

### Docker (API + placeholder web UI)

1. Optional: `cp .env.example .env` and adjust ports.
2. From the repo root:

   ```bash
   docker compose build
   docker compose up
   ```

3. **API:** **http://localhost:5000/swagger** when `ASPNETCORE_ENVIRONMENT=Development` (default in Compose).
4. **Web:** **http://localhost:3000** — static placeholder until the React app is added.

SQLite in Docker uses the `sqlite_data` volume at `/data/careops.db` inside the API container.

## Out of scope (by design)

Authentication, RBAC, Redis, queues, microservices, Kubernetes/AWS infra, patient records, PHI, clinical decision support.

## License / use

Private take-home submission unless otherwise stated.
