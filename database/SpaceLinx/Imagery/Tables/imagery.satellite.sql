-- Table: imagery.satellite
-- DROP TABLE IF EXISTS imagery.satellite;

CREATE TABLE imagery.satellite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    international_designator VARCHAR(50) UNIQUE, -- International Designator code given by the Global Space Surveillance Network (GSSN)
    country_id UUID NOT NULL,
    country_code VARCHAR(3),
    launch_date DATE,
    launch_site VARCHAR(255),
    decay_date DATE, -- Expiry date
    period_min FLOAT, -- Orbital period in minutes generally 90 minutes
    inclination_degree FLOAT, -- Orbital inclination in degrees
    perigee_km INT, -- Nearest point to earth
    apogee_km INT, -- Farthest point to earth
    operational_status VARCHAR(50) NOT NULL DEFAULT 'IsActive', -- Operational status of the satellite - IsActive, IsInactive, IsDecommissioned, IsLost, IsMaintenance
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (country_code) REFERENCES imagery.country(code) ON DELETE SET NULL,
    FOREIGN KEY (country_id) REFERENCES imagery.country(id) ON DELETE SET NULL
);