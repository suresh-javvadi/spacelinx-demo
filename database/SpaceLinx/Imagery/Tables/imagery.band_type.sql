-- Table: imagery.band_type
-- DROP TABLE IF EXISTS imagery.band_type;

CREATE TABLE imagery.band_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL, -- Red, Green, Blue, Near Infrared, Shortwave Infrared, Thermal - BandType and BandTypeCategory are related
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);