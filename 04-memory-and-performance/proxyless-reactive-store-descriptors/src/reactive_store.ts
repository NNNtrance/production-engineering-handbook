// 1. Setup fine-grained signals for each store state key
for (const key in initialState) {
  const [get, set] = createSignal(initialState[key]);
  stateSignals[key] = [get, set];
  storeInstance[key] = get;

  const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
  storeInstance[`set${capitalizedKey}`] = (val: any) => {
    set(val);
    if (config.persist) persistState.save(config.name, getStoreSnapshot(), config.persist);
  };
}

// 2. Bind action execution contexts with dynamic property descriptors
if (config.actions) {
  const context: any = {};
  for (const key in initialState) {
    Object.defineProperty(context, key, {
      get: () => stateSignals[key][0](),
      set: (val) => storeInstance[`set${key.charAt(0).toUpperCase() + key.slice(1)}`](val),
    });
  }

  for (const actionName in config.actions) {
    storeInstance[actionName] = (...args: any[]) => {
      return config.actions![actionName].apply(context, args);
    };
  }
}
