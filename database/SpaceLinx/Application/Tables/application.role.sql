-- Table: application.role
-- DROP TABLE IF EXISTS application.role;

CREATE TABLE application.role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    role_number SERIAL UNIQUE NOT NULL,              
    role_name VARCHAR(255) NOT NULL,          		 
    role_description TEXT,    
    app_id UUID NOT NULL,
    system_defined BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,         
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (app_id) REFERENCES application.app(id) ON DELETE CASCADE,
    UNIQUE (role_name, app_id, deleted_at)
);