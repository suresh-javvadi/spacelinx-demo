CREATE OR REPLACE VIEW sc.company_with_organization_vw AS
SELECT
    c.id,
    c.name,
    c.is_active,
    c.created_at,
    c.created_by,
    c.updated_at,
    c.updated_by,
    'Company' AS entity_type
FROM sc.company c
 
UNION ALL
 
SELECT
    o.id,
    o.name,
    o.is_active,
    o.created_at,
    o.created_by,
    o.updated_at,
    o.updated_by,
    'Organization' AS entity_type
FROM application.organization o
WHERE o.deleted_by IS NULL;