-- Table: vm.visitor_request_visitor
-- DROP TABLE IF EXISTS vm.visitor_request_visitor;

CREATE TABLE vm.visitor_request_visitor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    visitor_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (request_id) REFERENCES vm.visitor_request(id) ON DELETE SET NULL,
    FOREIGN KEY (visitor_id) REFERENCES vm.visitor(id) ON DELETE SET NULL
);