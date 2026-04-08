-- Table: dap.strip_information
-- DROP TABLE IF EXISTS dap.strip_information;

CREATE TABLE dap.strip_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pass_id UUID NOT NULL,
    imaging_orbit_number INT NOT NULL,
    dump_orbit_number INT NOT NULL,
    strip_number INT NOT NULL,
    imaging_start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    imaging_end_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    imaging_region POLYGON NOT NULL, 
    strip_length FLOAT ,
    swath FLOAT,
    sensor_id UUID NOT NULL,
    accuracy FLOAT,
    snr FLOAT,
    cloud_cover FLOAT,
    off_nadir FLOAT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    FOREIGN KEY (pass_id) REFERENCES dap.pass_information(id) ON DELETE SET NULL,
    FOREIGN KEY (sensor_id) REFERENCES dap.sensor(id) ON DELETE SET NULL
);