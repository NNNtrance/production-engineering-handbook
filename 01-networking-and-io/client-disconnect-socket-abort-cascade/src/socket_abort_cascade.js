// 1. Hooking TCP socket abort and response close to AbortController
function requestController(request, response) {
    const controller = new AbortController();
    const cancel = () => {
        if (!response.writableEnded && !controller.signal.aborted) {
            controller.abort(new AppError('The client disconnected.', {
                status: 499,
                code: 'CLIENT_DISCONNECTED'
            }));
        }
    };
    request.once('aborted', cancel);
    response.once('close', cancel);
    return {
        signal: controller.signal,
        cleanup() {
            request.off('aborted', cancel);
            response.off('close', cancel);
        }
    };
}

// 2. Splicing queued jobs immediately upon client disconnection
job.onAbort = () => {
    const index = this.queue.indexOf(job);
    if (index >= 0) this.queue.splice(index, 1);
    reject(signal.reason || this.abortError());
};
signal?.addEventListener('abort', job.onAbort, { once: true });
