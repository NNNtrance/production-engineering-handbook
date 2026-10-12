-- 1. Staged WebAuthn assertion bound cryptographically to session, IP, and User-Agent
CREATE TABLE IF NOT EXISTS wpa_admin_webauthn_assertions (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    credential_id text NOT NULL REFERENCES passkey("credentialID") ON DELETE CASCADE,
    ip_hash text NOT NULL,
    user_agent_hash text NOT NULL,
    session_id_hash text,
    verified_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    consumed_at timestamptz,
    CHECK (expires_at > verified_at)
);

-- 2. Partial unique index prevents assertion reuse across competing sessions
CREATE UNIQUE INDEX IF NOT EXISTS wpa_admin_webauthn_assertion_session_unique
    ON wpa_admin_webauthn_assertions(session_id_hash)
    WHERE session_id_hash IS NOT NULL;

-- 3. Monotonic security_version increments invalidate all elevated step-up markers
ALTER TABLE wpa_admin_accounts ADD COLUMN IF NOT EXISTS security_version bigint NOT NULL DEFAULT 1;
ALTER TABLE wpa_admin_reauth_markers ADD COLUMN IF NOT EXISTS security_version bigint NOT NULL DEFAULT 1;
