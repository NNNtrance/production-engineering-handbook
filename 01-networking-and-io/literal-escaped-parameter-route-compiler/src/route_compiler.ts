// 1. Literal regex metacharacter escaping pass
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 2. Compiling [param] paths into safe regular expressions
function compileRoutePath(path: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const parameterPattern = /\[([^\]]+)\]/g;
  let regexPath = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = parameterPattern.exec(path)) !== null) {
    regexPath += escapeRegex(path.slice(cursor, match.index));
    regexPath += '([^/]+)';
    paramNames.push(match[1]);
    cursor = match.index + match[0].length;
  }

  regexPath += escapeRegex(path.slice(cursor));
  return { regex: new RegExp(`^${regexPath}$`), paramNames };
}
