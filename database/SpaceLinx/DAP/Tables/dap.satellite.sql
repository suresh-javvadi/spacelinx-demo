-- Table: dap.satellite
-- DROP TABLE IF EXISTS dap.satellite;

CREATE TABLE dap.satellite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    international_designator VARCHAR(50), -- International Designator code given by the Global Space Surveillance Network (GSSN)
    country_id UUID NOT NULL,
    country_code VARCHAR(50),
    launch_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    launch_site VARCHAR(255),
    decay_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Expiry date
    period_min FLOAT, -- Orbital period in minutes generally 90 minutes
    inclination_degree FLOAT, -- Orbital inclination in degrees
    perigee_km INT, -- Nearest point to earth
    apogee_km INT, -- Farthest point to earth
    operational_status VARCHAR(50), -- Operational status of the satellite - IsActive, IsInactive, IsDecommissioned, IsLost, IsMaintenance
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    FOREIGN KEY (country_code) REFERENCES dap.country(code) ON DELETE SET NULL,
    FOREIGN KEY (country_id) REFERENCES dap.country(id) ON DELETE SET NULL
);