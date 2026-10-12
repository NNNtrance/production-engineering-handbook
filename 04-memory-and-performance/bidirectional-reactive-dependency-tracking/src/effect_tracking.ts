export interface ReactiveEffect {
  (): void;
  deps: Set<Set<ReactiveEffect>>;
  active: boolean;
  running: boolean;
}

export function effect(fn: EffectFn): EffectCleanup {
  let userCleanup: EffectCleanup | undefined;

  const runner: ReactiveEffect = () => {
    // 1. Guard against recursive self-invocation cycles
    if (!runner.active || runner.running) return;
    runner.running = true;

    try {
      if (userCleanup) {
        userCleanup();
        userCleanup = undefined;
      }
      // 2. Dynamic dependency pruning: clear stale links
      for (const dependency of runner.deps) {
        dependency.delete(runner);
      }
      runner.deps.clear();

      effectStack.push(runner);
      activeEffect = runner;
      try {
        const result = fn();
        if (typeof result === 'function') userCleanup = result as EffectCleanup;
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1] ?? null;
      }
    } finally {
      runner.running = false;
    }
  };

  runner.deps = new Set();
  runner.active = true;
  runner.running = false;
  runner();
  return () => { runner.active = false; };
}