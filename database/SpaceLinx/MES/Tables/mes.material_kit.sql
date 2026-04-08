-- Table: mes.material_kit
-- DROP TABLE IF EXISTS mes.material_kit;

CREATE TABLE mes.material_kit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sequence SERIAL UNIQUE NOT NULL,
    number VARCHAR(255) UNIQUE NOT NULL DEFAULT application.generate_alphanumeric_sequence('KIT-', currval('mes.material_kit_sequence_seq')), 
    part_id UUID NOT NULL,
    location_id UUID NOT NULL,
    image_id UUID,
    quantity INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL,
    FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL
);