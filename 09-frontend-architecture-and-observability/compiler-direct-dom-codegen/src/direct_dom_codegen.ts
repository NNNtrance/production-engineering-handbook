// 1. Compiling static elements into direct DOM creation operations
const el = createElement('ul');
setAttribute(el, 'data-fluxdom', scopeHash);
addEventListener(el, 'click', handleClick);

// 2. Compiling dynamic bindings into targeted fine-grained effects
createEffect(() => {
  setAttribute(el, 'class', __active() ? 'on' : 'off');
});

// 3. Compiling reactive text interpolation directly to Text node mutations
const expr = createText('');
createEffect(() => {
  setText(expr, String(__count()));
});
insert(el, expr);
