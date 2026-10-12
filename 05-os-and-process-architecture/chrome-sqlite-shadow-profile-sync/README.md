# Case Study 05: Chrome SQLite Shadow Profile Sync

> **Domain:** Operating System & Process Architecture  
> **Source Project:** `llm-conductor` (Desktop Native Core)  
> **Language:** Rust  
> **Dependencies:** `0` (Standard Library only)  
> **Key Metric:** `0` CAPTCHAs, `0` 2FA prompts, zero disturbance to running user browser

---

## 1. The Constraint

Desktop AI browser automation fails on modern web applications because fresh browser sessions encounter Cloudflare bot detection, login walls, and SMS 2FA.

However, launching a second Chrome instance with `--remote-debugging-port` pointed at the user's active Chrome profile fails with a fatal crash. Chrome places OS-level exclusive write locks on its SQLite databases (`Cookies`, `Login Data`, `Web Data`). Killing the user's active browser is intolerable as it destroys unsubmitted forms and active tabs.

---

## 2. Why Naive Workarounds Fail

1. **Process Termination (`killall chrome`):**
   * Destroys user productivity and active workspaces.
2. **Standard Folder Copy (`cp -r User Data`):**
   * Fails due to multi-gigabyte cache directories, taking tens of seconds, and throws file-lock permission errors on locked WAL journal files.

---

## 3. The Architecture

We engineered an Atomic Shadow Profile Sync in Rust:

1. **Lock-Free Read Streaming:** While SQLite locks writing, the OS allows non-exclusive read operations on underlying database files.
2. **Master DPAPI Key Re-encryption:** We copy `Local State` which contains the DPAPI-encrypted master key used to decrypt cookies.
3. **Surgical Cloning:** We surgically clone only `Preferences`, `Secure Preferences`, and `Network/Cookies` into a temporary shadow profile directory.
4. **Isolated Launch:** The AI launches against the lightweight shadow profile, instantly running as the authenticated user with zero logins and zero CAPTCHAs.
