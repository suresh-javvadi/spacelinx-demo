-- Table: application.app
-- DROP TABLE IF EXISTS application.app;

CREATE TABLE application.app (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    app_number SERIAL UNIQUE NOT NULL,           
    app_name VARCHAR(255) NOT NULL UNIQUE,       
    description TEXT,                                
    is_active BOOLEAN NOT NULL DEFAULT TRUE,         
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,          
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255)
);