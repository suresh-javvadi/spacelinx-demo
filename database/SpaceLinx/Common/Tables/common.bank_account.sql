CREATE TABLE common.bank_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    swift_code VARCHAR(20),
    currency_id UUID,
    ifsc_code VARCHAR(20),
    address_id UUID,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
	FOREIGN KEY (address_id) REFERENCES common.address(id) ON DELETE SET NULL,	
    FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL	
);