-- Table: mes.machine
-- DROP TABLE IF EXISTS mes.machine;

CREATE TABLE mes.machine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,     
    machine_type_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (machine_type_id) REFERENCES mes.machine_type(id) ON DELETE SET NULL
);