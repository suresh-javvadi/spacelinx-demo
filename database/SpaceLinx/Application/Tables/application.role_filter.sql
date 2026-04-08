CREATE TABLE application.role_filter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    entity VARCHAR(100) NOT NULL,       -- e.g., 'guide', 'workorder'
    key VARCHAR(100) NOT NULL,     -- e.g., 'id', 'name', 'number'
    operator VARCHAR(20) NOT NULL,      -- e.g., '=', '!=', 'IN', 'LIKE'
    value TEXT NOT NULL,	            -- stored as text, convert as needed
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY(role_id) REFERENCES application.role(id)
);