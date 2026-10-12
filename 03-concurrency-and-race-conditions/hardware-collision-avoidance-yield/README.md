# Case Study 03: Hardware Collision Avoidance & Yield Lock

> **Domain:** Concurrency & Race Conditions  
> **Source Project:** `llm-conductor` (Desktop Native Core)  
> **Language:** TypeScript / Injected Runtime Script  
> **Dependencies:** `0` (Native DOM Events)  
> **Key Metric:** `0ms` input race conditions, seamless human-agent coordination

---

## 1. The Constraint

In co-pilot browser automation, an AI agent and a human user share access to the same active browser window. 

If the agent dispatches synthetic CDP mouse events (`Input.dispatchMouseEvent`) while the user simultaneously moves their physical mouse, coordinate race conditions occur: the agent clicks shifted coordinates, form inputs lose focus, and unintended buttons are triggered.

---

## 2. Why Naive Workarounds Fail

1. **Locking User Peripherals:**
   * Blocking OS-level input while the AI navigates destroys ergonomics and violates basic user agency.
2. **Modal Overlays:**
   * Dimming the screen with "AI is running, please wait" prevents the human from interacting when the AI gets stuck.

---

## 3. The Architecture

We engineered a passive, zero-cost Hardware Yield Protocol:

1. **Passive Event Traps:** We register `{ passive: true }` listeners for `mousemove`, `mousedown`, `keydown`, and `wheel`. Passive listeners never block the main thread.
2. **Intervention State:** When physical input is detected, `window.__humanIntervening` is asserted immediately.
3. **Adaptive Debounce:** An 1800ms debounce window prevents flickering and yields control to the human.
4. **Autonomous Yield Loop:** The agent execution engine awaits `waitForHumanYield()` prior to any CDP dispatch, cleanly yielding CPU time slices until the user releases the controls.
