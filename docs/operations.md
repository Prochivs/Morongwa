# Operations guide

Administrators review payment proof manually, record a reason for every decision, approve only eligible institutions and service types, then assign an available agent. Conflict overrides require an explicit audit reason. The schedule view shows agent working windows and current work; reports provide operational and financial totals plus CSV export.

Agents accept a job and advance it in order: accepted, en route, arrived, in progress, and completed or failed. Completion requires an outcome; failure requires a reason. Agents see only their own assignments and should upload only permitted evidence with no unnecessary personal information.

Customers choose only currently permitted institutions/services, acknowledge the operating rules, submit a future time, and receive a unique `QM-YYYY-NNNNNN` reference. Payment remains unverified until an administrator checks the private proof. Customers can cancel before field work begins; verified payments are flagged for refund review rather than automatically refunded.

Investigate failures using API structured logs, audit records, notification delivery state, and service health checks. Never solve an access problem by changing ownership data directly; use documented status actions or a reviewed database repair with an audit record.
