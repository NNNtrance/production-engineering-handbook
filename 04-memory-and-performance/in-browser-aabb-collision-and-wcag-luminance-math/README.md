# Case Study 22: In-Browser AABB Geometry Collision & WCAG Luminance Math

> **Domain:** Memory & Performance  
> **Source Project:** `WebPageAnalyz (Advanced Browser Analyzer)`  
> **Language:** JavaScript / In-Page Evaluation  
> **Key Metric:** `AABB 2D area intersection (>400px excluding ancestry), W3C relative luminance bubbling through transparent DOM parents`  

---

## 1. The Constraint

Auditing responsive web pages for visual interface bugs—such as overlapping modals, obscured buttons, or unreadable low-contrast text—is typically done with screenshot OCR or multi-modal Vision LLMs. Vision models are slow (3-8s latency), expensive ($0.05 per screenshot), non-deterministic, and fail on dynamic viewports.

---

## 2. Why Naive Workarounds Fail

1. **Multi-Modal Vision LLMs (GPT-4o / Claude Vision):**
   * Non-deterministic; hallucinations cause false positives on gradient backgrounds and miss sub-pixel collisions on complex dashboards.
2. **Canvas Pixel Diffing:**
   * Pixel diffing requires a golden baseline image. It cannot audit arbitrary third-party websites without pre-existing reference screenshots.
3. **Naive CSS Color Parsing:**
   * Checking `getComputedStyle(el).backgroundColor` returns `rgba(0,0,0,0)` (transparent) for most text nodes, failing standard WCAG contrast checks.

---

## 3. The Architecture

1. **Recursive Parent Luminance Bubbling:** If an element has transparent background, the analyzer traverses up the DOM tree until it resolves a non-transparent ancestor, applying the W3C relative luminance formula:
   `L = 0.2126 * R + 0.7152 * G + 0.0722 * B` (with sRGB gamma expansion).
2. **Axis-Aligned Bounding Box (AABB) 2D Intersection:** Evaluates 2D rectangle overlaps across `fixed`, `sticky`, and `absolute` elements in Chrome memory.
3. **Ancestry Exclusion Invariant:** Checks `!a.contains(b) && !b.contains(a)` to ensure parent containers housing child elements are never falsely flagged as collisions.
4. **Zero-Token Latency:** Computes all calculations directly inside Chrome's V8 engine via `page.evaluate()` in sub-50ms.

---

## 4. Code Implementation

See [`src/geometry_analyzer.js`](./src/geometry_analyzer.js) for the isolated implementation.

---

## 5. Benchmarks & Results

| Layout Audit Model | Latency | Cost Per Page | Determinism | Viewport Portability |
|---|---|---|---|---|
| Vision Model Prompt | 3,000ms - 8,000ms | ~$0.05 | Non-Deterministic | Low |
| Canvas Pixel Diffing | 1,500ms | Compute Heavy | Fragile | Baseline Required |
| **In-Browser Geometry & Math** | **<50ms** | **$0.00 (Zero Tokens)** | **100% Deterministic** | **Desktop & Mobile** |
