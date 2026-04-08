-- Table: dap.band
-- DROP TABLE IF EXISTS dap.band;

CREATE TABLE dap.band (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INT  UNIQUE NOT NULL, -- Band number is unique
    name VARCHAR(255) NOT NULL, -- Band name is unique - Red, Green, Blue, Near Infrared, Shortwave Infrared, Thermal - Lookup - Name and BandType are related
    band_type VARCHAR(255) UNIQUE NOT NULL, -- Lookup - Visible, Near Infrared, Shortwave Infrared, Thermal Infrared, Microwave, Radar, LIDAR, Middle Infrared, Longwave Infrared
    band_type_name VARCHAR(255) UNIQUE NOT NULL, -- Lookup - Visible, Near Infrared, Shortwave Infrared, Thermal Infrared, Microwave, Radar, LIDAR, Middle Infrared, Longwave Infrared
    sensor_id UUID NOT NULL,
    start_wavelenght FLOAT, -- Start wavelength of the band
    end_wavelength FLOAT, -- End wavelength of the band
    wavelength_unit VARCHAR(255), -- Wavelength unit - nm, um, mm - Lookup
    spatial_resolution_min_m FLOAT, -- Minimum spatial resolution in meters Always > 0
    radiometric_res_bits INT, -- e.g. 10
    swath_m FLOAT, -- Swath width in meters - Copy from sensor default values
    start_off_angle_degree FLOAT, -- Start off angle in degrees
    stop_off_angle_degree FLOAT, -- Stop off angle in degrees
    has_dynamic_spatial_res BOOLEAN, -- Dynamic spatial resolution - True, False
    operational_status VARCHAR(50), -- Operational status of the band - IsActive, IsInactive
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    FOREIGN KEY (sensor_id) REFERENCES dap.sensor(id) ON DELETE SET NULL
);