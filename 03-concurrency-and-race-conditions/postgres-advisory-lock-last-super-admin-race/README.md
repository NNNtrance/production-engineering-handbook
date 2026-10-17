# Case Study 10: PostgreSQL Statement Advisory Lock against Last Super Admin Concurrent Downgrade

> **Domain:** Concurrency & Race Conditions  
> **Source Project:** `WebPageAnalyz (Admin Auth Engine)`  
> **Language:** PostgreSQL PL/pgSQL  
> **Key Metric:** Serialized statement advisory lock, SQLSTATE 23514 fail-closed check

---

## 1. The Constraint

A critical system invariant requires that at least one active `super_admin` must exist at all times. Under PostgreSQL's default `READ COMMITTED` transaction isolation, row-level check triggers fail to prevent concurrent downgrade attacks: if two admins downgrade each other simultaneously, both transactions see 2 admins in their snapshot and commit, leaving 0 super admins.

---

## 2. Why Naive Workarounds Fail

1. **Application-Layer Count Checks:**
   * `SELECT count(*) FROM admins` executed in Node.js before an update suffers from a classic Time-of-Check to Time-of-Use race condition across concurrent requests.
2. **Row-Level Triggers Alone:**
   * Under `READ COMMITTED`, row triggers evaluate each row independently. Transaction A locks Admin 1; Transaction B locks Admin 2. Both see the other admin still active in their snapshot and both succeed.
3. **Table-Level Exclusive Locks (`LOCK TABLE`):**
   * Too coarse; blocks non-conflicting reads and creates database-wide lock contention during high-frequency admin telemetry updates.

---

## 3. The Architecture

1. **Statement-Level Transaction Advisory Lock:** Migration 041 installs a statement-level trigger acquiring `pg_advisory_xact_lock(hashtext('wpa:privileged-role-management'))` BEFORE any UPDATE or DELETE statement executes.
2. **Deterministic Serialization:** Concurrent mutations on the admin set are strictly serialized before row evaluation begins.
3. **Fail-Closed Row Guard:** Migration 040's row trigger evaluates the active super admin count. The first transaction succeeds; the competing transaction evaluates the newly committed state, detects 0 remaining super admins, and raises SQLSTATE `23514` (`LAST_SUPER_ADMIN_REQUIRED`).
4. **Automatic Lock Release:** Advisory transaction locks release automatically upon transaction commit or rollback, leaving no orphaned locks.

---

## 4. Code Implementation

See [`src/super_admin_guard.sql`](./src/super_admin_guard.sql) for the isolated implementation.

---

## 5. Behavior Comparison

| Concurrency Guard | Concurrent Downgrade Race | Performance Overhead | Lock Residue Risk |
|---|---|---|---|
| Application Check (`count(*)`) | Vulnerable to concurrent updates | Low | None |
| Row-Level Trigger Only | Vulnerable under Read Committed | Low | None |
| `LOCK TABLE wpa_admin_accounts` | Protected | High (Blocks Reads) | High |
| **Statement Advisory Lock** | **Serialized (Raises SQLSTATE 23514)** | **Scoped to statement mutation** | **Releases automatically on commit/rollback** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._
