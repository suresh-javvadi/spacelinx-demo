-- Table: mes.kit_serial
-- DROP TABLE IF EXISTS mes.kit_serial;
 
CREATE TABLE mes.kit_serial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID NOT NULL,
    part_id UUID NOT NULL,
    serialno varchar(255),
    status varchar(255) NOT NULL DEFAULT 'Unconsumed',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL,
    UNIQUE (kit_id, part_id, serialno)
);