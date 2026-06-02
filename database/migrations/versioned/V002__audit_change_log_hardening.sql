-- V002 — Tamper-resistance hardening for audit.change_log.
-- The application connects with an INSERT-only grant; UPDATE/DELETE/TRUNCATE are revoked and a
-- trigger blocks row mutation, so history cannot be altered through the app role.
--
-- Role names are environment-specific and supplied as Flyway placeholders:
--   ${app_role}  = the application's PostgreSQL login (least-privilege runtime role)
--   ${read_role} = a separate forensic read-only login
-- Provide them per environment, e.g.:
--   flyway -placeholders.app_role=spacelinx_app -placeholders.read_role=spacelinx_audit_ro migrate
-- Idempotent: safe to re-run.

-- 1) Application role: INSERT only on the audit schema (now and for future partitions).
GRANT USAGE ON SCHEMA audit TO ${app_role};
GRANT INSERT ON audit.change_log TO ${app_role};
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT INSERT ON TABLES TO ${app_role};
REVOKE UPDATE, DELETE, TRUNCATE ON audit.change_log FROM ${app_role};

-- 2) Forensic read role: SELECT only.
GRANT USAGE ON SCHEMA audit TO ${read_role};
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO ${read_role};
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT SELECT ON TABLES TO ${read_role};

-- 3) Immutability trigger. Row-level BEFORE UPDATE/DELETE propagates to every partition (PG 11+).
--    TRUNCATE is blocked by the REVOKE above.
CREATE OR REPLACE FUNCTION audit.deny_mutation()
    RETURNS trigger
    LANGUAGE plpgsql
AS $deny$
BEGIN
    RAISE EXCEPTION 'audit.change_log is append-only; % is not permitted', TG_OP;
END;
$deny$;

DROP TRIGGER IF EXISTS trg_change_log_immutable ON audit.change_log;
CREATE TRIGGER trg_change_log_immutable
    BEFORE UPDATE OR DELETE ON audit.change_log
    FOR EACH ROW EXECUTE FUNCTION audit.deny_mutation();
