DROP VIEW IF EXISTS common.document_with_users_vw CASCADE;

CREATE VIEW common.document_with_users_vw AS
 SELECT d.id,
    d.title,
    d.description,
    d.document_type,
    d.entity_type,
    d.entity_id,
    d.file_name,
    d.file_extension,
    d.file_size,
    d.file_path,
    d.file_relative_path,
    d.mime_type,
    d.document_storage_type,
    d.external_url,
    d.tags,
    d.metadata,
    d.is_active,
    d.created_at,
    d.created_by,
    TRIM(BOTH FROM (((COALESCE(cu.first_name, ''::character varying))::text || ' '::text) || (COALESCE(cu.last_name, ''::character varying))::text)) AS created_by_full_name
   FROM (common.document d
     LEFT JOIN application."user" cu ON ((lower((cu.email)::text) = lower((d.created_by)::text))))
  WHERE (d.deleted_at IS NULL);

ALTER VIEW common.document_with_users_vw OWNER TO spacelinxadmin;
GRANT SELECT ON common.document_with_users_vw TO spacelinxuser;
