# Case Study 13: Partial Unique Index & Setup Leases for Checkout Idempotency & Audit Atomicity

> **Domain:** Fintech & Billing Invariants  
> **Source Project:** `WebPageAnalyz (Billing Core)`  
> **Language:** PostgreSQL / Node.js  
> **Key Metric:** Unique index deduplication of active checkout intents, atomic rollback on audit failure

---

## 1. The Constraint

Double-clicks on checkout buttons or multiple open browser tabs spawn duplicate payment sessions and race conditions with providers like Paddle or Stripe. Furthermore, in high-compliance billing, if an audit log write fails, leaving an entitlement change committed creates severe compliance violations.

---

## 2. Why Naive Workarounds Fail

1. **Frontend Button Disabling:**
   * Trivial to bypass via network retries, script injection, or opening two browser tabs simultaneously.
2. **Full Table Unique Constraints:**
   * A simple `UNIQUE(workspace_id)` prevents a customer from ever buying another subscription in the future after their first plan expires.
3. **Decoupled Audit Logging:**
   * Asynchronous or non-transactional audit logging allows database disks or network partitions to drop audit events while leaving privileged billing mutations committed.

---

## 3. The Architecture

1. **Partial Unique Index Invariant:** `CREATE UNIQUE INDEX ... ON wpa_checkout_acceptances(workspace_id) WHERE status IN ('accepted', 'checkout_created')` ensures only one active checkout intent can exist per tenant at any time.
2. **Setup Lease Fencing:** Provider checkout creation is guarded by a bounded lease (`setup_lease_owner`, `setup_lease_token`), serializing external API calls while permitting crash recovery after timeout.
3. **Mandatory Audit Atomicity:** Every entitlement and plan mutation is executed within a database transaction where audit log insertion is non-optional. If `wpa_audit_log` fails, the entire mutation immediately issues `ROLLBACK`.

---

## 4. Code Implementation

See [`src/checkout_idempotency.sql`](./src/checkout_idempotency.sql) for the isolated implementation.

---

## 5. Behavior Comparison

| Billing Protection Model | Double-Click Protection | Multi-Tab Race Safety | Audit Guarantee |
|---|---|---|---|
| UI Button Disabled | Fragile (Network Bypass) | Vulnerable | None |
| Full Unique Constraint | Protected | Blocks Future Renewals | None |
| **Partial Unique Index + Lease** | **Database-enforced index deduplication** | **Serialized active intents via lease** | **Strict Transactional Rollback** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._
