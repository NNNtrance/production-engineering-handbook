# Systems Engineering Case Study: Bracket-Balanced Single File Component Lexing with Sticky Attribute Scanning

---

## 1. Problem

Single File Component (SFC) compilers must parse templates containing complex JavaScript expressions (`{items.map(x => ({ val: x }))}`), nested quotes inside HTML attributes (`data-label="a > b"`), and structural directives (`{#if}`, `{#each}`). Naive regular expression parsers break on nested braces, truncate attributes at unescaped greater-than symbols, or suffer from catastrophic regex backtracking (ReDoS).

---

## 2. Why Naive Approaches Fail

1. **Regex Greedy Attribute Matching:**
   * `/<[^>]+>/` terminates prematurely on `data-condition="a > b"`, splitting HTML tags in half.
2. **Regex Expression Truncation:**
   * `/\{([^\}]+)\}/` stops at the first closing curly brace, mangling object literals inside expressions (`{ { a: 1 } }`).
3. **Catastrophic Backtracking (ReDoS):**
   * Unbounded whitespace repetitions in attribute regexes crash build workers when parsing long SVG paths or multi-line attributes.

---

## 3. Architecture

1. **Depth-Balanced Expression Scanner:** `findExpressionEnd()` maintains an integer depth counter (`depth += 1 / depth -= 1`) while tracking string quotation boundaries (`"`, `'`, `` ` ``). It returns only when `depth === 0` outside any string literal.
2. **Sticky Attribute Scanning (`/gy`):** Uses the sticky `y` regex flag with explicit `lastIndex = cursor`. Matches advance contiguously across source characters in O(N) time without catastrophic regex backtracking.
3. **Structured Directive Separation:** Automatically classifies attributes by prefix:
   * `@event` -> Event handlers (`@click="save"`).
   * `:binding` -> Reactive bindings (`:class="active"`).
   * Plain attributes -> Static HTML attributes.
4. **HTML Void Tag Invariance:** Tracks standard void elements (`img`, `br`, `input`, `hr`) to prevent unclosed tag validation errors on self-closing HTML.

```typescript
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
```

---

## 4. Behavior Comparison

| Template Lexing Engine | Nested Braces `{ { a: 1 } }` | Nested Quotes `"a > b"` | Backtracking Complexity |
|---|---|---|---|
| Naive Regex Split | Fails (Truncates at First `}`) | Fails (Splits Tag) | O(2^N) Vulnerable |
| Heavy Babel/HTML5 Parser | Supported | Supported | Heavy C++ / WASM Dependency |
| **Depth-Balanced Sticky Parser** | **Preserved without truncation** | **Handled without premature tag split** | **Linear scan (O(N))** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._

---

## 5. Implementation

See implementation in [`src/sfc_parser.ts`](./src/sfc_parser.ts).

---

## 6. Visual Representation

![Visual Architecture Card](./assets/code-card.png)
