// 1. Static inspection of script and template AST for reactivity markers
const signals = detectSignals(scriptContent);
const hasAsync = /await\s|fetch\(/.test(scriptContent);
const hasSideEffects = /window\.|document\.|localStorage/.test(scriptContent);

for (const node of component.template?.children ?? []) {
  analyzeTemplateNode(node, templateAnalysis);
}

// 2. Deterministic rendering strategy classification
let strategy: RenderStrategy = 'SSG';
if (hasSideEffects || templateAnalysis.hasEvents) {
  strategy = 'CSR';
} else if (
  hasAsync ||
  signals.size > 0 ||
  templateAnalysis.hasBindings ||
  templateAnalysis.hasDirectives ||
  templateAnalysis.hasExpressions
) {
  strategy = 'SSR';
}
