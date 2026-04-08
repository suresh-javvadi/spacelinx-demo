CREATE OR REPLACE VIEW common.document_with_users_vw AS
SELECT 
    d.id,
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

    -- Full name (safe for NULL last_name)
    TRIM(
        COALESCE(cu.first_name, '') || ' ' || COALESCE(cu.last_name, '')
    ) AS created_by_full_name

FROM common.document d
LEFT JOIN application."user" cu
    ON LOWER(cu.email) = LOWER(d.created_by)
WHERE d.deleted_at IS NULL;  