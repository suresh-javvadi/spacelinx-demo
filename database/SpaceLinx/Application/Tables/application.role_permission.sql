CREATE TABLE application.role_permission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    permission VARCHAR(255) NOT NULL ,
    enable BOOLEAN NOT NULL DEFAULT TRUE,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY(role_id) REFERENCES application.role(id) ON DELETE SET NULL,
    UNIQUE (role_id, permission, deleted_at)
);