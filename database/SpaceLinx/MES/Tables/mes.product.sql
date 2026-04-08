-- Table: mes.product
-- DROP TABLE IF EXISTS mes.product;

CREATE TABLE mes.product (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sequence SERIAL UNIQUE NOT NULL,
    number VARCHAR(255) UNIQUE NOT NULL DEFAULT application.generate_alphanumeric_sequence('PD-', currval('mes.product_sequence_seq')), 
    platform_id UUID,
    part_id UUID NOT NULL,
    image_id UUID,
    description Text,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (platform_id) REFERENCES mes.platform(id) ON DELETE SET NULL,
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL
);