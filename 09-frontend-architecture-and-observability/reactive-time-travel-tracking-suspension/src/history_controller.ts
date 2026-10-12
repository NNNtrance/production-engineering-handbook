export function withHistory<T extends StoreState>(
  store: Store<T>,
  options: HistoryOptions = {}
): HistoryController {
  const maxHistory = options.maxHistory ?? 50;
  const past: T[] = [];
  const future: T[] = [];
  let isTracking = true;

  // 1. Observe state mutations
  const stop = effect(() => {
    const current = cloneState(store.getRawState(), store.id);
    if (!isTracking || current === null) return;
    const previous = past[past.length - 1];
    if (previous && statesEqual(previous, current)) return;
    past.push(current);
    if (past.length > maxHistory) past.shift();
    future.length = 0; // Clear redo on new branch
  });

  // 2. Apply snapshot with tracking suspension
  const apply = (state: T) => {
    isTracking = false;
    try {
      batch(() => store.setRawState(state));
    } finally {
      isTracking = true;
    }
  };

  return {
    undo() {
      if (past.length <= 1) return false;
      const current = past.pop();
      if (!current) return false;
      future.push(current);
      apply(past[past.length - 1]);
      return true;
    },
    redo() {
      const next = future.pop();
      if (!next) return false;
      past.push(next);
      apply(next);
      return true;
    }
  };
}