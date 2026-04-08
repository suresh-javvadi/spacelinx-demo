-- Table: mes.part_level
-- DROP TABLE IF EXISTS mes.part_level;

CREATE TABLE IF NOT EXISTS mes.part_level (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    sort_order INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255),
    CONSTRAINT part_level_code_deleted_at_key UNIQUE (code, deleted_at)
);

CREATE INDEX IF NOT EXISTS idx_part_level_active ON mes.part_level(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_part_level_code ON mes.part_level(code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_part_level_sort_order ON mes.part_level(sort_order) WHERE deleted_at IS NULL;