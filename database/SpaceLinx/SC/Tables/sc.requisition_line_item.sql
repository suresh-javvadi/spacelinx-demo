CREATE TABLE sc.requisition_line_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisition_id UUID NOT NULL,
	part_id UUID NOT NULL,	
    quantity INT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY(requisition_id) REFERENCES sc.requisition(id) ON DELETE SET NULL,
    FOREIGN KEY(part_id) REFERENCES mes.part(id) ON DELETE SET NULL
);
