CREATE TABLE sc.bin_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID,
    bin_code VARCHAR(225) NOT NULL, -- Example: L1-A1-R1
    aisle VARCHAR(255),
    rack VARCHAR(255),
    capacity INT,
    unit_of_measure_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_of_measure_id) REFERENCES mes.unit_of_measure(id) ON DELETE SET NULL
);