# Product brief — Care Operations Task Tracker

## Final product concept

**Care Operations Task Tracker** is a single internal dashboard where a small operations team creates and manages tasks (follow-ups, vendor actions, coordination items), assigns them to team **members**, and filters/sorts them by status, priority, assignee, and due date—with clear **overdue** visibility. The product language and sample data feel **healthcare-adjacent** (care ops, coordination) but stay **non-clinical**: no patients, diagnoses, or PHI.

## Problem statement

Small ops teams often rely on ad-hoc spreadsheets, chat threads, and personal reminders. That breaks down under load: ownership is unclear, due dates are missed, and priorities are inconsistent. This MVP provides a **single place** to capture work, assign ownership, and see what is overdue—without the weight of a full ITSM or clinical system.

## Exact scope (MVP)

### In scope

| Area | Capability |
|------|------------|
| Tasks | Create, read, update, delete; mark **complete** and **reopen** |
| Assignment | Assign a task to a **member** (optional assignee) |
| Discovery | Filter by **status**, **priority**, **assignee**; **search** by title; **sort** by created date, due date, priority |
| Signals | **Overdue** indication when due date is in the past and task is not terminal |
| Members | **Create** and **list** members (team roster for assignment) |
| Data | **Seed** sample members and tasks for demo |
| Quality | Validation, structured API errors, logging, health check, basic rate limiting |
| Delivery | Dockerized local setup; README + architecture + ADR + implementation plan |

### Out of scope

| Item | Reason |
|------|--------|
| Authentication / passwords / sessions | Assignment constraint; keeps MVP focused on domain and API quality |
| RBAC, invites, org hierarchy | Not needed for a single trusted internal team in this exercise |
| Patient records, PHI, clinical codes | Explicitly excluded; non-clinical ops only |
| Redis, message queues, microservices | Avoid over-engineering; SQLite + single API is sufficient |
| Kubernetes, AWS-specific infra | Local/production-minded patterns without cloud lock-in |
| Real-time collaboration, notifications | Post-MVP enhancement |

## Personas (lightweight)

- **Ops coordinator:** Creates tasks, assigns work, monitors overdue.
- **Ops contributor:** Works assigned items, marks complete, reopens when needed.

## User-facing feature checklist

Frontend foundation (mock data): the dashboard implements the interactions below in the browser; **persistence and API integration** are tracked separately in [implementation-plan.md](./implementation-plan.md).

- [x] Task list with loading / empty / error states *(mock-backed + dev error toggle)*
- [x] Create / edit task (modals)
- [x] Delete task with confirmation *(demo — no server delete yet)*
- [x] Complete / reopen actions *(demo toasts — no PATCH yet)*
- [x] Member list + create member modal *(new members do not list until API wired)*
- [x] Filters: status, priority, assignee
- [x] Search: title substring
- [x] Sort: created, due, priority (direction configurable)
- [x] Overdue styling when due in the past and status is not completed
- [x] Success toasts; destructive confirm for delete

**Still to do for “done-done”:** HTTP client, cache invalidation after mutations, and checkbox verification against the live API in Docker.

## Success criteria (MVP)

- End-to-end flows work in Docker locally.
- API contract is stable, documented (Swagger), and validated.
- UI is a coherent internal **dashboard** aesthetic (not consumer marketing).
- Documentation explains assumptions, tradeoffs, and what would ship next.

## Assumptions

- **Trust boundary:** Deployed where only trusted staff can reach it, or used as a private demo—**no authentication** in scope.
- **Data:** Task titles/descriptions are **operational** (e.g. vendor follow-ups), not clinical; no patient identifiers.
- **Team size:** Low concurrency; **SQLite** and a single API instance are acceptable for the MVP and review.
- **Browser:** Modern evergreen browsers; no IE support required.

## Tradeoffs (summary)

- **Simplicity vs. features:** Full ITSM, notifications, and SSO are deferred in favor of a tight task + member model.
- **SQLite vs. hosted SQL:** Faster local and CI setup; see [architecture.md](./architecture.md) for scaling path.
- **No auth vs. security:** Speeds delivery; production would add identity and network controls—see ADR and architecture security section.

## What would be added later

- **Identity:** SSO (e.g. Entra ID), API keys, or mutual TLS for anything internet-exposed.
- **Persistence:** Migrate to **PostgreSQL** (or similar) for HA and concurrent writes.
- **Notifications:** Email or Teams webhooks for overdue tasks.
- **Audit:** Change history and stronger compliance logging if required by policy.
- **Real-time:** Optional SignalR for live board updates—only if users need it.
