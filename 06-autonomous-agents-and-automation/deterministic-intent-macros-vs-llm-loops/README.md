# Case Study 06: Deterministic Intent Macros vs N-Turn LLM Loops

> **Domain:** Autonomous Agents & Browser Automation  
> **Source Project:** `llm-conductor` (Desktop Native Core)  
> **Language:** TypeScript / Client-Side DOM Automation  
> **Dependencies:** `0` (Standard DOM APIs)  
> **Key Metric:** Single-turn atomic intent compilation replaces multi-turn LLM reasoning loops

---

## 1. The Constraint

Standard autonomous browser agent frameworks (Browser-Use, Agent-E, generic LangChain tools) interact with websites via brute-force single-step loops:
* Step 1: LLM locates the search input.
* Step 2: LLM types the query.
* Step 3: LLM presses enter.
* Step 4: LLM identifies the search results.
* Step 5: LLM selects the desired link.

This introduces cumulative network latency across multi-turn reasoning loops, burns model tokens on repeated DOM dumps, and creates multiple separate opportunities for reasoning failures or DOM selector breakdowns.

---

## 2. Why Naive Workarounds Fail

1. **Brute-Force Prompt Chaining:**
   * Each turn incurs LLM network roundtrips, context token reprocessing, and vision screenshot encoding overhead.
2. **Fragile Exact CSS Selectors:**
   * Modern single-page applications (YouTube, Google, React/Vue portals) change element class names and IDs on every build. Hardcoded `#search-box` queries break frequently.

---

## 3. The Architecture

We replaced the 5-turn loop with an Atomic Client-Side Intent Macro (`searchAndSelect`):

1. **Single High-Level Intent:** The LLM issues one atomic instruction: `search_and_select(query, index: 0)`.
2. **Platform-Aware Heuristic Tree:** The client-side runtime automatically determines target platform inputs (YouTube search box, Google query bar, standard form inputs).
3. **Geometric Visibility Filtering:** Queries candidates with prioritized fallback selectors and filters them via `getBoundingClientRect()` and `offsetParent !== null` to guarantee element visibility before interaction.
4. **Single-Evaluation Execution:** In a single browser evaluation tick, the query is typed, dispatched via `requestSubmit()`, scrolled into viewport center, and clicked deterministically.

---

## 4. Behavior Comparison

| Approach | LLM Interaction | Execution Model | Failure Surface |
|---|---|---|---|
| Standard N-Turn Agent | Multi-turn reasoning loops | Serial roundtrips per sub-action | Multiple LLM reasoning failure points |
| Vision Coordinate Agent | Multi-turn coordinate inference | Screenshot encoding and coordinate mapping | Screen resolution and coordinate drift |
| **Atomic Intent Macro** | **Single atomic intent turn** | **Client-side heuristic DOM execution** | **Deterministic DOM fallbacks** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._
