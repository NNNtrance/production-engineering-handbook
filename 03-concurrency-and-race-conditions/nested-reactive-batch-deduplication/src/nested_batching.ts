// 1. Short-circuit identical writes using Object.is equality
const set = (newValue: T) => {
  if (!Object.is(value, newValue)) {
    value = newValue;
    if (batchDepth > 0) {
      subscribers.forEach(sub => batchedEffects.add(sub));
    } else {
      const effectsToRun = new Set(subscribers);
      effectsToRun.forEach(effect => effect());
    }
  }
};

// 2. Atomic nested batching with global depth counter
export function batch(fn: () => void) {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      const effectsToRun = new Set(batchedEffects);
      batchedEffects.clear();
      effectsToRun.forEach(effect => effect());
    }
  }
}
