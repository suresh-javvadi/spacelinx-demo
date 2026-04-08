CREATE TABLE mes.guide_ebom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id UUID NOT NULL,
    part_id UUID NOT NULL, 
    child_part_id UUID NOT NULL, 
    quantity INT NOT NULL, 
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL, 
    updated_at TIMESTAMPTZ, 
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL,
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (child_part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    UNIQUE (guide_id, part_id, child_part_id, deleted_at)
);
