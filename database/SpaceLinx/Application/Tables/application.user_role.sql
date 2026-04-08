-- Table: application.user_role
-- DROP TABLE IF EXISTS application.user_role;

CREATE TABLE application.user_role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),   
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,          
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES application.user(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES application.role(id) ON DELETE CASCADE
);