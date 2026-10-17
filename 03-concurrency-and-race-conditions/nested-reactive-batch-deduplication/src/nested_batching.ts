// Minimal createSignal/createEffect harness added for tests; batch() and the Object.is short-circuit are the original FluxDOM logic.
type Subscriber = () => void;

let batchDepth = 0;
const batchedEffects = new Set<Subscriber>();
let activeEffect: Subscriber | null = null;

export function createSignal<T>(initialValue: T): [() => T, (newValue: T) => void] {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();

  const get = () => {
    if (activeEffect) {
      subscribers.add(activeEffect);
    }
    return value;
  };

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

  return [get, set];
}

export function createEffect(fn: Subscriber): void {
  const effect = () => {
    activeEffect = effect;
    try {
      fn();
    } finally {
      activeEffect = null;
    }
  };
  effect();
}

// 2. Atomic nested batching with global depth counter
export function batch(fn: () => void): void {
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
