-- Group roles referenced by the EF migrations (audit-table grants), the seed
-- (ALTER DEFAULT PRIVILEGES ... TO spacelinxuser), and the CI apply (SET ROLE
-- spacelinxadmin). Created once at container init so applying the schema locally
-- mirrors the real environments without "role does not exist" errors.
--
-- These are LOCAL-ONLY, NOLOGIN group roles. The developer (and the API) connect as
-- the 'spacelinx' superuser, which is made a member of the owner roles so any
-- SET ROLE / ownership behaviour matches the managed environments.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'spacelinxadmin')     THEN CREATE ROLE spacelinxadmin     NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'spacelinxuser')      THEN CREATE ROLE spacelinxuser      NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'spacelinx_audit_ro') THEN CREATE ROLE spacelinx_audit_ro NOLOGIN; END IF;
END$$;

-- Let the local superuser act as the object-owner role the pipeline uses.
GRANT spacelinxadmin TO spacelinx;
GRANT spacelinxuser  TO spacelinx;
