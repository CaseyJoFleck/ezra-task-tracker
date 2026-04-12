# Care Operations Task Tracker

Production-minded **internal** MVP for a small **care operations** team: tasks and members, filters, search, overdue visibility—**healthcare-adjacent, not clinical**. No patient data, no PHI, no clinical workflows.

Stack (planned): **ASP.NET Core** Web API, **EF Core + SQLite**, **React + TypeScript + Vite**, **Docker Compose** for local runs, plus validation, structured errors, logging, health checks, rate limiting, and tests.

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
│   ├── Dockerfile
│   ├── src/
│   │   ├── CareOps.Api/           # Web API, Program.cs, controllers
│   │   ├── CareOps.Application/   # services, validators, DTOs
│   │   ├── CareOps.Domain/        # entities, enums
│   │   └── CareOps.Infrastructure/ # EF Core, SQLite, seed
│   └── tests/                     # reserved for test projects (not added yet)
├── frontend/
│   ├── Dockerfile               # placeholder static page until Vite app exists
│   └── ...
└── docs/
    └── ...
```

**Backend:** implemented. **Frontend:** still a static Docker placeholder only.

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/product-brief.md](docs/product-brief.md) | Concept, scope, assumptions, tradeoffs, future work |
| [docs/architecture.md](docs/architecture.md) | Diagrams, entities, API routes, CORS, rate limits, security, scaling, **local Docker steps** |
| [docs/adr-001-key-decisions.md](docs/adr-001-key-decisions.md) | Stack and layering decisions |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Phased delivery (next: backend solution + real API image) |

## Local setup

### Backend only (recommended for API work)

1. Install [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0).
2. From `backend/`:

   ```bash
   dotnet restore CareOps.sln
   dotnet run --project src/CareOps.Api/CareOps.Api.csproj
   ```

3. Open **http://localhost:5000/swagger** and **GET http://localhost:5000/health**.

### Docker (API + placeholder web UI)

1. Install [Docker](https://docs.docker.com/get-docker/) (Compose v2 included).
2. Optional: `cp .env.example .env` and adjust ports.
3. From the repo root:

   ```bash
   docker compose build
   docker compose up
   ```

4. **API:** **http://localhost:5000/swagger** (with `ASPNETCORE_ENVIRONMENT=Development`).
5. **Web:** **http://localhost:3000** — static placeholder until the React app is added.

SQLite in Docker uses the `sqlite_data` volume at `/data/careops.db` inside the API container.

## Out of scope (by design)

Authentication, RBAC, Redis, queues, microservices, Kubernetes/AWS infra, patient records, PHI, clinical decision support.

## License / use

Private take-home submission unless otherwise stated.
