-- 1. Durable execution history surviving workspace cascade for compliance audit
CREATE TABLE IF NOT EXISTS wpa_workspace_deletion_runs (
    id text PRIMARY KEY,
    request_id text NOT NULL UNIQUE,
    workspace_id text REFERENCES wpa_workspaces(id) ON DELETE SET NULL,
    status text NOT NULL CHECK (status IN ('running','completed','failed')),
    attempts integer NOT NULL DEFAULT 0,
    actor_id text,
    deleted_reports integer NOT NULL DEFAULT 0,
    deleted_source_inputs integer NOT NULL DEFAULT 0,
    deleted_executions integer NOT NULL DEFAULT 0,
    failure_code text,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz
);

-- 2. Performance indexes supporting retention status monitoring
CREATE INDEX IF NOT EXISTS wpa_workspace_deletion_runs_status_idx
    ON wpa_workspace_deletion_runs(status, started_at);
