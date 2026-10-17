# Case Study 04: RAM-Level Network Reverse-Scraping

> **Domain:** Memory & Performance  
> **Source Project:** `llm-conductor` (Desktop Native Core)  
> **Language:** TypeScript / Chrome DevTools Protocol  
> **Dependencies:** `0` (Native CDP Network domain)  
> **Key Metric:** Direct CDP network response body extraction, avoids DOM stringification

---

## 1. The Constraint

Standard autonomous web agents parse the HTML DOM tree to extract information for LLM reasoning loops. 

On modern Single Page Applications (SPAs), dumping the DOM yields thousands of tokens of wrapper elements, CSS class names, and SVG markup. This inflates context windows with redundant markup and increases reasoning latency.

---

## 2. Why Naive Workarounds Fail

1. **HTML Sanitization (readability.js, cheerio):**
   * Drops crucial dynamic client-side hydration data and still produces unstructured tokens.
2. **Vision Screenshots:**
   * High token cost, coordinate inaccuracy, and fails on off-screen lazy-loaded lists.

---

## 3. The Architecture

Instead of parsing what the browser rendered, we intercept the authoritative API responses directly from Chrome's RAM:

1. **Network Sniffing:** We subscribe to CDP `Network.responseReceived`.
2. **Filter & In-Memory Trap:** Incoming responses matching `application/json` or API patterns have their `requestId` registered.
3. **RAM Reverse-Scraping:** We issue `Network.getResponseBody`. Chrome returns the raw JSON payload directly from its internal cache without prompt token overhead.

---

## 4. Behavior Comparison

| Scraping Extraction Model | Prompt Token Cost | Execution Model | HTML Serialization Overhead |
|---|---|---|---|
| LLM DOM Stringification | High token consumption | LLM prompt serialization | Full DOM dump parse |
| DOM QuerySelector Parsing | No LLM tokens | Fragile client selectors | Vulnerable to DOM class obfuscation |
| **CDP Network Body Extraction** | **No LLM tokens** | **Direct RAM payload extraction** | **Bypasses DOM serialization** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._
