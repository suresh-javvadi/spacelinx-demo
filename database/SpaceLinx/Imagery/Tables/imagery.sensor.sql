-- Table: imagery.sensor
-- DROP TABLE IF EXISTS imagery.sensor;

CREATE TABLE imagery.sensor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_type_id UUID NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    owner VARCHAR(255),
    technology_type_id UUID NOT NULL,
    rows int,
    columns int,
    bpp int, -- Bits per pixel
    pixel_pitch FLOAT,
    operational_status VARCHAR(50) NOT NULL DEFAULT 'IsActive',
    manufacturer_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (sensor_type_id) REFERENCES imagery.sensor_type(id) ON DELETE SET NULL,
    FOREIGN KEY (technology_type_id) REFERENCES imagery.technology_type(id) ON DELETE SET NULL,
    FOREIGN KEY (manufacturer_id) REFERENCES imagery.manufacturer(id) ON DELETE SET NULL
);