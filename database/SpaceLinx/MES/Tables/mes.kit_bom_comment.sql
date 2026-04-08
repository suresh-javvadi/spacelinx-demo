-- Table: mes.kit_bom_comment
-- DROP TABLE IF EXISTS mes.kit_bom_comment;
 
CREATE TABLE mes.kit_bom_comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID NOT NULL,
    part_id UUID NOT NULL,
    comments varchar(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL
);