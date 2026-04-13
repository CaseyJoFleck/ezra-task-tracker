# Care Operations Task Tracker — frontend

React 19 + TypeScript + **Vite**, **Tailwind CSS**, **TanStack Query**, **React Hook Form** + **Zod**, **Sonner** toasts, **lucide-react** icons.

The dashboard is a **single-page** internal-ops layout: header (title + subtitle + **New Task**), stats row, search and filters + sort, **Team → New member**, two columns (task list + detail panel), and modals for create/edit task, create member, and delete confirmation.

## Mock data vs backend

- Lists load from **`src/data/mockData.ts`** via **`src/api/mockQueries.ts`** (simulated delay).
- Saving a task or member runs validation and shows a toast but **does not call the API** yet—so **new members will not appear in assignee dropdowns** until `GET /api/members` (or equivalent) drives the UI and `POST` invalidates/refetches that query.
- Replacing mocks is the main remaining step: implement `fetch` (or axios) against `/api`, reuse `src/types/`, and use `queryClient.invalidateQueries` after mutations.

Do **not** commit `.env` files with secrets; use repo root **`.env.example`** as a non-sensitive template for Compose ports.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (LTS recommended; the Docker build uses Node 22)

## Install and run (development)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The dev server proxies `/api` and `/health` to **http://localhost:5000** when the backend is running (`vite.config.ts`).

## Key folders

| Path | Purpose |
|------|---------|
| `src/pages/DashboardPage.tsx` | Main screen: queries, filters, selection, modal state |
| `src/components/layout/` | Header, stats, controls |
| `src/components/tasks/` | List, detail panel, badges |
| `src/components/modals/` | Create/edit task, create member, delete confirm |
| `src/types/` | Task and member TypeScript shapes (align with API JSON) |
| `src/schemas/` | Zod schemas shared with forms |

## Build

```bash
npm run build
```

Output is written to `dist/` (`tsc --noEmit` then `vite build`).

## Preview production build locally

```bash
npm run preview
```

## Docker

From the **repository root** (with the rest of the stack):

```bash
docker compose build web
docker compose up web
```

The image runs `npm ci`, `npm run build`, and serves `dist/` with nginx on port 80 (mapped to **3000** by default in Compose).

## Error state preview (development only)

A control in the bottom-right toggles **simulated task load failure** so you can review the task list error UI without changing code.
