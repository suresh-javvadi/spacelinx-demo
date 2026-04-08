-- Table: vm.visitor_request_document
-- DROP TABLE IF EXISTS vm.visitor_request_document;

CREATE TABLE vm.visitor_request_document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    DocumentPath VARCHAR(500) NOT NULL,
    DocumentName VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (request_id) REFERENCES vm.visitor_request(id) ON DELETE SET NULL
);