# Case Study 57: Non-Reactive Undo/Redo Time-Travel Snapshotting with Tracking Suspension

## 1. The Engineering Constraint
1. **Infinite Undo Recursion:** In reactive stores, restoring a historical snapshot writes to reactive signals. These writes fire active effects, which push the restored state as a brand new forward action, immediately wiping the redo stack.
2. **Intermediate Micro-Render Thrashing:** Restoring an object with 20 properties triggers 20 distinct effect executions and DOM re-renders unless wrapped in an atomic batch.
3. **Unbounded Memory Retention:** Recording entire state snapshots on every keystroke without depth bounds causes continuous V8 heap memory growth.

## 2. Why Naive Workarounds Fail
1. **Unflagged State Restoration:** Treating undo operations identically to user actions destroys the historical past/future timeline.
2. **Unbatched Property Assignment:** Looping through properties and setting signals individually causes layout thrashing and intermediate broken states.
3. **Naive Reference Stacking:** Pushing object references without deep serialization clones mutates past snapshots when current state changes.

## 3. The Architecture
1. **Tracking Suspension Fence (`isTracking = false`):** Before applying a historical snapshot, history observation is suspended. The state update occurs inside a `batch()` block, guaranteeing a single atomic reflow, and tracking is restored in a `finally` clause.
2. **Bounded FIFO Stack (`maxHistory` Clamping):** Past states are clamped using `past.shift()`, keeping memory usage strictly O(1) regardless of session duration.
3. **State Equality Short-Circuiting:** Consecutive identical states are discarded via JSON serialization equality checks before stack pushing.

## 4. Behavior Comparison
| Time-Travel Architecture | Redo Stack Preservation | DOM Reflows per Undo | Memory Footprint |
|---|---|---|---|
| Unchecked Reactive Write | Corrupted (Redo Wiped) | N (Per Property Write) | Unbounded Growth |
| Manual Event Triggers | Fragile (Misses Writes) | 1 (If Batched) | Unbounded Growth |
| **Suspended Tracking + Batch** | **Preserved timeline (No redo wipe)** | **1 (Atomic microtask batch)** | **Bounded by configured maxHistory limit** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._

---

## 5. Implementation
See production-grade implementation in [`src/history_controller.ts`](./src/history_controller.ts).
