const SENSITIVE_PARAM = /(?:token|secret|password|passwd|api[_-]?key|access[_-]?key|signature|auth|session|code)/i;

function normalizeRenderedLinks(values, baseUrl, limit = 500) {
    const links = [], seen = new Set();
    for (const val of values) {
        try {
            const parsed = new URL(val, baseUrl);
            if (!['http:', 'https:'].includes(parsed.protocol)) continue;
            // Strip any dynamic search parameters containing credential tokens
            if ([...parsed.searchParams.keys()].some((name) => SENSITIVE_PARAM.test(name))) continue;
            const normalized = normalizePageUrl(parsed.toString());
            if (!seen.has(normalized)) {
                seen.add(normalized);
                links.push(normalized);
            }
        } catch { continue; }
    }
    return links;
}