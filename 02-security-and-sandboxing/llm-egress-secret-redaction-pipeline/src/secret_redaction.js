// 1. Frozen cryptographic and credential token matching patterns
export const SECRET_PATTERNS = Object.freeze([
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gi, '[redacted-private-key]'],
    [/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [redacted]'],
    [/\bsk-or-v1-[A-Za-z0-9_-]{16,}\b/gi, '[redacted-secret]'],
    [/\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{8,}\b/gi, '[redacted-secret]'],
    [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, '[redacted-jwt]'],
    [/(\b(?:https?|postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/)[^\s/@:]+(?::[^\s/@]*)?@/gi, '$1[redacted]@']
]);

// 2. Multi-stage sanitization pipeline stripping null-bytes and clamping length
export function redactText(value, { maxLength = 4_000 } = {}) {
    let text = String(value ?? '').replace(/\0/g, '').slice(0, maxLength);
    for (const [pattern, replacement] of SECRET_PATTERNS) text = text.replace(pattern, replacement);
    return text.trim();
}
