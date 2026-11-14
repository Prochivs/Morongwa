# QueueMate

QueueMate is a production-minded queue-assistance operations platform for Botswana. It provides public information, customer booking and payment-proof workflows, manual operations review, agent scheduling and field updates, private evidence storage, audit history, notifications, and reporting.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod, Lucide, and Recharts
- Express REST API, TypeScript, Zod, Prisma, and MongoDB
- Private S3-compatible object storage (Silo/MinIO API), Nginx, and Docker Compose
- Vitest/Supertest unit and API tests plus a Playwright API end-to-end workflow

## Quick start

Requirements: Node.js 20.9+ (Node.js 22 LTS recommended), npm, a MongoDB Atlas database, and Docker with Compose for object storage.

```bash
cp .env.example .env
npm install
docker compose up -d minio minio-init
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Set `DATABASE_URL` in `.env` to the MongoDB Atlas connection string for the `queuemate` database, and use `http://localhost:9000` for object storage. In Atlas, allow this machine's IP address and create a database user before starting the API. Visit `http://localhost:3000`; the API health endpoint is `http://localhost:4000/api/v1/health`.

To run the whole stack behind Nginx:

```bash
docker compose up --build
```

Then visit `http://localhost:8080`.

## Development users

These accounts are created only by the non-production seed. All use `QueueMateDev!2026`:

| Role | Email |
| --- | --- |
| Administrator | `admin@queuemate.local` |
| Agent | `agent001@queuemate.local` |
| Agent | `agent002@queuemate.local` |
| Customer | `customer@queuemate.local` |

Change all secrets and never run the development seed in production. The seed actively refuses to run when `NODE_ENV=production`.

## Verification

```bash
npm run verify
# With API, MongoDB, and object storage running and seeded:
npm run test:e2e
docker compose config --quiet
docker compose -f docker-compose.yml -f docker-compose.prod.yml config --quiet
```

The end-to-end test creates a real request, uploads a valid private PDF proof, manually verifies payment as an administrator, approves and assigns the job, advances it through every agent state, and confirms completion as the customer.

## Production

Copy `.env.example` into a secret manager-backed deployment configuration, generate strong unique database/storage/session credentials, set `COOKIE_SECURE=true`, configure TLS at the reverse proxy, configure SMTP, use durable encrypted volumes, and run:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

See [architecture](docs/architecture.md), [API guide](docs/api.md), [security](docs/security.md), [deployment](docs/deployment.md), and the [operations guide](docs/operations.md).
