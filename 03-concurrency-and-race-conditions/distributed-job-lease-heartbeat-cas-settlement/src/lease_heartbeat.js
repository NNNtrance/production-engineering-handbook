// Active heartbeat loop renewing execution lease every leaseMs / 3
function startExecutionLeaseHeartbeat(store, jobKey, claim, leaseMs, logger) {
    if (!claim?.leaseToken) return null;
    const duration = Math.max(1_000, Number(leaseMs) || 120_000);
    const timer = setInterval(() => {
        void Promise.resolve(store.renewExecutionResultLease(jobKey, {
            owner: claim.leaseOwner,
            leaseToken: claim.leaseToken,
            leaseMs: duration
        })).then((renewed) => {
            if (!renewed) logger?.warn('Execution lease lost; worker stale', { jobKey });
        });
    }, Math.floor(duration / 3));
    timer.unref?.();
    return timer;
}