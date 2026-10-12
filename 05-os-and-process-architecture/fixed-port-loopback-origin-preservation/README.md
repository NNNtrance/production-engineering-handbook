# Case Study 62: Fixed Loopback Port Reservation for Origin-Consistent Electron SPAs

## 1. The Engineering Constraint
1. **Web Storage Partitioning Across Launches:** In Electron desktop apps serving Next.js or React SPAs, using dynamic ephemeral ports (`server.listen(0)`) changes the web origin (`http://127.0.0.1:XXXXX`) on every boot, isolating and wiping user `localStorage`, `IndexedDB`, and offline video caches.
2. **File Protocol (`file://`) Security Limitations:** Loading exported SPAs via `file://` breaks HTML5 pushState routing, CORS for web workers, and WebAssembly video transcoding pipelines.
3. **Port Collisions on Multi-App Desktops:** Hardcoding a fixed port without fail-safe error handling crashes the desktop application if another process occupies the port.

## 2. Why Naive Workarounds Fail
1. **Random Port Ephemeral Servers:** Binding to port 0 generates a clean origin on every launch, forcing users to re-login and losing unsaved project state.
2. **Standard Custom Protocols (`app://`):** Electron custom protocol handlers lack native stream piping, causing performance degradation when streaming multi-gigabyte video assets.
3. **Unprotected Static Servers:** Listening on `0.0.0.0` exposes internal application files and APIs to other devices on the local Wi-Fi network.

## 3. The Architecture
1. **Fixed Dedicated Production Port (`PRODUCTION_PORT = 38450`):** Binds strictly to `127.0.0.1:38450`, ensuring that the origin `http://127.0.0.1:38450` remains identical across every application session, preserving `IndexedDB` and `localStorage`.
2. **Graceful `EADDRINUSE` Fallback:** Hooks `staticServer.once('error')` to dynamically fall back to an ephemeral port if another instance is already running, preventing crashes.
3. **Surgical SPA Path Resolution:** Inspects requested URL paths and automatically resolves extensionless routes to `.html` or fallback `index.html`.

## 4. Benchmarks & Validation
| Electron SPA Serving Strategy | IndexedDB / Storage Persistence | Multi-Gigabyte Stream Performance | LAN Attack Surface |
|---|---|---|---|
| Ephemeral Port (`listen(0)`) | Wiped Every Reboot (New Origin) | High | Zero (127.0.0.1) |
| `file://` Protocol | Restricted (CORS / Workers Blocked) | Low (No HTTP Range Streams) | High (File Access) |
| **Fixed Loopback Port (38450)** | **100% Persistent Origin Retention** | **High (Native HTTP Streaming)** | **Zero (Strict 127.0.0.1 Loopback)** |

## 5. Implementation
See production-grade implementation in [`src/loopback_server.ts`](./src/loopback_server.ts).
