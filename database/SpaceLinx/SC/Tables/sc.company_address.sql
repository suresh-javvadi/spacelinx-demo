CREATE TABLE sc.company_address (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    address_id UUID NOT NULL,
	address_type VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,	
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL,
    FOREIGN KEY (address_id) REFERENCES common.address(id) ON DELETE SET NULL
);