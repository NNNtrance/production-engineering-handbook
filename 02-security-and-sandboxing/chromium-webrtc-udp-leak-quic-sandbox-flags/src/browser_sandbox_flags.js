// Hardened Chromium sandbox launch flags enforcing all egress traffic through audit proxies
function chromeFlags(proxyUrl, config = {}) {
    const flags = [
        '--headless=new',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-quic', // Prevents UDP HTTP/3 from bypassing TCP inspection proxy
        '--disable-sync',
        '--dns-prefetch-disable',
        '--force-webrtc-ip-handling-policy=disable_non_proxied_udp', // Blocks WebRTC host IP leaks
        '--metrics-recording-only',
        '--no-default-browser-check',
        '--no-first-run',
        `--proxy-server=${proxyUrl}`,
        '--proxy-bypass-list=<-loopback>' // Prevents bypass for loopback and LAN endpoints
    ];
    if (config.chromeNoSandbox) flags.push('--no-sandbox', '--disable-setuid-sandbox');
    return flags;
}
