CREATE TABLE sc.company_bank_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    bank_account_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,	
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL,
    FOREIGN KEY (bank_account_id) REFERENCES common.bank_account(id) ON DELETE SET NULL
);