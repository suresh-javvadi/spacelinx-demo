-- Table: application.customer
-- DROP TABLE IF EXISTS application.customer;

CREATE TABLE application.customer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    name VARCHAR(255) NOT NULL,       
    description TEXT,    
   tax_number VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    customer_address_id UUID, --multiple addresses
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,         
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,          
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (customer_address_id) REFERENCES common.address(id) ON DELETE SET NULL
);