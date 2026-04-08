-- Table: vm.visitor
-- DROP TABLE IF EXISTS vm.visitor;

CREATE TABLE vm.visitor(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence INT NOT NULL,
    visitor_name VARCHAR(200) NOT NULL,
    visitor_mobile VARCHAR(15),
    visitor_email VARCHAR(200),
    organization VARCHAR(200),
    is_indian_citizen BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);