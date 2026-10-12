function createZapDistributedLock({ pool, namespace = 'wpa-zap-baseline', retryMs = 250, acquireTimeoutMs = 120_000 } = {}) {
    return {
        async acquire(signal) {
            const deadline = Date.now() + acquireTimeoutMs;
            while (Date.now() < deadline) {
                signal?.throwIfAborted();
                const client = await pool.connect();
                let held = false;
                try {
                    const result = await client.query('SELECT pg_try_advisory_lock(hashtext($1)) AS acquired', [namespace]);
                    held = result.rows[0]?.acquired === true || result.rows[0]?.acquired === 't';
                    if (held) {
                        let released = false;
                        return async () => {
                            if (released) return;
                            released = true;
                            await client.query('SELECT pg_advisory_unlock(hashtext($1))', [namespace]).catch(() => {});
                            client.release();
                        };
                    }
                } catch (cause) {
                    client.release();
                    throw new AppError('Lock unavailable.', { status: 503, cause });
                }
                if (!held) client.release();
                await new Promise((resolve) => setTimeout(resolve, retryMs));
            }
            throw new AppError('ZAP serialization busy.', { status: 429, code: 'ZAP_LOCK_TIMEOUT' });
        }
    };
}