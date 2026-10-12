// 1. Extract resource transfer and encoded body metrics directly from browser memory
const resources = performance.getEntriesByType('resource').map((entry) => ({
    name: entry.name,
    bytes: entry.transferSize || entry.encodedBodySize || 0
}));

// 2. Compute third-party byte distribution against page origin
const origin = location.origin;
let thirdPartyBytes = 0;
for (const resource of resources) {
    try {
        if (new URL(resource.name).origin !== origin) thirdPartyBytes += resource.bytes;
    } catch { /* ignore invalid browser entries */ }
}
