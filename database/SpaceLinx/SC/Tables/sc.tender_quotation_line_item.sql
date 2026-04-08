CREATE TABLE sc.tender_quotation_line_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_quotation_id UUID NOT NULL,
    tender_line_item_id UUID,
    unit_price NUMERIC(18,4) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(18,4) NOT NULL DEFAULT 0,
    lead_time_days INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (tender_quotation_id) REFERENCES sc.tender_quotation(id) ON DELETE CASCADE,
    FOREIGN KEY (tender_line_item_id) REFERENCES sc.tender_line_item(id) ON DELETE SET NULL
);