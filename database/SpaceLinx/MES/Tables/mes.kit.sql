-- Table: mes.kit
-- DROP TABLE IF EXISTS mes.kit;

CREATE TABLE mes.kit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    number VARCHAR(255) UNIQUE NOT NULL,
    part_id UUID NOT NULL,
    location_id UUID,
    material_kit_id UUID,
    status VARCHAR(255) NOT NULL DEFAULT 'Pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL,
    FOREIGN KEY (material_kit_id) REFERENCES mes.material_kit(id) ON DELETE SET NULL
);