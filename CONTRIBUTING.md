# Contributing to Production Engineering Handbook

Thank you for your interest in contributing to the **Production Engineering Handbook**! 

This repository is a curated, domain-driven cookbook of real-world systems engineering solutions, non-trivial architectural decisions, and zero-slop implementations extracted from active production codebases.

To maintain the highest engineering standards and ensure newly submitted problems blend seamlessly alongside the existing 67 case studies, all contributions must strictly follow this guide.

---

## 🎯 1. The Quality Bar (What Gets Accepted)

### ✅ What We Look For
1. **Hard Systems Constraints:** Edge cases in low-level runtimes, compiler ASTs, real-time audio DSP, socket-level security, database concurrency races, or distributed consensus.
2. **Post-Mortem Root Cause Analysis:** Explaining *why* standard approaches failed (e.g. why DNS rebinding bypasses URL checks, why biquad filter swaps cause audio pops, why VDOM diffing allocates ephemeral VNodes).
3. **Pragmatic, Zero-Slop Architecture:** Solutions implemented with minimal abstraction overhead, following the pragmatic principles of Andrej Karpathy and John Carmack.
4. **Concrete Benchmarks:** Mathematical proofs, timing benchmarks, memory profiles, or test suites proving the fix.

### ❌ What Will Be Rejected
* Generic tutorial code ("How to create a REST API", "How to use React hooks", "How to connect to PostgreSQL").
* AI-slop essays with generic bullet points and superficial advice.
* Solutions that pull bloated third-party libraries when a concise native primitive exists.
* Marketing content or vendor-promoted pitches.

---

## 📁 2. Directory & File Hierarchy Standard

Every new case study must live inside one of the 9 domain directories and follow this exact layout:

```
<domain-category>/<kebab-case-slug>/
├── README.md           # 5-section technical breakdown
├── src/                # Self-contained runnable or verifiable source code
│   └── <source-file>   # e.g., buffer_swap.rs, jwt_engine.ts, route_compiler.ts
└── assets/
    └── code-card.png   # 1000x750 authentic VS Code editor crop
```

### Domain Directory Categories
* `01-networking-and-io/` — Sockets, HTTP framing, TCP/UDP streams, real-time protocols
* `02-security-and-sandboxing/` — Sandboxing, SSRF, seccomp, WebAuthn, envelope encryption, JWT
* `03-concurrency-and-race-conditions/` — Advisory locks, mutexes, atomic CAS, queue invariants
* `04-memory-and-performance/` — Zero-copy parsing, RAM caches, GC mitigation, DSP smoothing
* `05-os-and-process-architecture/` — Subprocesses, IPC windowing, SQLite file locks, DPAPI
* `06-autonomous-agents-and-automation/` — Intent macros, synthetic sandbox boundaries, DOM geometry
* `07-fintech-and-billing-invariants/` — Partial unique indexes, timing-safe webhooks, append-only triggers
* `08-devops-and-disaster-recovery/` — Automated DB restore verification, Merkle trees, CI/CD permission isolation
* `09-frontend-architecture-and-observability/` — Compilers, reactive stores, AST transforms, time-travel history

---

## 📝 3. Strict 5-Section `README.md` Specification

Your case study's `README.md` must adhere strictly to these 5 sections:

```markdown
# Case Study: <Concise Technical Problem Title>

## 1. The Engineering Constraint
Explain the hard technical problem, edge cases, and real-world failure mode under production load. Use numbered lists.

## 2. Why Naive Workarounds Fail
Analyze why common high-level developer workarounds break (e.g. timeout races, memory leaks, unhandled exceptions, security vulnerabilities).

## 3. The Architecture
Detail the low-level architectural fix with code snippets, algorithms, and invariant guarantees.

## 4. Benchmarks & Validation
Provide a comparative Markdown table comparing the naive approach vs your production architecture across latency, memory, reliability, and security metrics.

## 5. Implementation
Link directly to the runnable source code in `src/`:
See production-grade implementation in [`src/<file-name>`](./src/<file-name>).
```

---

## 🎨 4. Code Card Visual Standard (`code-card.png`)

Every case study must include a visual code snapshot in `assets/code-card.png`:
* **Resolution:** 1000 x 750 pixels.
* **Style:** Authentic, raw VS Code editor crop (NO macOS window drop shadows or traffic lights).
* **Font:** Consolas, Menlo, or JetBrains Mono (12.5px font size, 1.48 line-height).
* **Palette:** GitHub Dark (`#0d1117` background, `#161b22` editor surface, `#30363d` border).
* **Components:**
  * Top tab bar showing file path and Case ID badge.
  * Line numbers column on the left (`#484f58`).
  * Syntax highlighted code snippet focused on the core architectural mechanism.
  * Bottom status bar showing architecture badge and UTF-8 encoding.

---

## 🚀 5. Pull Request & Review Process

1. **Fork the Repository:** Create a feature branch (`git checkout -b case/my-problem-slug`).
2. **Build Your Directory:** Add your case under the appropriate domain category following the structure above.
3. **Update Root Index:** Add your problem to:
   - The Quick Problem Index at the top of the root `README.md`.
   - The detailed domain section in the root `README.md` with problem summary, fix, and metrics.
4. **Submit a Pull Request:**
   - PR Title format: `feat: add <problem-name> case study to <category>`
   - In your PR description, explain the production environment where this problem occurred and why it is significant.
5. **Review & Revision:** We review every PR collaboratively. If revisions are requested, address feedback on your branch. Once approved, your case study will be merged into the handbook!

Thank you for contributing to open engineering knowledge!
