-- 1. Database-enforced singleton open intent per workspace
CREATE UNIQUE INDEX IF NOT EXISTS wpa_checkout_one_open_intent_idx
    ON wpa_checkout_acceptances(workspace_id)
    WHERE status IN ('accepted','checkout_created');

-- 2. Setup lease columns to serialize provider session creation
ALTER TABLE wpa_checkout_acceptances
    ADD COLUMN IF NOT EXISTS setup_lease_owner text,
    ADD COLUMN IF NOT EXISTS setup_lease_token text,
    ADD COLUMN IF NOT EXISTS setup_lease_expires_at timestamptz;

-- 3. Audit log atomicity (Rollback on audit insert failure)
async function setPlanEntitlementWithAudit({ store, planId, moduleId, entitlement, actorId, reason, requestId }) {
    const client = await store.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE wpa_plan_catalog SET entitlements = $1 WHERE id = $2', [JSON.stringify(entitlement), planId]);
        // If audit insert fails, entire mutation rolls back
        await client.query('INSERT INTO wpa_audit_log (action, actor_id, reason, request_id) VALUES ($1, $2, $3, $4)',
            ['plan.entitlement_changed', actorId, reason, requestId]);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}