// 1. Depth-balanced expression end scanning handling nested curly braces and quotes
function findExpressionEnd(source: string, start: number): number {
  let depth = 0;
  let quote = '';
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote && source[index - 1] !== '\\') quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') quote = char;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

// 2. Sticky regex (/gy) attribute scanner eliminating catastrophic regex backtracking
function parseAttributes(source: string, filename: string) {
  const attributes: Record<string, string> = {};
  const events: Record<string, string> = {};
  const bindings: Record<string, string> = {};
  const expr = /\s*([@:])?([A-Za-z_][\w:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/gy;
  let cursor = 0;

  while (cursor < source.length) {
    expr.lastIndex = cursor;
    const match = expr.exec(source);
    if (!match) break;
    cursor = expr.lastIndex;
    const [_, prefix, name, v1, v2] = match;
    const value = v1 ?? v2 ?? '';
    if (prefix === '@') events[name] = value;
    else if (prefix === ':') bindings[name] = value;
    else attributes[name] = value;
  }
  return { attributes, events, bindings };
}
