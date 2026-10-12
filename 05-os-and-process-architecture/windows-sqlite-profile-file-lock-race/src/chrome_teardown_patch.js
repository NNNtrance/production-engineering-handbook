// Monkey-patching chromeLauncher.destroyTmp to prevent fatal EBUSY crash on Windows
async function killChrome(chrome) {
    if (!chrome) return;
    if (typeof chrome.destroyTmp === 'function') {
        const destroyTmp = chrome.destroyTmp;
        chrome.destroyTmp = () => {
            try { destroyTmp.call(chrome); }
            catch { /* chrome-launcher races locked Windows SQLite profile caches */ }
        };
    }
    try {
        await chrome.kill();
    } catch {
        // chrome-launcher can throw synchronously while cleaning temporary profiles
        // on Windows even after the Chrome process has exited.
    }
}
