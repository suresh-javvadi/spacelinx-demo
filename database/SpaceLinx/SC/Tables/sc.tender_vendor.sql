CREATE TABLE sc.tender_vendor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL,
    company_id UUID,
    invited_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    response_deadline DATE,
    status VARCHAR(50) DEFAULT 'Invited',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (tender_id) REFERENCES sc.tender(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL
);