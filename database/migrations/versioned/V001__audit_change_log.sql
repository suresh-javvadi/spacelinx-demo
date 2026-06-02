-- V001 — Platform audit trail: audit.change_log (range-partitioned by month)
-- Flyway-managed schema migration. Idempotent guards retained as defense-in-depth.
-- Identical on all environments. Tamper-resistance grants/trigger are in V002 (parameterized).
-- No DEFAULT partition by design: a missing future partition must fail loudly (audit writes run
-- in their own transaction, so a failure is logged and does NOT roll back business data).

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

-- (fillfactor stays at the heap default of 100, which is correct for this append-only table;
--  it cannot be set on the partitioned parent — only on leaf partitions if ever needed.)

CREATE INDEX IF NOT EXISTS ix_change_log_row
    ON audit.change_log (schema_name, table_name, row_pk, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ix_change_log_actor
    ON audit.change_log (actor_email, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ix_change_log_corr
    ON audit.change_log (correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_change_log_brin
    ON audit.change_log USING brin (occurred_at) WITH (pages_per_range = 32);

-- Pre-create monthly partitions (2026-01 .. 2028-01). Idempotent. Enable pg_partman + pg_cron
-- per environment to automate creation/retention beyond this range (see database/migrations/README.md).
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
