-- Table: common.document
--DROP TABLE IF EXISTS common.document;
 
CREATE TABLE common.document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    description TEXT,
    document_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_extension VARCHAR(50),
    file_size BIGINT,
    file_path VARCHAR(500), -- Path in your storage (S3, Azure Blob, etc.)
    file_relative_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    document_storage_type VARCHAR(20) NOT NULL CHECK (document_storage_type IN ('uploaded', 'external_url')),
    external_url TEXT,
    tags TEXT[],
    metadata JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255)
);