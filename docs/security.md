# Security model

- Opaque random session tokens are stored only as SHA-256 hashes in PostgreSQL and sent in HTTP-only, SameSite cookies. Production cookies are secure.
- Each session has an independent CSRF secret; all authenticated mutations validate the cookie/header pair and stored hash.
- Passwords use bcrypt with cost 12. Password reset tokens are random, hashed at rest, expire after one hour, and invalidate sessions when used.
- Route-level RBAC separates customer, administrator, and agent access. Resource queries also enforce ownership or assignment.
- Helmet, strict CORS, request limits, rate limiting, Zod validation, parameterized Prisma queries, and redacted structured logs reduce common web risks.
- Payment verification and assignment use serializable database transactions. Scheduling applies an advisory lock and checks working hours, absence windows, and overlaps.
- Files have size, declared MIME, and magic-byte checks before upload to a private bucket. Downloads are streamed only after authorization.
- Important authentication, payment, request, assignment, settings, and profile actions create immutable audit records with actor and request context.

Before release, rotate all example secrets, terminate TLS at Nginx or the hosting load balancer, restrict infrastructure ports, enable encrypted backups, configure trusted SMTP, run dependency and container scans, and exercise restore procedures. Do not store secrets in Git.
