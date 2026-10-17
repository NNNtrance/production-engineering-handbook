# Case Study 21: Crawler Trap Mitigation & Combinatorial Query Explosion Defense

> **Domain:** Autonomous Agents & Automation  
> **Source Project:** `WebPageAnalyz (Crawler Core)`  
> **Language:** Node.js  
> **Key Metric:** `maxCalendarYearDrift: 5, query variants clamped to 5, path depth 16, sitemap decompression limits`  

---

## 1. The Constraint

Automated website crawlers face adversarial website architectures: infinite calendar widgets (clicking "Next Year" into infinity), faceted eCommerce search filters generating factorial query permutations (`?color=red&size=m&sort=asc...`), and deep cyclic URL structures. Without explicit boundaries, crawlers run out of memory or DDoS target hosts.

---

## 2. Why Naive Workarounds Fail

1. **Simple URL Visited Sets:**
   * Tracking visited URLs in a Set fails because dynamic parameters (`?page=1000`, `?date=2040`) generate millions of unique strings for identical pages.
2. **Infinite Sitemap Recursion:**
   * Malicious or recursive sitemap indexes nested 50 levels deep exhaust memory or trigger gzip decompression bombs.
3. **Unbounded URL Queues:**
   * Allowing queues to grow without limits causes memory leaks and starves container worker pools.

---

## 3. The Architecture

1. **Calendar Year Drift Clamping:** Rejects calendar drift beyond `maxCalendarYearDrift: 5`, immediately severing infinite calendar date click loops.
2. **Path Depth & Combinatorial Query Ceilings:** Restricts maximum URL path depth to 16 and clamps query parameter variants per unique path to 5, killing faceted search explosions.
3. **Pagination Upper Bounds:** Imposes a strict ceiling on pagination numbers (`maxPaginationValue: 250`) preventing crawlers from crawling arbitrarily large pagination sequences.
4. **Sitemap Decompression & Depth Fencing:** Caps sitemap decompression at 8 MB and nesting depth at 3, neutralizing XML expansion bombs.

---

## 4. Code Implementation

See [`src/crawler_limits.js`](./src/crawler_limits.js) for the isolated implementation.

---

## 5. Behavior Comparison

| Crawler Traversal Model | Infinite Calendar Trap | Faceted Search Explosion | Memory Footprint |
|---|---|---|---|
| Basic Visited Set | Infinite Loop (Memory Crash) | Exponential (O(N!)) | Unbounded |
| Regex Blacklisting | Incomplete | Incomplete | High |
| **Strict Bounded Crawler Limits** | **Bounded (Rejects calendar drift > 5 years)** | **Clamped (Max 5 query variants)** | **Bounded by configured depth and count limits** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._
