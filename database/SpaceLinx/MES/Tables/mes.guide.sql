-- Table: mes.guide
-- DROP TABLE IF EXISTS mes.guide;

CREATE TABLE mes.guide (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,     
    sequence SERIAL UNIQUE NOT NULL,
    number VARCHAR(255) NOT NULL DEFAULT application.generate_alphanumeric_sequence('GD-', currval('mes.guide_sequence_seq')),     
    platform_id UUID,
    part_id UUID NOT NULL,
    guide_type_id UUID NOT NULL,
    clone_from_id UUID,
    calculated_weight FLOAT NOT NULL DEFAULT 0,  
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(255) NOT NULL DEFAULT 'Draft',
    check_out_by VARCHAR(255), 
    category VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (platform_id) REFERENCES mes.platform(id) ON DELETE SET NULL,
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (guide_type_id) REFERENCES mes.guide_type(id) ON DELETE SET NULL,
    FOREIGN KEY (clone_from_id) REFERENCES mes.guide(id) ON DELETE SET NULL,
    UNIQUE (part_id, number, version)
);