// 1. Strict AST validation rejecting dynamic expressions and event handlers
function renderStaticNode(node: TemplateNode): string {
  if (node.type === 'Text') return escapeHtml(node.content);
  if (node.type === 'Expression' || node.type === 'IfBlock' || node.type === 'EachBlock') {
    throw new Error(`Static SSR cannot evaluate ${node.type}; render this component on the client`);
  }
  if (Object.keys(node.bindings).length > 0 || Object.keys(node.events).length > 0) {
    throw new Error('Static SSR cannot preserve bindings or events; render this component on the client');
  }

  const attributes = Object.entries(node.attributes)
    .map(([key, value]) => ` ${key}="${escapeAttribute(value)}"`)
    .join('');
  if (VOID_ELEMENTS.has(node.tag)) return `<${node.tag}${attributes}>`;
  return `<${node.tag}${attributes}>${node.children.map(renderStaticNode).join('')}</${node.tag}>`;
}

// 2. Safe client mount point fallback preventing server process crashes
export function renderToString(source: string): StaticRenderResult {
  const component = parse(source);
  const analysis = analyze(component);
  if (analysis.strategy !== 'SSG') {
    return { html: '<div id="app" data-flow-client-render></div>', rendered: false };
  }
  return { html: renderStaticComponent(component), rendered: true };
}
