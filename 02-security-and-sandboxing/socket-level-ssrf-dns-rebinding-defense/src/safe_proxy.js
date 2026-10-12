// Upstream socket connects directly to validated IP, eliminating DNS Rebinding.
const target = await validatePublicHost(hostname, port, {
    allowedPorts: this.allowedPorts,
    lookup: this.lookup
});

// Connect to verified target.address (IP), NOT hostname (prevents TOCTOU)
const upstream = net.connect({ host: target.address, port, family: target.family });
this.sockets.add(upstream);
upstream.setTimeout(this.connectTimeoutMs, () => upstream.destroy(new Error('Timeout')));

upstream.once('connect', () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    clientSocket.pipe(upstream);
    upstream.pipe(clientSocket);
});

// Real-time byte counters destroy socket if quota is exceeded
upstream.on('data', (chunk) => {
    connectionBytes += chunk.length;
    this.totalBytes += chunk.length;
    if (connectionBytes > this.maxResponseBytes || this.totalBytes > this.maxTotalBytes) {
        upstream.destroy(new Error('Proxy response limit exceeded'));
        clientSocket.destroy();
    }
});