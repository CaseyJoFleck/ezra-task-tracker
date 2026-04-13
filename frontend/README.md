# Frontend (skeleton)

**Planned:** React + TypeScript + Vite, Tailwind CSS, TanStack Query, React Hook Form + Zod (see repo root `README.md` and `docs/`).

The [Dockerfile](./Dockerfile) serves a **static placeholder page** so `docker compose` can run a full stack before the real app exists.

## Testing

There is no frontend test suite yet. After the Vite app is added, typical commands will be along the lines of:

```bash
npm install
npm run build
npm run test        # when tests are configured
```

Until then, verify the placeholder by opening **http://localhost:3000** when the `web` service is up via Docker Compose.
