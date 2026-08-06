-- Migration: Make application.permission's uniqueness on name exclude soft-deleted rows
-- Date: 2026-08-03
-- Replaces the plain UNIQUE(name) constraint/index with a composite
-- UNIQUE NULLS NOT DISTINCT (name, deleted_at) index, matching the pattern used elsewhere in the
-- schema for soft-deleted tables (e.g. subsystem_code_deleted_at_key,
-- role_permission_role_id_permission_deleted_at_key, user_email_deleted_at_key), but with
-- NULLS NOT DISTINCT so it still enforces uniqueness across active (deleted_at IS NULL) rows.
-- Without this, creating a new permission with the same name as a previously deleted one fails a
-- uniqueness check against rows that are supposed to be excluded.
--
-- NULLS NOT DISTINCT matters here: by default Postgres treats every NULL as distinct from every
-- other NULL in a unique index, so a plain UNIQUE(name, deleted_at) would let two *active*
-- permissions (both deleted_at IS NULL) share the same name -- silently dropping the duplicate-
-- name guard that the old UNIQUE(name) constraint enforced. NULLS NOT DISTINCT (PG15+; this
-- schema targets PG16) makes two NULL deleted_at values collide, so active-row uniqueness by name
-- is preserved while distinct (non-null) deleted_at timestamps still let deleted rows share a name.
--
-- permission_name_key has been observed to drift between environments as either a table
-- CONSTRAINT or a bare UNIQUE INDEX, so this drops whichever form actually exists instead of
-- assuming one.
--
-- Mirrors EF migration 20260803104442_PermissionNameUniqueIncludeDeletedAt,
-- which is what the pipeline actually applies (see database/migrations/README.md).
-- Keep in sync. Idempotent -- safe to re-run.

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
