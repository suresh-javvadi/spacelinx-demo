-- Table: imagery.pass_information
-- DROP TABLE IF EXISTS imagery.pass_information;

CREATE TABLE imagery.pass_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    satellite_id UUID NOT NULL,
    orbit_number INT NOT NULL,
    pass_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Date of the pass - Date Only
    aos_start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    los_end_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    station_id UUID NOT NULL, -- Ground station -- Look up table
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (satellite_id) REFERENCES imagery.satellite(id) ON DELETE SET NULL,
    FOREIGN KEY (station_id) REFERENCES imagery.station(id) ON DELETE SET NULL
);