# Case Study 17: Timing-Safe Webhook HMAC Signature Verification & 5-Second Replay Fencing

> **Domain:** Fintech & Billing Invariants  
> **Source Project:** `WebPageAnalyz (Billing Gateway)`  
> **Language:** Node.js / Timing-Safe Crypto  
> **Key Metric:** `Constant-time verification, 5s replay fence, monotonic event ordering`  

---

## 1. The Constraint

Webhooks from billing providers (Paddle, Stripe) are vulnerable to timing attacks when verified with standard string comparisons, allowing attackers to deduce valid signatures. Furthermore, lack of timestamp replay fencing enables replay attacks where valid historic payment events are re-sent to grant unauthorized subscriptions.

---

## 2. Why Naive Workarounds Fail

1. **Standard Equality Operators (`=== / ==`):**
   * Early-exit string comparisons terminate on the first mismatched byte, leaking cryptographic signature byte values through nanosecond timing discrepancies.
2. **Missing or Loose Timestamp Windows:**
   * Many handlers only check signature validity without timestamp bounds, allowing captured historical webhooks to be replayed days or weeks later.
3. **Out-of-Order Delivery Race Conditions:**
   * Network lag can deliver an older `subscription.canceled` webhook *after* a newer `subscription.resumed` webhook, mistakenly canceling an active paid subscription.

---

## 3. The Architecture

1. **Constant-Time Verification:** Compares cryptographic signature buffers strictly using `crypto.timingSafeEqual()`, eliminating side-channel timing leaks.
2. **5-Second Replay Fence:** Enforces `Math.abs(currentSeconds - timestamp) > 5` to reject any captured or delayed webhook outside an immediate 5-second window.
3. **Monotonic Event Sequencing:** The billing engine records `occurred_at` timestamps and verifies that older events cannot regress newer subscription state.

---

## 4. Code Implementation

See [`src/webhook_verifier.js`](./src/webhook_verifier.js) for the isolated implementation.

---

## 5. Benchmarks & Results

| Webhook Verification Model | Side-Channel Timing Leak | Replay Attack Window | Out-of-Order Safety |
|---|---|---|---|
| String Equality (`===`) | Vulnerable (Early Exit) | Indefinite | None |
| Loose Timestamp Check | Vulnerable | Hours / Days | None |
| **Timing-Safe + 5s Fence** | **Zero Leak (crypto.timingSafeEqual)** | **Strict 5 Seconds** | **Guaranteed Monotonic** |
