-- Bootstrap admin — PARAMETERIZED, no PII committed to the repo.
-- Creates one Super Admin user per environment so a fresh/Demo database has an initial login.
-- The admin's email is supplied at apply time (like the role placeholders), NOT hardcoded here:
--
--   psql ... -v admin_email='you@yourtenant.com' -f 20_bootstrap_admin.sql
--
-- In the pipeline, pass it from a per-environment variable/Key Vault secret (e.g. BootstrapAdminEmail).
-- Idempotent: re-running is a no-op; if :admin_email is omitted the script skips cleanly.
-- Note: the app authenticates via Azure AD (MSAL), so :admin_email must match a real Entra ID
-- identity in that environment for the login to actually work. Real users are NOT seeded from git;
-- this single bootstrap account exists only to grant the first administrator access.

\if :{?admin_email}

  -- 1) The bootstrap user (user_number auto-fills from application.user_user_number_seq).
  INSERT INTO application."user" (id, first_name, last_name, email, is_active, created_at, created_by)
  SELECT gen_random_uuid(), 'Bootstrap', 'Admin', :'admin_email', true, now(), 'system@spacelinx.local'
  WHERE NOT EXISTS (
      SELECT 1 FROM application."user" WHERE email = :'admin_email' AND deleted_at IS NULL
  );

  -- 2) Assign the all-access 'Super Admin' role (idempotent).
  INSERT INTO application.user_role (id, user_id, role_id, is_active, created_at, created_by, is_default)
  SELECT gen_random_uuid(), u.id, r.id, true, now(), 'system@spacelinx.local', true
  FROM application."user" u
  JOIN application.role r ON r.role_name = 'Super Admin'
  WHERE u.email = :'admin_email' AND u.deleted_at IS NULL
    AND NOT EXISTS (
        SELECT 1 FROM application.user_role ur
        WHERE ur.user_id = u.id AND ur.role_id = r.id AND ur.deleted_at IS NULL
    );

  \echo 'Bootstrap admin ensured for' :admin_email

\else
  \echo 'Skipping bootstrap admin: no -v admin_email provided'
\endif
