// 1. Keyset pagination cursor encoding and strict decoding
function encodeCursor(value) {
    return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function decodeCursor(value) {
    if (!value) return null;
    if (typeof value !== 'string' || value.length > 512) {
        throw new AppError('The support pagination cursor is invalid.', { status: 400, code: 'SUPPORT_CURSOR_INVALID' });
    }
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    if (!decoded?.id || !Number.isFinite(Date.parse(decoded.at))) throw new Error('invalid');
    return { at: new Date(decoded.at).toISOString(), id: decoded.id };
}

// 2. Structured message context extraction scrubbing embedded credentials from URLs
try {
    const parsed = fields.targeturl ? new URL(fields.targeturl) : null;
    if (parsed && ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password) {
        targetUrl = parsed.toString();
    }
} catch { /* malformed context is ignored */ }
