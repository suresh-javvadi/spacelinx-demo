-- Table: imagery.band
-- DROP TABLE IF EXISTS imagery.band;

CREATE TABLE imagery.band (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INT  UNIQUE NOT NULL, -- Band number is unique
    satellite_sensor_id UUID NOT NULL,
    band_type_id UUID NOT NULL,
    band_type_category_id UUID NOT NULL,
    start_wavelength FLOAT, -- Start wavelength of the band
    end_wavelength FLOAT, -- End wavelength of the band
    wavelength_unit VARCHAR(255), -- Wavelength unit - nm, um, mm - Lookup
    spatial_resolution_min_m FLOAT, -- Minimum spatial resolution in meters Always > 0
    radiometric_res_bits INT, -- e.g. 10
    swath_m FLOAT, -- Swath width in meters - Copy from sensor default values
    start_off_angle_degree FLOAT, -- Start off angle in degrees
    stop_off_angle_degree FLOAT, -- Stop off angle in degrees
    has_dynamic_spatial_res BOOLEAN, -- Dynamic spatial resolution - True, False
    operational_status VARCHAR(50) NOT NULL DEFAULT 'IsActive', -- Operational status of the band - IsActive, IsInactive
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (satellite_sensor_id) REFERENCES imagery.satellite_sensor(id) ON DELETE SET NULL,
    FOREIGN KEY (band_type_id) REFERENCES imagery.band_type(id) ON DELETE SET NULL,
    FOREIGN KEY (band_type_category_id) REFERENCES imagery.band_type_category(id) ON DELETE SET NULL
);