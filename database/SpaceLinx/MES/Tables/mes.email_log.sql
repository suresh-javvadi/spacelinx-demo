-- Table: mes.email_log
-- DROP TABLE IF EXISTS mes.email_log;

CREATE TABLE mes.email_log (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     template_code VARCHAR(100) NOT NULL,
     entity_type VARCHAR(100),
     entity_id UUID,
     recipient_email VARCHAR(255) NOT NULL,
     subject VARCHAR(500) NOT NULL,
     body TEXT NOT NULL,
     status VARCHAR(50) NOT NULL DEFAULT 'Pending',
     sent_at TIMESTAMP,
     error_message TEXT,
     retry_count INT DEFAULT 0,
     is_active BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     created_by VARCHAR(255) NOT NULL,
     updated_at TIMESTAMP,
     updated_by VARCHAR(255),
     deleted_at TIMESTAMP,
     deleted_by VARCHAR(255)
);