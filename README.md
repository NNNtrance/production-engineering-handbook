# Real-World Engineering Case Studies

A curated, domain-driven collection of production engineering challenges, non-trivial architectural decisions, and zero-slop systems implementations extracted from active codebases.

---

## 📌 Architecture & Taxonomy

Instead of grouping solutions by ephemeral project names, case studies are organized by **engineering domain**. Each study contains isolated code, performance benchmarks, and a deep architectural post-mortem.

```
.
├── 01-networking-and-io/              # Socket framing, protocol engines, raw I/O
├── 02-security-and-sandboxing/        # Mid-flight request pause, memory isolation, sandbox guards
├── 03-concurrency-and-race-conditions/# Threading, hardware-event locks, backpressure
├── 04-memory-and-performance/         # Zero-copy parsing, RAM reverse-scraping, GC mitigation
└── 05-os-and-process-architecture/    # Subprocess lifecycle, SQLite file-lock bypasses, DPAPI
```

---

## 📚 Case Studies Index

| # | Domain | Case Study | Key Metric / Highlight | Source Reference |
|---|---|---|---|---|
| `01` | **Networking & I/O** | [Raw TCP CDP Handshake](./01-networking-and-io/raw-tcp-cdp-handshake) | `0.7ms` latency, zero dependencies, PNA/CORS bypass | `llm-conductor` native engine |
| `02` | **Security & Sandboxing** | *Mid-Flight Mutating Request Guard* | In-flight CDP pause for destructive HTTP verbs | `llm-conductor` browser harness |
| `03` | **Concurrency** | *Hardware Collision Avoidance Yield* | 0-overhead passive mouse/keyboard yield lock | `llm-conductor` desktop agent |
| `04` | **Memory & Perf** | *RAM-Level Network Reverse Scraping* | 0 prompt tokens, sub-10ms JSON extraction | `llm-conductor` CDP pipeline |
| `05` | **OS & Process** | *Chrome SQLite Shadow Profile Sync* | Non-destructive profile clone, DPAPI bypass | `llm-conductor` desktop core |

---

## 🛠 Case Study Standards

Each case study directory follows a strict layout:
* `README.md` — Deep technical breakdown: *The Constraint*, *Why Naive Workarounds Fail*, *The Architecture*, and *Metrics*.
* `src/` — Self-contained, runnable or verifiable code.
* `assets/code-card.png` — High-DPI, pixel-perfect VS Code dark mode snippet.
* `post.md` — Publication-ready copy for X (280-char Carmack/Karpathy format) and LinkedIn.
