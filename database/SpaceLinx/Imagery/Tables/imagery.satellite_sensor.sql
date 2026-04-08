-- Table: imagery.satellite_sensor
-- DROP TABLE IF EXISTS imagery.satellite_sensor;

CREATE TABLE imagery.satellite_sensor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    satellite_id UUID NOT NULL,
    -- Sensor Properties Start
    sensor_id UUID NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    spatial_resolution_min_m FLOAT,
    swath_width_km FLOAT,
    off_nadir_max_degree FLOAT,
    along_track_max_degree FLOAT,
    -- Sensor Properties End
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (satellite_id) REFERENCES imagery.satellite(id) ON DELETE SET NULL,
    FOREIGN KEY (sensor_id) REFERENCES imagery.sensor(id) ON DELETE SET NULL,
    UNIQUE (satellite_id, sensor_id)
);