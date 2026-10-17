import crypto from 'node:crypto';

export class AppError extends Error {
    constructor(message, { status = 500, code = 'INTERNAL_ERROR' } = {}) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

// 1. Recursive deterministic JSON object key sorting
export function canonicalize(value) {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(canonicalize);
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

// 2. Cryptographic payload fingerprint calculation
export function operationFingerprint(value) {
    return crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
}

// 3. Fail-closed replay verification preventing key reuse for mutated payloads
export function assertIdempotentReplay(existingFingerprint, requestedFingerprint) {
    if (existingFingerprint && requestedFingerprint && existingFingerprint !== requestedFingerprint) {
        throw new AppError('The idempotency key was already used for a different request.', {
            status: 409,
            code: 'IDEMPOTENCY_KEY_REUSED'
        });
    }
}
