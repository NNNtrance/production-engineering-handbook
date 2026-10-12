# Case Study 15: PostgreSQL Atomic Single-Query Sliding Window Rate Limiting

> **Domain:** Concurrency & Race Conditions  
> **Source Project:** `WebPageAnalyz (Middleware Core)`  
> **Language:** SQL / Node.js  
> **Key Metric:** `1 roundtrip atomic upsert, 0 Redis clusters, microsecond execution`  

---

## 1. The Constraint

Implementing sliding-window rate limiting across distributed containerized workers typically leads teams to deploy Redis clusters and maintain custom Lua scripts. Adding Redis adds operational complexity, memory eviction issues, and network failure modes.

---

## 2. Why Naive Workarounds Fail

1. **In-Memory Rate Limiters (Node.js Map/LRU):**
   * Only protects a single process. In multi-container topologies behind load balancers, memory counters are fragmented, allowing N-times traffic multiplication.
2. **Standard Redis + Lua Scripts:**
   * Requires managing separate Redis clusters, Sentinel/failover configuration, and eviction policies, introducing a second stateful infrastructure dependency.
3. **Multi-Query Read-Then-Write SQL:**
   * Running `SELECT hits` followed by `UPDATE hits` introduces severe race conditions under concurrent burst traffic, allowing limits to be exceeded.

---

## 3. The Architecture

1. **Atomic Upsert Mathematical Invariant:** Executes an atomic `INSERT ... ON CONFLICT (namespace, key) DO UPDATE` in a single database roundtrip.
2. **In-Database Window Evaluation:** Evaluates whether `window_started_at` has exceeded the sliding duration directly inside SQL `CASE` expressions:
   * If the window expired: Resets `window_started_at` to `now()` and sets `hits` to 1.
   * If the window is active: Retains `window_started_at` and increments `hits + 1`.
3. **Immediate Atomic Return:** The query returns `RETURNING hits, window_started_at`, providing exact count and calculated reset time in microseconds without locks.

---

## 4. Code Implementation

See [`src/rate_limiter.sql`](./src/rate_limiter.sql) for the isolated implementation.

---

## 5. Benchmarks & Results

| Rate Limiting Strategy | Distributed Consistency | Infrastructure Footprint | Race Condition Risk |
|---|---|---|---|
| In-Memory Node.js Map | Fragmented (Per-Process) | 0 KB | High (Cluster Bypass) |
| Redis + Lua Script | Consistent | +Redis Cluster / Memory | Low |
| **PostgreSQL Atomic Upsert** | **100% Consistent** | **Zero (Existing DB Pool)** | **Zero (Atomic On-Conflict)** |
