// 1. Strict ban on --no-sandbox bypass
if (truthy(env.CHROME_NO_SANDBOX)) {
    throw new Error('WORKER_SANDBOX_REQUIRED: CHROME_NO_SANDBOX is forbidden.');
}

// 2. Validate root ownership and setuid bit on helper binary
const helper = await fsImpl.stat('/usr/lib/chromium/chrome-sandbox');
if (helper.uid !== 0 || (helper.mode & 0o4000) !== 0o4000) {
    throw new Error('WORKER_SANDBOX_UNAVAILABLE: chrome-sandbox not root setuid.');
}

// 3. Launch headless probe without bypass flags; non-zero exit crashes worker
await probeChromiumSandbox(executable);

// 4. Assert worker secret boundary (fail boot if API/auth secrets leaked)
const leaked = FORBIDDEN_WORKER_SECRETS.filter((name) => String(env[name] || '').length > 0);
if (leaked.length) {
    throw new Error('WORKER_SECRET_BOUNDARY_VIOLATION: leaked ' + leaked.join(', '));
}