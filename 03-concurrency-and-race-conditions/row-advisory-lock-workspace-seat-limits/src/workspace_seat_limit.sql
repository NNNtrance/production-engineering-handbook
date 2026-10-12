CREATE OR REPLACE FUNCTION wpa_enforce_member_seat_limit() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    workspace_plan text;
    effective_plan text;
    seat_limit integer;
    occupied integer;
BEGIN
    SELECT plan_id INTO workspace_plan FROM wpa_workspaces WHERE id=NEW."organizationId";
    IF workspace_plan IS NULL THEN RETURN NEW; END IF;

    -- Serialize member additions strictly per organization ID
    PERFORM pg_advisory_xact_lock(hashtext('workspace-seat:' || NEW."organizationId"));

    -- Resolve effective plan (accounting for active temporary promos/grants)
    SELECT COALESCE((
        SELECT temporary_plan_id FROM wpa_entitlement_grants
        WHERE workspace_id=NEW."organizationId" AND revoked_at IS NULL
          AND starts_at <= now() AND (expires_at IS NULL OR expires_at > now())
        ORDER BY CASE temporary_plan_id WHEN 'enterprise' THEN 3 WHEN 'studio' THEN 2 ELSE 1 END DESC
        LIMIT 1
    ), workspace_plan) INTO effective_plan;

    SELECT NULLIF(limits->>'seats','')::integer INTO seat_limit FROM wpa_plan_catalog WHERE id=effective_plan;
    SELECT count(*)::integer INTO occupied FROM member WHERE "organizationId"=NEW."organizationId" AND id<>NEW.id;

    IF occupied >= seat_limit THEN
        RAISE EXCEPTION 'WORKSPACE_SEAT_LIMIT_REACHED' USING ERRCODE='P0001';
    END IF;
    RETURN NEW;
END $$;