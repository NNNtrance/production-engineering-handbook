# Case Study 14: FIDO2 / WebAuthn Final Passkey Deletion Lock & Show-Once HMAC Recovery

> **Domain:** Security & Sandboxing  
> **Source Project:** `WebPageAnalyz (Operator Plane)`  
> **Language:** Node.js / FIDO2 / WebAuthn  
> **Key Metric:** `Zero lockout risk, atomic passkey deletion guard, HMAC recovery`  

---

## 1. The Constraint

In high-security administrator planes mandating phishing-resistant FIDO2/WebAuthn hardware keys, concurrent deletion requests from two browser tabs can race past checks and delete the operator's last remaining passkey, locking them out permanently. Furthermore, plaintext recovery code storage creates credential leak hazards.

---

## 2. Why Naive Workarounds Fail

1. **Generic ORM Hook Validation:**
   * Official authentication library plugin hooks often bypass generic application model hooks during passkey deletion, allowing concurrent deletes to succeed unnoticed.
2. **Unserialized Client-Side Checks:**
   * Checking passkey count in the browser before showing the delete button fails when an admin has the settings panel open in two separate browser tabs.
3. **Plaintext Recovery Codes:**
   * Storing backup codes in database columns allows database read leaks to expose permanent account takeover material.

---

## 3. The Architecture

1. **Serialized Atomic Key Deletion:** Protects passkey deletion with application middleware and per-user atomic locking, re-evaluating credentials inside the lock and throwing `409 ADMIN_FINAL_PASSKEY_REQUIRED` if only one key remains.
2. **Show-Once CSPRNG Recovery Codes:** 10 recovery codes generated with cryptographic randomness, shown only in the initial generation response, and stored strictly as HMAC-SHA256 hashes.
3. **Session Revocation on Break-Glass:** Consuming a recovery code requires password + TOTP verification, consumes the single code, rotates out stale step-up markers, revokes active sessions, and increments the account's `security_version`.

---

## 4. Code Implementation

See [`src/passkey_lock.js`](./src/passkey_lock.js) for the isolated implementation.

---

## 5. Benchmarks & Results

| Passkey Security Model | Concurrent Deletion Race | Break-Glass Storage | Session Invalidation |
|---|---|---|---|
| Plugin Default Hooks | Vulnerable (Accidental Lockout) | Plaintext | None |
| Client-Side Count Check | Vulnerable (Multi-Tab Race) | Plaintext | None |
| **Atomic Lock + HMAC Batch** | **100% Invariant Protected** | **HMAC-SHA256 (Show-Once)** | **Immediate Global Revocation** |
