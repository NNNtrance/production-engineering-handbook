# Case Study 58: Zero-Dependency HS256 Web Crypto JWT Engine with Key Length Hardening

## 1. The Engineering Constraint
1. **Weak HMAC Symmetric Keys:** Naive JWT implementations accept arbitrary 4-character passwords as secrets, allowing offline dictionary brute-forcing via tools like hashcat.
2. **Algorithm Confusion Attacks:** Accepting dynamic `alg` headers allows attackers to forge tokens with `alg: "none"` or submit RSA public keys against HMAC verification logic.
3. **Timing Attacks on Signatures:** Comparing signatures with naive string comparison (`sig1 === sig2`) leaks byte equality offsets via microsecond timing side-channels.

## 2. Why Naive Workarounds Fail
1. **Heavy Third-Party Dependencies:** Pulling full cryptographic packages adds hundreds of kilobytes and Node.js-only bindings that break on Cloudflare Workers and browser runtimes.
2. **Lenient Secret Coercion:** Silently padding short keys weakens entropy and violates RFC 7519 cryptographic recommendations.
3. **Unvalidated JSON Decoding:** Decoding payloads without fatal UTF-8 rejection allows Unicode surrogate pair attacks and prototype pollution.

## 3. The Architecture
1. **256-Bit Key Enforcement (`MIN_SECRET_BYTES = 32`):** `encodeSecret()` strictly validates that the shared secret is at least 32 UTF-8 bytes (256 bits), throwing a fail-closed `RangeError` on weak keys.
2. **Universal Web Crypto API:** Built entirely on `globalThis.crypto.subtle`, running natively with zero external dependencies in Cloudflare Workers, Node.js, Deno, Bun, and browsers.
3. **Constant-Time Verification:** Signatures are verified natively via `crypto.subtle.verify('HMAC', ...)`, eliminating timing attacks.

## 4. Behavior Comparison
| JWT Security Attribute | Naive JWT Implementation | omniguard Web Crypto JWT |
|---|---|---|
| Key Length Validation | None (Allows 4-char keys) | Strict (>= 32 UTF-8 bytes / 256 bits) |
| Algorithm Switching Attack | Vulnerable (`alg: none`) | Hardened (Enforces `alg: HS256`) |
| Signature Comparison | String Equality (`===`) | Constant-Time (`crypto.subtle.verify`) |
| Dependencies & Runtime Portability | 3+ C-bindings / Node-only | Standard Web Crypto API only (no external dependencies) |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._

## 5. Implementation
See implementation in [`src/jwt_validator.ts`](./src/jwt_validator.ts).
