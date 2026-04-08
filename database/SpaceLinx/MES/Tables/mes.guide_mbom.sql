-- Table: mes.guide_mbom
-- DROP TABLE IF EXISTS mes.guide_mbom;

CREATE TABLE mes.guide_mbom(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id UUID NOT NULL,
    part_id UUID NOT NULL,
    weight FLOAT NOT NULL DEFAULT 0,  
    quantity INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY(guide_id) REFERENCES mes.guide(id),
    FOREIGN KEY(part_id) REFERENCES mes.part(id),
    UNIQUE (guide_id, part_id, deleted_at)
);