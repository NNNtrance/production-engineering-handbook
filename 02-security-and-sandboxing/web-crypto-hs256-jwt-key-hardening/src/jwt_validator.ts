const MIN_SECRET_BYTES = 32;

function encodeSecret(secret: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(secret);
  if (encoded.byteLength < MIN_SECRET_BYTES) {
    throw new RangeError(
      `JWT secret must be at least ${MIN_SECRET_BYTES} UTF-8 bytes`
    );
  }
  const copy = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(copy).set(encoded);
  return copy;
}

export async function verifyJWT(
  token: string,
  secret: string,
  options: JwtVerifyOptions = {}
): Promise<JwtPayload | null> {
  const secretBytes = encodeSecret(secret);
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJson(encodedHeader);
  // 1. Strict algorithm check: prevent alg:none & asymmetric confusion
  if (!isPlainObject(header) || header.alg !== 'HS256' || header.typ !== 'JWT') {
    return null;
  }

  const signature = base64UrlDecode(encodedSignature);
  if (!signature) return null;

  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  // 2. Constant-time signature verification in Web Crypto
  const valid = await globalThis.crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    encoder.encode(`${encodedHeader}.${encodedPayload}`)
  );
  if (!valid) return null;

  const payload = decodeJson(encodedPayload) as JwtPayload;
  // 3. Clock tolerance & claim boundaries
  const now = Math.floor(Date.now() / 1000);
  const tolerance = options.clockToleranceSeconds ?? 0;
  if (payload.exp !== undefined && payload.exp <= now - tolerance) return null;
  return payload;
}