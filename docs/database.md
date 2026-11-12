# Data model

```mermaid
erDiagram
  User ||--o| CustomerProfile : has
  User ||--o| AgentProfile : has
  User ||--o{ Session : owns
  User ||--o{ ServiceRequest : creates
  Institution ||--o{ InstitutionPermission : grants
  ServiceType ||--o{ InstitutionPermission : covers
  Institution ||--o{ ServiceRequest : receives
  ServiceType ||--o{ ServiceRequest : categorizes
  ServiceRequest ||--o{ Payment : has
  Payment ||--o{ PaymentProof : has
  ServiceRequest ||--o{ AgentAssignment : has
  AgentProfile ||--o{ AgentAssignment : performs
  AgentProfile ||--o{ AgentAvailability : declares
  ServiceRequest ||--o{ TaskUpdate : tracks
  ServiceRequest ||--o{ TaskEvidence : proves
  User ||--o{ Notification : receives
  ServiceRequest ||--o{ Review : receives
  ServiceRequest ||--o{ AuditLog : concerns
```

Monetary values use PostgreSQL decimal columns and timestamps are stored as UTC. The business timezone is `Africa/Gaborone` when translating customer dates/times. Soft deletion is used for institutions and service requests; audit events remain append-only.
