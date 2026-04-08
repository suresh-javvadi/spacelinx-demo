CREATE TABLE sc.scrap_line_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scrap_request_id UUID NOT NULL,
    part_id UUID NOT NULL,
    tracking_type VARCHAR(50) CHECK (tracking_type IN ('None','Batch','Serial')),
    tracking_id VARCHAR(255),  
    scrap_quantity INT NOT NULL,
    reason TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (scrap_request_id) REFERENCES sc.scrap_request(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL
);