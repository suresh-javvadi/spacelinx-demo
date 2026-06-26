-- DEMO ONLY. Plain SQL (no psql meta-commands) so it runs in any client, e.g. the
-- Neon web SQL editor. Creates the fixed demo user and grants it the Super Admin role.
-- Run AFTER 10_reference_data.sql (which seeds the 'Super Admin' role). Idempotent.
--
-- The email MUST match the API's DemoMode:Email and the frontend's VITE_DEMO_EMAIL.

-- 1) The demo user (user_number auto-fills from application.user_user_number_seq).
INSERT INTO application."user" (id, first_name, last_name, email, is_active, created_at, created_by)
SELECT gen_random_uuid(), 'Demo', 'User', 'demo@spacelinx.dev', true, now(), 'system@spacelinx.local'
WHERE NOT EXISTS (
    SELECT 1 FROM application."user" WHERE email = 'demo@spacelinx.dev' AND deleted_at IS NULL
);

-- 2) Assign the all-access 'Super Admin' role (idempotent), flagged as default.
INSERT INTO application.user_role (id, user_id, role_id, is_active, created_at, created_by, is_default)
SELECT gen_random_uuid(), u.id, r.id, true, now(), 'system@spacelinx.local', true
FROM application."user" u
JOIN application.role r ON r.role_name = 'Super Admin'
WHERE u.email = 'demo@spacelinx.dev' AND u.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM application.user_role ur
      WHERE ur.user_id = u.id AND ur.role_id = r.id AND ur.deleted_at IS NULL
  );
