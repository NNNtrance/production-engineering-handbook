# Case Study 20: Dynamic SPA Rendered Link Credential Stripping & Diagnostic Redaction

> **Domain:** Security & Sandboxing  
> **Source Project:** `WebPageAnalyz (WPA Page Analyzer)`  
> **Language:** JavaScript / Playwright  
> **Key Metric:** `100% credential parameter stripping, console diagnostic redaction, zero secret leakage in shared reports`  

---

## 1. The Constraint

Headless browser analyzers crawling modern dynamic Single Page Applications (SPAs) frequently extract links rendered by client-side JavaScript. Many applications inadvertently expose authentication tokens, OAuth authorization codes, session keys, or API secrets in query parameters (`?token=xyz`, `?access_key=123`). Storing these links into shareable audit reports leaks sensitive customer secrets.

---

## 2. Why Naive Workarounds Fail

1. **Unfiltered Link Discovery:**
   * Ingesting all `<a>` tags and dynamically rendered references exposes ephemeral tokens to database logs, report viewers, and external export APIs.
2. **Raw Console Error Logging:**
   * Browser `console.error` and unhandled rejection stack traces routinely dump authorization headers, cookies, and local file paths directly into diagnostic outputs.
3. **Manual Blacklisting:**
   * Relying on manual developer inspection fails against dynamic client-side router parameters generated at runtime.

---

## 3. The Architecture

1. **In-Browser Credential Filter:** `RENDERED_LINK_SENSITIVE_PARAMETER` scans all query parameters for sensitive tokens (`token`, `secret`, `api_key`, `auth`, `session`), stripping offending parameters immediately.
2. **Diagnostic Log Redaction:** `sanitizeDiagnosticText()` strips URLs down to clean origins and replaces sensitive headers (`authorization`, `cookie`, `set-cookie`, `token`, `password`) with `[REDACTED]`.
3. **Stack Trace Scrubbing:** Masks local filesystem paths (`[LOCAL_PATH]`) and query strings from error stack traces before database persistence.

---

## 4. Code Implementation

See [`src/credential_redactor.js`](./src/credential_redactor.js) for the isolated implementation.

---

## 5. Benchmarks & Results

| Analyzer Redaction Model | SPA Token Leaks | Diagnostic Secret Redaction | Shareable Report Safety |
|---|---|---|---|
| Unfiltered Raw DOM | High (Tokens in Query Strings) | None (Raw Stacks) | Dangerous |
| URL-Only Stripping | Partial | None | Vulnerable |
| **AST & Diagnostic Redactor** | **100% Stripped** | **Full Regex Sanitization** | **Safe for Public Sharing** |
