-- Table: mes.ebom
-- DROP TABLE IF EXISTS mes.ebom;

CREATE TABLE mes.ebom(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID NOT NULL,
    child_part_id UUID NOT NULL,
    quantity INT NOT NULL,
    assembly_location_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY(part_id) REFERENCES mes.part(id),
    FOREIGN KEY(child_part_id) REFERENCES mes.part(id),
    FOREIGN KEY (assembly_location_id) REFERENCES mes.assembly_location(id) ON DELETE SET NULL,
    UNIQUE (part_id, child_part_id, deleted_at)
);