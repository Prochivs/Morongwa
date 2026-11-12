# Architecture

QueueMate is a TypeScript monorepo with three runtime boundaries: a Next.js web application, an Express REST API, and PostgreSQL plus private S3-compatible storage. Nginx exposes the web app and `/api/` on one origin, which keeps cookie sessions simple and prevents browsers from contacting infrastructure directly.

```mermaid
flowchart LR
  Browser --> Nginx
  Nginx --> Web[Next.js web]
  Nginx --> API[Express API]
  API --> DB[(PostgreSQL)]
  API --> Store[(Private S3 storage)]
  API --> Mail[SMTP provider]
```

`apps/web` contains public and role-specific routes. `apps/api` owns authentication, authorization, business rules, persistence, and file access. `packages/shared` contains cross-boundary contracts and status-transition rules. `prisma` contains the schema, migration history, and development seed.

The core request state is deliberately separate from payment and assignment state. A payment must be manually verified before request approval; an approved request must pass availability and collision checks before assignment; only the assigned agent can update its field status.

```mermaid
flowchart LR
  PendingPayment[PENDING_PAYMENT] --> Review[PAYMENT_REVIEW]
  Review --> PendingApproval[PENDING_APPROVAL]
  PendingApproval --> Approved[APPROVED]
  Approved --> Assigned[AGENT_ASSIGNED]
  Assigned --> EnRoute[EN_ROUTE]
  EnRoute --> Arrived[ARRIVED]
  Arrived --> InProgress[IN_PROGRESS]
  InProgress --> Completed[COMPLETED]
  InProgress --> Failed[FAILED]
```
