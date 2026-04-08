CREATE TABLE sc.company_contact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    contact_id UUID NOT NULL,
	contact_type VARCHAR(50) NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL,
    FOREIGN KEY (contact_id) REFERENCES common.contact(id) ON DELETE SET NULL
);