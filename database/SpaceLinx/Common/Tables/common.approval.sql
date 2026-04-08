CREATE TABLE common.approval (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(255) NOT NULL,
    entity_id UUID NOT NULL,
    stage_number INTEGER NOT NULL CHECK (stage_number >= 1),
    approver_id UUID NOT NULL,
    status VARCHAR(255) NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled', 'Removed'))DEFAULT 'Pending',
    acted_at TIMESTAMPTZ,
    comment TEXT,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,	
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	created_by VARCHAR(255) NOT NULL,
	updated_at TIMESTAMPTZ,
	updated_by VARCHAR(255),
	deleted_at TIMESTAMPTZ,
	deleted_by VARCHAR(255),
	FOREIGN KEY(approver_id) REFERENCES application.user(id) ON DELETE SET NULL,	
    UNIQUE (entity_id, stage_number, approver_id, deleted_at)
);