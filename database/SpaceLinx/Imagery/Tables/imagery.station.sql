-- Table: imagery.station
-- DROP TABLE IF EXISTS imagery.station;

CREATE TABLE imagery.station (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(255),
    position point,
    ground_station_type VARCHAR(100),
    station_type VARCHAR(100),
    antenna_dish_radius VARCHAR(100),
    receiver_sensitivity VARCHAR(50),
    angle_range JSON,
    capability  VARCHAR(100) NOT NULL,
    dish_size  VARCHAR(100) NOT NULL,
    owner  VARCHAR(100) NOT NULL,
    code VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);