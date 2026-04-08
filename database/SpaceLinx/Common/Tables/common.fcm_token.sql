-- Table: common.fcm_token
-- DROP TABLE IF EXISTS common.fcm_token;

CREATE TABLE common.fcm_token (
    id UUID DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_token VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    PRIMARY KEY (email, device_id)
);