-- 1. Segregate database authority by workload role
CREATE ROLE wpa_runtime NOLOGIN;     -- API role (standard application DML)
CREATE ROLE wpa_worker NOLOGIN;      -- Browser worker (SELECT/INSERT/UPDATE on scan tables; 0 DELETE)
CREATE ROLE wpa_maintenance NOLOGIN; -- Retention executor (scoped DELETE on retention tables only)
CREATE ROLE wpa_migrator NOLOGIN;    -- Schema migrations (DDL authority)

-- 2. Worker startup attestation fails closed on role mismatch
async function assertDatabaseRole(env = process.env, PoolClass = Pool) {
    const pool = new PoolClass(options);
    const actualRole = (await pool.query('SELECT current_user AS role')).rows[0]?.role;
    if (actualRole !== env.DATABASE_EXPECTED_ROLE) {
        throw new Error('WORKER_DATABASE_ROLE_MISMATCH: expected ' + env.DATABASE_EXPECTED_ROLE);
    }
}