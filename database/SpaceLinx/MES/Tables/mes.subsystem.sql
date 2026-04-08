-- Table: mes.subsystem
-- DROP TABLE IF EXISTS mes.subsystem;

CREATE TABLE IF NOT EXISTS mes.subsystem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255),
    CONSTRAINT subsystem_code_deleted_at_key UNIQUE (code, deleted_at)
);

CREATE INDEX IF NOT EXISTS idx_subsystem_active ON mes.subsystem(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_subsystem_code ON mes.subsystem(code) WHERE deleted_at IS NULL;