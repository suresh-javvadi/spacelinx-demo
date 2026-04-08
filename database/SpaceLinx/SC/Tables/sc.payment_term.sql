CREATE TABLE sc.payment_term (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description VARCHAR(100),
	due_days INTEGER NOT NULL CHECK (due_days >= 0),
    discount_days INTEGER CHECK (discount_days >= 0),
	discount_percent DECIMAL(5,2) CHECK (discount_percent >= 0 AND discount_percent <= 100),
	payment_terms TEXT,
    payment_term_type VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,	
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255)
);