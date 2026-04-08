-- Table: dap.sensor
-- DROP TABLE IF EXISTS dap.sensor;

CREATE TABLE dap.sensor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INT NOT NULL, -- Sensor number include in sensortype
    code VARCHAR(50) NOT NULL, -- include in sensortype -- PAN, MS, HSI, TIR, SAR, LIDAR
    name VARCHAR(255) NOT NULL, -- include in sensortype -- PAN, MS, HSI, TIR, SAR, LIDAR
    satellite_id UUID NOT NULL,
    owner VARCHAR(255),
    technology_type VARCHAR(255), -- Technology type of the sensor - Look up table
    technology_notes VARCHAR(255), -- Technology Type notes
    spatial_resolution_min_m FLOAT,
    swath_width_km FLOAT,
    off_nadir_max_degree FLOAT,
    along_track_max_degree FLOAT,
    operational_status VARCHAR(50),
    manufacturer VARCHAR(255), -- Sensor manufacturer - Look up table
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    FOREIGN KEY (satellite_id) REFERENCES dap.satellite(id) ON DELETE SET NULL
);