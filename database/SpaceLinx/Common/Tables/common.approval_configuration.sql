CREATE TABLE  common.approval_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type varchar(100) NOT NULL,
    number_of_level integer NOT NULL DEFAULT 1,
    description text NULL,
    require_sequential_approval boolean NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
);