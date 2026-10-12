// 1. Cycle prevention and user cleanup execution
if (!active || running) return;
running = true;
if (cleanup) {
  const previousCleanup = cleanup;
  cleanup = undefined;
  previousCleanup();
}

// 2. Dynamic dependency pruning: clear stale signal subscriptions before re-run
if ((effectFn as any).dependencies) {
  for (const subscribers of (effectFn as any).dependencies) {
    subscribers.delete(effectFn);
  }
  (effectFn as any).dependencies.clear();
}

// 3. Re-record active subscriptions during execution
const previousEffect = activeEffect;
setActiveEffect(effectFn);
try {
  const result = fn();
  cleanup = typeof result === 'function' ? result : undefined;
} finally {
  setActiveEffect(previousEffect);
  running = false;
}
