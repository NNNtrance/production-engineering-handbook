# Case Study 02: Mid-Flight Mutating Request Sandbox

> **Domain:** Security & Sandboxing  
> **Source Project:** `llm-conductor` (Desktop Native Core)  
> **Language:** TypeScript / Chrome DevTools Protocol  
> **Dependencies:** `0` (Native CDP Fetch domain)  
> **Key Metric:** `100%` deterministic mutation interception, 0 unauthorized side-effects

---

## 1. The Constraint

Autonomous AI browser agents executing tasks on behalf of a user possess authenticated session access to services like GitHub, AWS, cloud providers, and banking portals.

If an LLM hallucinates an interaction or follows a prompt injection embedded in page HTML, it can dispatch mutating HTTP requests (`POST`, `PUT`, `DELETE`, `PATCH`) that permanently delete repositories, alter DNS, or trigger financial transfers.

---

## 2. Why Naive Workarounds Fail

1. **Pre-Click DOM Confirmation Prompts:**
   * Asking a human "May I click this button?" fails because DOM text labels are unreliable. A button labeled "Continue" or "Next" can trigger a background `DELETE` or `POST` mutation via dynamic JavaScript event listeners.
2. **Post-Request Audit Logs:**
   * Logging requests after execution is too late; once TCP frames leave the network interface, irreversible mutations have already executed on the remote server.
3. **Local Forwarding Proxies (mitmproxy, Squid):**
   * Heavyweight, requires installing local root CA certificates for TLS decryption, and breaks on HTTP/2 or HTTP/3 without extensive configuration.

---

## 3. The Architecture

We hooked directly into Chrome DevTools Protocol's low-level `Fetch` domain (`Fetch.enable` with request-stage interception):

1. **In-Flight Suspension:** Before an HTTP request frame leaves the browser process, Chrome fires `Fetch.requestPaused`.
2. **Verb Filter:** Safe read-only requests (`GET`, `HEAD`, `OPTIONS`) are immediately forwarded via `Fetch.continueRequest`.
3. **Interactive Human Sign-Off:** Mutating requests (`POST`, `PUT`, `DELETE`, `PATCH`) are held in memory. The desktop UI presents the destination URL, method, and payload to the user.
4. **Deterministic Gate:** The request is only permitted onto the network wire upon explicit human approval.

---

## 4. Code Implementation

See [`src/guard.ts`](./src/guard.ts) for the isolated implementation.

---

## 5. Benchmarks & Results

| Approach | Setup Overhead | TLS Certificate Decryption | Mutating Request Safety |
|---|---|---|---|
| DOM Prompting | None | N/A | Flawed (unreliable selectors) |
| Local MITM Proxy | High (Daemon + Root CA) | Required | High (fragile on HTTP/2) |
| **CDP Mid-Flight Hook** | **Zero (Native Browser)** | **Not needed (Pre-TLS)** | **100% Deterministic** |
