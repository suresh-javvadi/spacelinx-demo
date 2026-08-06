-- UAT migration: Make application.permission's uniqueness on name exclude soft-deleted rows
-- Date: 2026-08-03
-- One-time manual companion for a `psql` run against UAT, to unblock ahead of the pipeline.
-- For the idempotent, safe-to-re-run version applied by the pipeline (Dev -> UAT -> Prod), see
-- migration_permission_name_unique_deleted_at.sql.
--
-- Replaces the plain UNIQUE(name) constraint/index on application.permission with a composite
-- UNIQUE NULLS NOT DISTINCT (name, deleted_at) index, matching the pattern used elsewhere in the
-- schema for soft-deleted tables, but with NULLS NOT DISTINCT so active-row (deleted_at IS NULL)
-- uniqueness by name is still enforced -- see the idempotent companion for why plain
-- UNIQUE(name, deleted_at) would silently drop that guarantee. Without this change, creating a
-- new permission with the same name as a previously deleted one fails uniqueness against rows
-- that should be excluded.
--
-- NOTE: unlike most _uat companions, this intentionally keeps the same existence-check guard as
-- the idempotent pipeline file rather than a plain ALTER TABLE. permission_name_key has already
-- been observed to drift between environments as either a table CONSTRAINT or a bare UNIQUE
-- INDEX, and the declarative database/audit/uat.schema.sql capture is not reliable proof of
-- which form UAT currently has -- a one-shot DROP CONSTRAINT/DROP INDEX assuming a specific
-- prior state has errored against real UAT before. Do not re-run once it succeeds (it is
-- effectively a no-op on a second run anyway, since the guards make it idempotent).
--
-- Mirrors EF migration 20260803104442_PermissionNameUniqueIncludeDeletedAt.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'permission_name_key'
          AND connamespace = 'application'::regnamespace
    ) THEN
        ALTER TABLE application.permission DROP CONSTRAINT permission_name_key;
    ELSIF EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'application' AND indexname = 'permission_name_key'
    ) THEN
        DROP INDEX application.permission_name_key;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'application' AND indexname = 'permission_name_deleted_at_key'
    ) THEN
        CREATE UNIQUE INDEX permission_name_deleted_at_key
            ON application.permission (name, deleted_at) NULLS NOT DISTINCT;
    END IF;
END
$$;
