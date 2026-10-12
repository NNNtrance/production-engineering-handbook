function verifyPaddleSignature(rawBody, signatureHeader, secret, { now = () => Date.now(), toleranceSeconds = 5 } = {}) {
    const { timestamp, signatures } = parseSignatureHeader(signatureHeader);
    const currentSeconds = Math.floor(now() / 1000);

    // Strict 5-second replay tolerance fence
    if (!timestamp || signatures.length === 0 || Math.abs(currentSeconds - timestamp) > toleranceSeconds) {
        throw new AppError('Expired or invalid webhook timestamp.', { status: 400, code: 'INVALID_SIGNATURE' });
    }

    // Prevent byte-by-byte timing attacks on HMAC hex digest
    const expected = crypto.createHmac('sha256', secret).update(timestamp + ':' + rawBody).digest('hex');
    const isValid = signatures.some((sig) => {
        const a = Buffer.from(sig, 'hex'), b = Buffer.from(expected, 'hex');
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
    if (!isValid) throw new AppError('Invalid webhook signature.', { status: 400 });
}