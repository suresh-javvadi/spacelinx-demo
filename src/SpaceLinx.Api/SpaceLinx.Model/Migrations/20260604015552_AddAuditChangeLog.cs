using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditChangeLog : Migration
    {
        // audit.change_log is created/owned by this migration's raw SQL: it is range-partitioned by
        // month and tamper-resistant (append-only via an immutability trigger + revoked UPDATE/DELETE/
        // TRUNCATE). EF cannot model partitioning or triggers, so the DDL is carried verbatim here via
        // migrationBuilder.Sql(...). The ChangeLog entity is ExcludeFromMigrations and is mapped only
        // for read/insert. Ported from the retired Flyway scripts V001 (table/indexes/partitions) and
        // V002 (grants/trigger). All statements are idempotent; role grants are existence-guarded so
        // the single built migrate.sql can be promoted to every environment + run in CI where roles
        // may differ. Flyway placeholders map: ${app_role} -> spacelinxuser, ${read_role} -> spacelinx_audit_ro.

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // --- V001: schema + range-partitioned table + indexes ---------------------------------
            migrationBuilder.Sql(@"
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS audit.change_log (
    id              bigint        GENERATED ALWAYS AS IDENTITY,
    occurred_at     timestamptz   NOT NULL DEFAULT clock_timestamp(),
    schema_name     varchar(63)   NOT NULL,
    table_name      varchar(128)  NOT NULL,
    entity_type     varchar(128)  NOT NULL,
    row_pk          uuid          NOT NULL,
    operation       varchar(20)   NOT NULL,
    old_values      jsonb         NULL,
    new_values      jsonb         NULL,
    changed_cols    text[]        NULL,
    actor_email     varchar(255)  NOT NULL,
    actor_role_id   uuid          NULL,
    authorized_by   varchar(255)  NULL,
    bypass          boolean       NOT NULL DEFAULT false,
    app_name        varchar(50)   NULL,
    tenant_id       varchar(100)  NULL,
    correlation_id  varchar(100)  NULL,
    request_path    varchar(500)  NULL,
    request_method  varchar(10)   NULL,
    source_ip       varchar(64)   NULL,
    user_agent      varchar(512)  NULL,
    success         boolean       NOT NULL DEFAULT true,
    source          char(1)       NOT NULL DEFAULT 'A',
    prev_hash       bytea         NULL,
    row_hash        bytea         NULL,
    CONSTRAINT change_log_pkey PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

CREATE INDEX IF NOT EXISTS ix_change_log_row
    ON audit.change_log (schema_name, table_name, row_pk, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ix_change_log_actor
    ON audit.change_log (actor_email, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ix_change_log_corr
    ON audit.change_log (correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_change_log_brin
    ON audit.change_log USING brin (occurred_at) WITH (pages_per_range = 32);
");

            // --- V001: pre-create monthly partitions (2026-01 .. 2028-01), idempotent ------------
            migrationBuilder.Sql(@"
DO $$
DECLARE
    start_month date := date '2026-01-01';
    end_month   date := date '2028-01-01';
    p           date;
    part_name   text;
BEGIN
    p := start_month;
    WHILE p < end_month LOOP
        part_name := 'change_log_' || to_char(p, 'YYYY_MM');
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'audit' AND c.relname = part_name
        ) THEN
            EXECUTE format(
                'CREATE TABLE audit.%I PARTITION OF audit.change_log FOR VALUES FROM (%L) TO (%L);',
                part_name, p, (p + interval '1 month')::date);
        END IF;
        p := (p + interval '1 month')::date;
    END LOOP;
END
$$;
");

            // --- V002: immutability trigger (append-only). Preserved exactly. ---------------------
            migrationBuilder.Sql(@"
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
");

            // --- V002: application role (INSERT-only). Existence-guarded no-op if role absent. ----
            // ${app_role} -> spacelinxuser
            migrationBuilder.Sql(@"
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'spacelinxuser') THEN
        GRANT USAGE ON SCHEMA audit TO spacelinxuser;
        GRANT INSERT ON audit.change_log TO spacelinxuser;
        ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT INSERT ON TABLES TO spacelinxuser;
        REVOKE UPDATE, DELETE, TRUNCATE ON audit.change_log FROM spacelinxuser;
    END IF;
END $$;
");

            // --- V002: forensic read role (SELECT-only). Existence-guarded; no-op until provisioned.
            // ${read_role} -> spacelinx_audit_ro
            migrationBuilder.Sql(@"
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'spacelinx_audit_ro') THEN
        GRANT USAGE ON SCHEMA audit TO spacelinx_audit_ro;
        GRANT SELECT ON ALL TABLES IN SCHEMA audit TO spacelinx_audit_ro;
        ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT SELECT ON TABLES TO spacelinx_audit_ro;
    END IF;
END $$;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP SCHEMA IF EXISTS audit CASCADE;");
        }
    }
}
