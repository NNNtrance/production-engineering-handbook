# Systems Engineering Case Study: Base64url Keyset Pagination Cursors & Target URL Credential Scrubbing

---

## 1. Problem

In customer support and ticketing backends, two problems frequently occur:
1. **Offset Pagination Degradation:** Using `OFFSET 10000` causes linear performance degradation and full table scans. Furthermore, concurrent ticket creation shifts row offsets, causing users to see duplicate items or miss newly created tickets.
2. **Credential Leaks in User Bug Reports:** Users copying and pasting internal URLs into support tickets often paste authenticated URLs containing embedded credentials (`https://{user}:{password}@internal.corp/debug`). Storing these in plain text risks exposing sensitive internal passwords to support staff and logging pipelines.

---

## 2. Why Naive Approaches Fail

1. **Traditional Limit/Offset Queries:**
   * Scanning 50 pages of tickets forces the database engine to traverse and discard thousands of rows for every page turn.
2. **Unvalidated Cursor Payloads:**
   * Passing unverified cursor strings allows malicious clients to inject malformed JSON, crash API endpoints, or probe unauthorized partition bounds.
3. **Naive String URL Storage:**
   * Storing raw user strings without protocol and credential sanitization stores plaintext basic auth secrets in audit databases.

---

## 3. Architecture

1. **Base64url Encoded Keyset Cursors:** Serializes deterministic state tuples (`{ at, id }`) into compact Base64url tokens. `decodeCursor()` bounds token length to 512 bytes, verifies JSON structure, and asserts finite ISO timestamp parsing.
2. **Index Seek (O(log n)) Instead of Offset Scan:** Uses indexed compound filters (`WHERE (created_at, id) < ($1, $2)`), executing an index seek instead of scanning and discarding preceding rows with OFFSET regardless of table depth.
3. **URL Protocol & Credential Sanitization:** Parses input via native `URL`. Strictly rejects non-HTTP(S) schemes and asserts `!parsed.username && !parsed.password`. Authenticated URLs with embedded credentials are discarded rather than persisted.

```javascript
// 1. Keyset pagination cursor encoding and strict decoding
function encodeCursor(value) {
    return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function decodeCursor(value) {
    if (!value) return null;
    if (typeof value !== 'string' || value.length > 512) {
        throw new AppError('The support pagination cursor is invalid.', { status: 400, code: 'SUPPORT_CURSOR_INVALID' });
    }
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    if (!decoded?.id || !Number.isFinite(Date.parse(decoded.at))) throw new Error('invalid');
    return { at: new Date(decoded.at).toISOString(), id: decoded.id };
}

// 2. Structured message context extraction scrubbing embedded credentials from URLs
try {
    const parsed = fields.targeturl ? new URL(fields.targeturl) : null;
    if (parsed && ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password) {
        targetUrl = parsed.toString();
    }
} catch { /* malformed context is ignored */ }
```

---

## 4. Behavior Comparison

| Support Table Pagination | Deep Page Query Latency | Row Shift Invariance | URL Credential Scrubbing |
|---|---|---|---|
| Offset Pagination (`OFFSET 5000`) | Degrades with page depth (Scans preceding rows) | Vulnerable (Skips/Duplicates) | None (Stores Plaintext) |
| ID-Only Cursor | Index seek | Breaks on equal timestamps | None |
| **Base64url Keyset `(at, id)`** | **B-tree index seek (O(log n))** | **Stable against concurrent row shifts** | **Query credentials stripped from URLs** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._

---

## 5. Implementation

See implementation in [`src/support_keyset_cursor.js`](./src/support_keyset_cursor.js).

---

## 6. Visual Representation

![Visual Architecture Card](./assets/code-card.png)
