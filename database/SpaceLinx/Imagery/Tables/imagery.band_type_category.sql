-- Table: imagery.band_type_category
-- DROP TABLE IF EXISTS imagery.band_type_category;

CREATE TABLE imagery.band_type_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL, -- Visible, Near Infrared, Shortwave Infrared, Thermal Infrared, Microwave, Radar, LIDAR, Middle Infrared, Longwave Infrared
    description VARCHAR(255), -- Visible, Near Infrared, Shortwave Infrared, Thermal Infrared, Microwave, Radar, LIDAR, Middle Infrared, Longwave Infrared
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);