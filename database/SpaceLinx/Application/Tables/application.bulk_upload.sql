-- Table: application.bulk_upload
-- DROP TABLE IF EXISTS application.bulk_upload;
 
CREATE TABLE application.bulk_upload (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_name VARCHAR(255) NOT NULL DEFAULT 'All',
    file_name VARCHAR(255) NOT NULL,                                        
    file_path VARCHAR(500) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(255) NOT NULL,
    error json,
    status VARCHAR(255) NOT NULL,
    total_count int,
    success_count int,
    failed_count int,
    url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,         
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,          
    updated_by VARCHAR(255) ,
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255)
);