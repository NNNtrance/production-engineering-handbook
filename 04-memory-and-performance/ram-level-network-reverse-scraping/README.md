# Case Study 04: RAM-Level Network Reverse-Scraping

> **Domain:** Memory & Performance  
> **Source Project:** `llm-conductor` (Desktop Native Core)  
> **Language:** TypeScript / Chrome DevTools Protocol  
> **Dependencies:** `0` (Native CDP Network domain)  
> **Key Metric:** `0` prompt tokens, `<10ms` response extraction (down from 4000ms DOM stringification)

---

## 1. The Constraint

Standard autonomous web agents parse the HTML DOM tree to extract information for LLM reasoning loops. 

On modern Single Page Applications (SPAs), dumping the DOM yields 30,000 to 80,000 tokens of useless div wrappers, CSS class names, and SVG markup. This costs ~$0.05 to $0.15 per turn and introduces 3 to 6 seconds of latency.

---

## 2. Why Naive Workarounds Fail

1. **HTML Sanitization (readability.js, cheerio):**
   * Drops crucial dynamic client-side hydration data and still produces thousands of unstructured tokens.
2. **Vision Screenshots:**
   * High token cost, coordinate inaccuracy, and fails on off-screen lazy-loaded lists.

---

## 3. The Architecture

Instead of parsing what the browser rendered, we intercept the authoritative API responses directly from Chrome's RAM:

1. **Network Sniffing:** We subscribe to CDP `Network.responseReceived`.
2. **Filter & In-Memory Trap:** Incoming responses matching `application/json` or API patterns have their `requestId` registered.
3. **RAM Reverse-Scraping:** We issue `Network.getResponseBody`. Chrome returns the raw JSON payload directly from its internal cache in under 10ms with zero token overhead.
