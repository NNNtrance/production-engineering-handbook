// Merkle tree hashing comparing source vs live container files
async function compareManifests(source, runtime) {
    const sourceMap = new Map(source.map((entry) => [entry.path, entry]));
    const runtimeMap = new Map(runtime.map((entry) => [entry.path, entry]));
    const mismatches = [];

    for (const [relative, sourceEntry] of sourceMap) {
        const runtimeEntry = runtimeMap.get(relative);
        if (!runtimeEntry) mismatches.push({ path: relative, status: 'missing-in-runtime' });
        else if (runtimeEntry.sha256 !== sourceEntry.sha256 || runtimeEntry.bytes !== sourceEntry.bytes) {
            mismatches.push({ path: relative, status: 'hash-mismatch', source: sourceEntry, runtime: runtimeEntry });
        }
    }
    for (const [relative, runtimeEntry] of runtimeMap) {
        if (!sourceMap.has(relative)) mismatches.push({ path: relative, status: 'runtime-only', runtime: runtimeEntry });
    }
    return mismatches.sort((left, right) => left.path.localeCompare(right.path));
}