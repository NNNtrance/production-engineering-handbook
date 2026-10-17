# Systems Engineering Case Study: In-Browser Real-Time Resource Timing Memory Extraction & Third-Party Weight Auditing

---

## 1. Problem

Auditing a web page's total network footprint and third-party script bloat usually requires running an external HTTP man-in-the-middle (MITM) proxy daemon (like mitmproxy or browsermob-proxy). Intercepting and buffering all TLS traffic outside the browser introduces massive CPU overhead, SSL re-encryption latency, and packet buffering memory consumption.

---

## 2. Why Naive Approaches Fail

1. **External MITM Proxy Daemons:**
   * Require installing custom root CA certificates inside Chromium and buffering gigabytes of network packets in proxy RAM.
2. **CDP Network Domain Event Buffering:**
   * Subscribing to Chrome DevTools Protocol `Network.responseReceived` emits tens of thousands of WebSocket events over IPC, causing Node.js event loop lag.
3. **CORS and Origin Obfuscation:**
   * Naive HTTP log parsing fails to accurately associate dynamic CDN sub-resources with the true host origin.

---

## 3. Architecture

1. **Direct V8 Memory Inspection:** Evaluates `performance.getEntriesByType('resource')` inside the browser's JavaScript execution thread. Browser engines (V8/Blink) maintain low-level network performance counters natively in memory.
2. **Zero-Copy Byte Aggregation:** Extracts `transferSize || encodedBodySize` directly from native `PerformanceResourceTiming` objects without streaming HTTP chunks across process boundaries.
3. **In-Browser Origin Partitioning:** Compares `new URL(resource.name).origin !== location.origin`, accurately tallying third-party tracking, analytics, and CDN weight in sub-millisecond execution time.
4. **Resilient Error Swallowing:** Wraps URL parsing in a fast try-catch closure to cleanly absorb invalid browser resource pseudo-URIs (such as `blob:`, `data:`, or malformed extension schemes).

```javascript
// 1. Extract resource transfer and encoded body metrics directly from browser memory
const resources = performance.getEntriesByType('resource').map((entry) => ({
    name: entry.name,
    bytes: entry.transferSize || entry.encodedBodySize || 0
}));

// 2. Compute third-party byte distribution against page origin
const origin = location.origin;
let thirdPartyBytes = 0;
for (const resource of resources) {
    try {
        if (new URL(resource.name).origin !== origin) thirdPartyBytes += resource.bytes;
    } catch { /* ignore invalid browser entries */ }
}
```

---

## 4. Behavior Comparison

| Third-Party Weight Auditing | TLS MITM Proxy Overhead | Transport Overhead | Extraction Model |
|---|---|---|---|
| External Proxy (mitmproxy) | Re-encryption & Root CA required | Local network proxy hop | Separate background process |
| CDP Network Event Stream | Native browser protocol | Verbose WebSocket event stream | Stream serialization overhead |
| **In-Browser Performance API** | **None (Native Web API)** | **Single in-browser evaluation** | **Direct Resource Timing API extraction** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._

---

## 5. Implementation

See implementation in [`src/resource_timing_extractor.js`](./src/resource_timing_extractor.js).

---

## 6. Visual Representation

![Visual Architecture Card](./assets/code-card.png)
