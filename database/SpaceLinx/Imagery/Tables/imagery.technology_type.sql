-- Table: imagery.technology_type
-- DROP TABLE IF EXISTS imagery.technology_type;

CREATE TABLE imagery.technology_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,  -- Technology type of the sensor
    description VARCHAR(255), -- Technology Type notes
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);