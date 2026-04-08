-- Table: imagery.sensor_type
-- DROP TABLE IF EXISTS imagery.sensor_type;

CREATE TABLE imagery.sensor_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INT NOT NULL, 
    code VARCHAR(50) NOT NULL, -- PAN, MS, HSI, TIR, SAR, LIDAR
    name VARCHAR(255) NOT NULL, -- PAN, MS, HSI, TIR, SAR, LIDAR
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);