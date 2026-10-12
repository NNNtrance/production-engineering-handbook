// 1. Inspect raw buffer bytes for shebang lines and Windows CRLF carriage returns
function isShellScript(relativePath, bytes) {
    if (relativePath.endsWith('.sh')) return true;
    const newline = bytes.indexOf(0x0a);
    const firstLine = bytes.subarray(0, newline === -1 ? Math.min(bytes.length, 512) : newline).toString('utf8').replace(/\r$/, '');
    return /^#!.*(?:\/|env\s+)(?:ba|da|a|k|z)?sh(?:\s|$)/.test(firstLine);
}

// 2. Automated test asserting zero carriage return bytes (0x0d) across all tracked shell files
test('tracked Linux shell scripts use LF-only bytes and explicit Git attributes', () => {
    const scripts = trackedShellScripts();
    const carriageReturns = scripts.filter(({ bytes }) => bytes.includes(0x0d)).map(({ relativePath }) => relativePath);
    assert.deepEqual(carriageReturns, [], `carriage-return bytes found in: ${carriageReturns.join(', ')}`);

    const checkedAttributes = execFileSync('git', ['check-attr', 'eol', '--', ...scripts.map(s => s.relativePath)], { encoding: 'utf8' });
    assert.match(checkedAttributes, /: eol: lf$/m);
});
