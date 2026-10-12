# Case Study 25: Database Least-Privilege Role Separation & Fail-Closed Startup Attestation

> **Domain:** Security & Sandboxing  
> **Source Project:** `WebPageAnalyz (DB Security)`  
> **Language:** PostgreSQL / Node.js  
> **Key Metric:** `5 dedicated PostgreSQL roles, worker has 0 DELETE grants, startup role attestation fails closed on mismatch`  

---

## 1. The Constraint

Most web backends connect to PostgreSQL using a single administrative or generic user (`postgres:postgres`). If a container running untrusted headless browser workloads is compromised via an RCE exploit, the attacker inherits full database privileges, allowing them to delete user accounts, drop audit tables, or dump payment secrets.

---

## 2. Why Naive Workarounds Fail

1. **Single Shared Database User:**
   * Grants every microservice, background worker, and script identical full DML/DDL permissions across all tables.
2. **Application-Layer Authorization Alone:**
   * If an attacker gains shell execution inside a worker container, application-layer permission checks are bypassed; they talk directly to PostgreSQL.
3. **Unvalidated Database Connections:**
   * Containers misconfigured with wrong credentials silently connect with excessive privileges without alerting operators.

---

## 3. The Architecture

1. **5 Segregated PostgreSQL Roles:**
   * `wpa_owner` (NOLOGIN): Owns all platform tables.
   * `wpa_migrator`: Exclusive DDL permissions for schema migrations.
   * `wpa_runtime`: API backend user (SELECT, INSERT, UPDATE on application tables; zero DDL).
   * `wpa_worker`: Browser analysis workers (SELECT, INSERT, UPDATE on scan/source tables; **zero DELETE permissions** on event history, reports, or users).
   * `wpa_maintenance`: Exclusive narrowly-scoped DELETE authority for data retention and confirmed workspace purging.
2. **Fail-Closed Startup Role Attestation:** On boot, workers query `SELECT current_user AS role` and crash immediately with `WORKER_DATABASE_ROLE_MISMATCH` if the active role does not match `DATABASE_EXPECTED_ROLE`.
3. **Mandatory Connection String Timeouts:** URL strings strictly enforce 4 timeouts: `connect_timeout`, `statement_timeout`, `lock_timeout`, and `idle_in_transaction_session_timeout`.

---

## 4. Code Implementation

See [`src/database_roles.sql`](./src/database_roles.sql) for the isolated implementation.

---

## 5. Benchmarks & Results

| Database Authority Model | Blast Radius on Worker RCE | Audit Log Tampering Risk | Startup Role Validation |
|---|---|---|---|
| Single `postgres` User | Complete Database Destruction | High (DELETE Allowed) | None |
| Granular Roles without Validation | Dependent on Configuration | Medium | Unchecked |
| **5 Segregated Roles + Startup Attestation** | **Zero DELETE / Zero Schema Access** | **Protected (0 DELETE Grants)** | **Fail-Closed (`current_user`)** |
