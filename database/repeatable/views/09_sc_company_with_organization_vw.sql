DROP VIEW IF EXISTS sc.company_with_organization_vw CASCADE;

CREATE VIEW sc.company_with_organization_vw AS
 SELECT c.id,
    c.name,
    c.is_active,
    c.created_at,
    c.created_by,
    c.updated_at,
    c.updated_by,
    'Company'::text AS entity_type
   FROM sc.company c
UNION ALL
 SELECT o.id,
    o.name,
    o.is_active,
    o.created_at,
    o.created_by,
    o.updated_at,
    o.updated_by,
    'Organization'::text AS entity_type
   FROM application.organization o
  WHERE (o.deleted_by IS NULL);

ALTER VIEW sc.company_with_organization_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.company_with_organization_vw TO spacelinxuser;
