# API guide

All endpoints are under `/api/v1`. Successful JSON responses use `{ "success": true, "data": ... }`; failures use `{ "success": false, "error": { "code", "message", "details" } }`. Mutating authenticated requests require the `x-csrf-token` value issued by login and mirrored in the `qm_csrf` cookie.

| Area | Principal endpoints |
| --- | --- |
| Authentication | `POST /register`, `POST /login`, `POST /logout`, `GET /me`, password reset |
| Public | `GET /health`, `/public/config`, `/public/institutions`, `/public/pricing`, `/public/reviews` |
| Customer | profile, `POST /requests`, request list/detail/cancel, notifications |
| Payments | bank details, proof upload/status, authorized private proof download |
| Administration | dashboard, requests, payments, agents, assignments, schedule, institutions, pricing, settings, reports/CSV |
| Agent | dashboard, assignments, guarded status transitions, evidence, availability, earnings |

List endpoints return pagination metadata where applicable. Validation errors are HTTP 422, authentication errors 401, authorization errors 403, missing resources 404, and invalid state transitions 409.

Uploaded payment proof and task evidence is accepted only as signature-validated PDF, PNG, or JPEG up to 5 MB. Object keys are random and files are never publicly addressable.
