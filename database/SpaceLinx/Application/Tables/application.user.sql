-- Table: application.user
-- DROP TABLE IF EXISTS application.user;

CREATE TABLE application.user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    user_number SERIAL UNIQUE NOT NULL,             
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,              
    phone VARCHAR(255),                             
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    UNIQUE (email, deleted_at)
);