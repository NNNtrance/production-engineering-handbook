# Case Study 19: Automated Ephemeral Database Disaster Recovery Validation Harness

> **Domain:** DevOps & Disaster Recovery  
> **Source Project:** `WebPageAnalyz (Infra Automation)`  
> **Language:** POSIX Shell / PostgreSQL / age  
> **Key Metric:** `Automated SHA-256 check, age decryption, ephemeral database creation, trap-based cleanup`  

---

## 1. The Constraint

"Untested backups are not backups." Most development teams configure daily `pg_dump` cron jobs but never test restoring them until catastrophic production data loss occurs, only to discover corrupted archives, missing encryption keys, or schema migration incompatibility.

---

## 2. Why Naive Workarounds Fail

1. **Silent Backup Corruption:**
   * Backups can complete with exit code 0 while producing truncated files or failing SHA-256 validation due to disk or network glitches.
2. **Untested Encryption Keys:**
   * Backups encrypted with modern public-key crypto (like `age`) often fail restore drills because private keys were rotated or lost.
3. **Manual Disaster Recovery Drills:**
   * Manual restore drills are done quarterly or never, leaving production vulnerable to silent data loss between drills.

---

## 3. The Architecture

1. **Strict Shell Safety:** Runs with `set -eu` and `umask 077` to guarantee error termination and restrict temporary decrypted file permissions.
2. **Integrity & Decryption Pipeline:** Automatically validates `sha256sum --check` and decrypts `age` encrypted backups into temporary RAM dumps.
3. **Disposable Database Provisioning:** Generates an isolated ephemeral PostgreSQL database (`wpa_restore_check_${timestamp}`) and restores with `--exit-on-error`.
4. **Automated Schema & Entity Assertions:** Queries row counts across core tables (`wpa_schema_migrations`, `wpa_workspaces`, `wpa_reports`) to assert semantic integrity.
5. **Trap-Based Guaranteed Cleanup:** POSIX shell `trap cleanup EXIT HUP INT TERM` ensures the temporary database and decrypted files are destroyed upon completion or failure, leaving zero disk residue.

---

## 4. Code Implementation

See [`src/restore_check.sh`](./src/restore_check.sh) for the isolated implementation.

---

## 5. Behavior Comparison

| Backup Strategy | Integrity Verification | Key Decryption Test | Schema Compatibility Test |
|---|---|---|---|
| Unmonitored Cron Dump | None (Blind Faith) | None | None |
| Periodic Manual Drill | Occasional | Manual | Manual |
| **Automated Ephemeral Restore Rig** | **SHA-256 Verified** | **Automated age Decrypt** | **Full Restore + Table Assertions** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._
