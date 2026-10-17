# Case Study 23: Multi-Network Bridge Segmentation & Least-Privilege Isolation

> **Domain:** Security & Sandboxing  
> **Source Project:** `WebPageAnalyz (Container Topology)`  
> **Language:** Docker Compose / Linux Networks  
> **Key Metric:** 5 isolated Docker networks, iptables bridge separation, API air-gapped from analysis egress

---

## 1. The Constraint

Deploying microservices and background workers onto a single shared Docker bridge network allows compromised worker containers executing untrusted code to move laterally. An exploited browser worker can query internal database admin ports or harvest AI/payment credentials from adjacent microservices.

---

## 2. Why Naive Workarounds Fail

1. **Single Docker Bridge Network (`default`):**
   * Every container can reach every other container's open ports via internal DNS names, completely bypassing firewall isolation.
2. **Container Host Networking (`network_mode: host`):**
   * Exposes host loopback interfaces, cloud instance metadata, and adjacent local daemons to containerized processes.
3. **Bundling Credentials in API Workers:**
   * Placing Stripe secret keys, Resend email keys, and AI provider credentials in a shared `.env` allows any container compromise to leak all business credentials.

---

## 3. The Architecture

1. **5 Isolated Docker Bridge Networks:**
   * `app-internal` (internal: true): Connects Frontend, API, and isolated internal workers.
   * `data-internal` (internal: true): Connects API, Workers, and PostgreSQL without internet routing.
   * `analysis-egress`: The *only* network with public internet access, attached exclusively to `analysis-worker`.
   * `ai-egress`: Isolated egress attached strictly to `ai-service`.
   * `email-egress`: Isolated egress attached strictly to `email-service`.
2. **API Air-Gapping:** The core API backend has no analysis egress network attachment and cannot make unvetted outbound internet calls.
3. **Microservice Token Isolation:** AI and email provider keys exist strictly inside `ai-service` and `email-service`; they are physically absent from the API and worker environments.

---

## 4. Code Implementation

See [`src/network_boundary.yml`](./src/network_boundary.yml) for the isolated implementation.

---

## 5. Behavior Comparison

| Network Boundary Model | Lateral Worker Movement | Internet Egress Air-Gap | Credential Containment |
|---|---|---|---|
| Single Default Bridge | Unrestricted (Full LAN) | None (Shared Egress) | Vulnerable |
| Host Network Mode | Catastrophic (Host Loopback) | None | No Isolation |
| **5-Tier Segmented Bridges** | **Blocked by bridge iptables isolation** | **Strictly Scoped** | **Physically Isolated** |

_Qualitative comparison. Numbers appear only where a script in this folder measures them._
