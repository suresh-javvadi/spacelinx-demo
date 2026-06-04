ALTER DEFAULT PRIVILEGES FOR ROLE spacelinxadmin IN SCHEMA mes, sc, common, application, pm
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :app_role;
ALTER DEFAULT PRIVILEGES FOR ROLE spacelinxadmin IN SCHEMA mes, sc, common, application, pm
  GRANT USAGE, SELECT ON SEQUENCES TO :app_role;
