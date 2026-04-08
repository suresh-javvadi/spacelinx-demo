-- Table: imagery.request_comment
-- DROP TABLE IF EXISTS imagery.request_comment;

CREATE TABLE imagery.request_comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    email VARCHAR(200) NOT NULL,
    comment VARCHAR(500) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (request_id) REFERENCES imagery.request(id) ON DELETE SET NULL
);