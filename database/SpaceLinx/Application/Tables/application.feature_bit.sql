-- Table: application.feature_bit
-- DROP TABLE IF EXISTS application.feature_bit;
 
CREATE TABLE application.feature_bit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    feature_name VARCHAR(255) NOT NULL UNIQUE,       
    application_name VARCHAR(255) NOT NULL DEFAULT 'All',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,         
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,          
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255)
);