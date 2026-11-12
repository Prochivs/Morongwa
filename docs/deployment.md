# Deployment and recovery

Production Compose overlays the base file with production build targets, restart policies, internal-only application ports, and migration deployment on API start. Supply configuration through a secret manager or a protected environment file; do not use development credentials.

1. Provision a TLS hostname and durable encrypted storage.
2. Set strong `POSTGRES_PASSWORD`, `SESSION_SECRET`, and object-storage credentials; enable secure cookies and configure SMTP.
3. Run `docker compose -f docker-compose.yml -f docker-compose.prod.yml config --quiet` and inspect the resolved configuration without printing secrets into logs.
4. Build, run database migrations, start services, and check `/health` and `/api/v1/health`.
5. Create the first administrator through a controlled bootstrap procedure; never use the development seed.

Back up PostgreSQL with an encrypted `pg_dump` and the object bucket with an S3-compatible versioned replication or backup policy. Retain database and bucket snapshots from the same recovery window. Regularly restore both into an isolated environment and verify a proof download plus a completed request. Deploy migrations before incompatible application changes, and retain the prior application image for rollback.
