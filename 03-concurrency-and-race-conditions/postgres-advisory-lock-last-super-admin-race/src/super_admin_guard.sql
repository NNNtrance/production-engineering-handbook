-- 1. Statement-level trigger serializes all privileged mutations
CREATE OR REPLACE FUNCTION wpa_lock_privileged_admin_set() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('wpa:privileged-role-management'));
    RETURN NULL;
END;
$$;

CREATE TRIGGER wpa_lock_privileged_admin_role_update
BEFORE UPDATE OF role,active ON wpa_admin_accounts
FOR EACH STATEMENT EXECUTE FUNCTION wpa_lock_privileged_admin_set();

-- 2. Row-level invariant evaluates serial state and rejects final downgrade
CREATE OR REPLACE FUNCTION wpa_preserve_last_super_admin() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.active AND OLD.role='super_admin' THEN
        IF (NOT NEW.active OR NEW.role <> 'super_admin')
          AND NOT EXISTS (
              SELECT 1 FROM wpa_admin_accounts
              WHERE user_id <> OLD.user_id AND active AND role='super_admin'
          ) THEN
            RAISE EXCEPTION 'LAST_SUPER_ADMIN_REQUIRED' USING ERRCODE='23514';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;