CREATE TABLE pm.milestone (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID,
    target_date TIMESTAMPTZ,
    status VARCHAR(255) NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,	
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY(project_id) REFERENCES pm.project(id) ON DELETE SET NULL
);