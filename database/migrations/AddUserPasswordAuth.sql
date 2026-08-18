START TRANSACTION;

-- Adds the password-login columns to application."user" (migration
-- 20260817203209_AddUserPasswordAuth).
--
-- Safe to run against a database built by hand from the SQL bundles rather than by
-- EF: the history table is created first if it is missing, and every step is
-- guarded, so re-running this changes nothing.

CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260817203209_AddUserPasswordAuth') THEN
    ALTER TABLE application."user" ADD failed_login_attempts integer NOT NULL DEFAULT 0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260817203209_AddUserPasswordAuth') THEN
    ALTER TABLE application."user" ADD lockout_until timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260817203209_AddUserPasswordAuth') THEN
    ALTER TABLE application."user" ADD must_change_password boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260817203209_AddUserPasswordAuth') THEN
    ALTER TABLE application."user" ADD password_hash character varying(255);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260817203209_AddUserPasswordAuth') THEN
    ALTER TABLE application."user" ADD password_reset_token_expires_at timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260817203209_AddUserPasswordAuth') THEN
    ALTER TABLE application."user" ADD password_reset_token_hash character varying(255);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260817203209_AddUserPasswordAuth') THEN
    ALTER TABLE application."user" ADD password_updated_at timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260817203209_AddUserPasswordAuth') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260817203209_AddUserPasswordAuth', '10.0.5');
    END IF;
END $EF$;
COMMIT;

