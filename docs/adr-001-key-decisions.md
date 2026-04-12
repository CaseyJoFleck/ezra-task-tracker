# ADR-001 — Key architecture and stack decisions

**Status:** Accepted  
**Context:** Care Operations Task Tracker — internal ops MVP, take-home scope.

## Decision summary

| Topic | Decision |
|-------|----------|
| Frontend framework | React + TypeScript + **Vite** (SPA); Vue was acceptable per brief—we chose React for ecosystem fit with TanStack Query + RHF |
| Backend | ASP.NET Core Web API with **Controllers** |
| Data | **EF Core** + **SQLite** file database |
| Architecture style | **Layered:** Api / Application / Domain / Infrastructure |
| Auth | **None** in MVP (documented assumption) |
| Real-time | None (HTTP only) |
| Infra | **Docker Compose** for local; no cloud coupling |

---

## 1. Why React + Vite instead of Next.js?

**Decision:** Use a **single-page application** built with Vite.

**Rationale:**

- The UI is a **logged-in-style internal dashboard** without SEO or public marketing pages—server-side rendering adds little value.
- **Vite** gives fast local dev, simple env handling, and a clean `dist/` for static hosting behind nginx or a CDN.
- **Next.js** would introduce routing/data-fetch conventions and deployment modes not required for this MVP, increasing surface area against the “do not over-architect” constraint.

**Tradeoff:** No file-based API routes or SSR—acceptable for an internal SPA.

---

## 2. Why SQLite?

**Decision:** Use **SQLite** as the primary database via EF Core.

**Rationale:**

- **Zero external services** for local dev and CI: one file, easy Docker volume.
- **ACID** transactions and EF migrations align with “production-minded” without running PostgreSQL for a small demo.
- Adequate concurrency for a **single small team** and one API instance.

**Tradeoff:** Not ideal for high write concurrency or multi-region scale—[architecture.md](./architecture.md) outlines migration to PostgreSQL when needed.

---

## 3. Why no authentication for this scoped MVP?

**Decision:** **No login, JWT, or RBAC** in this submission.

**Rationale:**

- Assignment explicitly constrains scope; auth would dominate implementation and testing time relative to task/member domain quality.
- The product is framed as an **internal** tool—reviewers evaluate API design, validation, and ops hygiene **assuming** network trust or private deployment.
- RBAC and invite flows are listed **out of scope** in the brief.

**Mitigations in docs/code:**

- Clear **security considerations** (CORS, rate limiting, no PHI).
- Document **future** addition of organizational SSO or API keys for anything internet-exposed.

**Tradeoff:** Not suitable for public internet without additional controls—called out explicitly for reviewers.

---

## 4. Clean architecture — how much layering?

**Decision:** Four layers (**Api / Application / Domain / Infrastructure**) with **thin** Application abstractions—no event sourcing, no generic pipeline frameworks.

**Rationale:**

- Satisfies “clean architecture” expectations and test seams (Application validators, domain entities).
- Avoids **unnecessary abstractions** (no repository interface per entity unless testing demands it).

---

## 5. API style: Controllers + REST

**Decision:** **Controllers** (not Minimal APIs only) for clarity in a take-home review.

**Rationale:** Route/action structure maps cleanly to OpenAPI/Swagger and matches stated expectations.

---

## 6. Rate limiting without Redis

**Decision:** **ASP.NET Core built-in** rate limiting (partition by IP), stricter on mutating endpoints.

**Rationale:** Meets “basic rate limiting” without new infrastructure.

---

## 7. Testing strategy

**Decision:** **Integration tests** against API + real SQLite (or in-memory provider where equivalent behavior is proven) plus **focused unit tests** on validators/domain rules.

**Rationale:** Highest confidence for HTTP contract and persistence; units keep edge cases cheap.

---

## Consequences

- Documentation and implementation must stay aligned on **out-of-scope** items (no auth, no PHI).
- Future ADRs (e.g. ADR-002 PostgreSQL) would supersede data store details when scaling.
