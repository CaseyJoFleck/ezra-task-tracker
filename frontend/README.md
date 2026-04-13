# Care Operations Task Tracker — frontend

React 19 + TypeScript + **Vite**, **Tailwind CSS**, **TanStack Query**, **React Hook Form** + **Zod**, **Sonner** toasts.

The dashboard is a **single-page** app wired to the **CareOps API** (`/api/members`, `/api/tasks`). Data is loaded with TanStack Query; mutations invalidate task/member queries so lists and stats stay in sync.

## API base URL

- **Local dev (`npm run dev`):** Requests use **relative** URLs (`/api/...`). Vite proxies `/api` and `/health` to `http://localhost:5000` — run the backend locally or point the proxy elsewhere in `vite.config.ts`.
- **Production build without proxy:** Set **`VITE_API_BASE_URL`** at build time (e.g. `http://localhost:5000` or your API origin). See repo root **`.env.example`**.

Do **not** commit `.env` files with secrets; use **`.env.example`** as a template.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (Docker build uses Node 22)
- Backend API running for live data (e.g. `dotnet run` in `backend/` on port **5000** when using the default Vite proxy)

## Install and run (development)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

## Build

```bash
npm run build
```

## Preview production build locally

```bash
npm run preview
```

## Docker

From the **repository root**:

```bash
docker compose build web
docker compose up
```

Configure **`VITE_API_BASE_URL`** for the web image if the API is on another origin (see above).

## Key folders

| Path | Purpose |
|------|---------|
| `src/api/` | `fetch` helpers, `tasksApi`, `membersApi`, validation error mapping |
| `src/pages/DashboardPage.tsx` | Queries, filters, mutations (delete, patch status) |
| `src/components/modals/` | Create/edit task, create member (mutations + invalidation) |
