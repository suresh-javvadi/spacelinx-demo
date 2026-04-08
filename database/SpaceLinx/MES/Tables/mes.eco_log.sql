-- Table: mes.eco_log
-- DROP TABLE IF EXISTS mes.eco_log;
CREATE TABLE mes.eco_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eco_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
	action_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	action_by VARCHAR(255) NOT NULL,
	notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
	FOREIGN KEY (eco_id) REFERENCES mes.eco(id)
);