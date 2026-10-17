# Case Study 09: Fail-Closed Chromium Seccomp Profile & Capability Dropping

> **Domain:** Security & Sandboxing  
> **Source Project:** `WebPageAnalyz (Browser Worker)`  
> **Language:** Docker / Linux Seccomp / Node.js  
> **Key Metric:** `--no-sandbox` forbidden, root setuid probe, fail-closed container boundary

---

## 1. The Constraint

Headless Chromium executing arbitrary third-party JavaScript is a high-value RCE target. In Docker environments, Chromium's namespace sandbox often fails under unprivileged users, tempting developers to run `--no-sandbox`, leaving the host container wide open to escape.

---

## 2. Why Naive Workarounds Fail

1. **Running with `--no-sandbox`:**
   * Disables Chrome's multi-process sandbox completely. Any V8 JIT compiler exploit or Chromium memory corruption gives attackers direct code execution within the container.
2. **Over-Privileged Containers (`--privileged` or `SYS_ADMIN`):**
   * Bypasses the error by granting the container administrative kernel privileges, allowing attackers to escape into the host kernel via cgroups or unconfined syscalls.
3. **Sharing Environment Secret Variables:**
   * Injecting backend environment variables into worker containers exposes database administrator credentials, billing keys, and OAuth secrets to untrusted renderers.

---

## 3. The Architecture

1. **Zero-Tolerance Sandbox Enforcer:** Worker entrypoint explicitly rejects boot if `CHROME_NO_SANDBOX` is set to any truthy value.
2. **Helper Binary Verification:** Validates that `/usr/lib/chromium/chrome-sandbox` is root-owned with the setuid bit active (`mode & 0o4000`), followed by a headless probe on `about:blank`.
3. **Pinned Seccomp Profile:** Applies a SHA-256 verified Microsoft Playwright Seccomp profile with `SCMP_ACT_ERRNO` deny-by-default, dropping all capabilities (`cap_drop: ALL`), `read_only` root FS, and `no-new-privileges`.
4. **Strict Secret Boundary:** `FORBIDDEN_WORKER_SECRETS` inspects environment variables on boot and immediately crashes if any auth, payment, or admin DB secrets are detected.

---

## 4. Code Implementation

See [`src/sandbox_enforcer.js`](./src/sandbox_enforcer.js) for the isolated implementation.

---

## 5. Behavior Comparison

| Container Security Model | V8 Exploit Blast Radius | Container Escape Risk | Secret Exposure |
|---|---|---|---|
| Default + `--no-sandbox` | Full Container Compromise | High | High (Shared Env) |
| Container + `SYS_ADMIN` | Host Kernel Compromise | Critical | High |
| **Pinned Seccomp Worker** | **Isolated to Chromium Process** | **Blocked (Capabilities dropped)** | **Stripped on boot** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._
