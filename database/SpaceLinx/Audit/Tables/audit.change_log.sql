-- Table: audit.change_log
-- Append-only platform audit trail (who created/modified/deleted what, and when).
-- Written by the application audit interceptor. Range-partitioned by month on occurred_at.
-- Schema-of-record; the runnable, idempotent deployment lives in
-- database/migrations/migration_audit_change_log.sql.
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.change_log
(
    id              bigint        GENERATED ALWAYS AS IDENTITY,
    occurred_at     timestamptz   NOT NULL DEFAULT clock_timestamp(),
    schema_name     varchar(63)   NOT NULL,
    table_name      varchar(128)  NOT NULL,
    entity_type     varchar(128)  NOT NULL,
    row_pk          uuid          NOT NULL,
    operation       varchar(20)   NOT NULL,
    old_values      jsonb,
    new_values      jsonb,
    changed_cols    text[],
    actor_email     varchar(255)  NOT NULL,
    actor_role_id   uuid,
    authorized_by   varchar(255),
    bypass          boolean       NOT NULL DEFAULT false,
    app_name        varchar(50),
    tenant_id       varchar(100),
    correlation_id  varchar(100),
    request_path    varchar(500),
    request_method  varchar(10),
    source_ip       varchar(64),
    user_agent      varchar(512),
    success         boolean       NOT NULL DEFAULT true,
    source          char(1)       NOT NULL DEFAULT 'A',
    prev_hash       bytea,
    row_hash        bytea,
    CONSTRAINT change_log_pkey PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);
