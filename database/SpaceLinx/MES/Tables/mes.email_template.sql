-- Table: mes.email_template
-- DROP TABLE IF EXISTS mes.email_template;

CREATE TABLE mes.email_template (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     template_code VARCHAR(100) NOT NULL UNIQUE,
     name VARCHAR(255) NOT NULL,
     subject VARCHAR(500) NOT NULL,
     body TEXT NOT NULL,
     description TEXT,
     is_html BOOLEAN DEFAULT TRUE,
     is_active BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     created_by VARCHAR(255) NOT NULL,
     updated_at TIMESTAMP,
     updated_by VARCHAR(255),
     deleted_at TIMESTAMP,
     deleted_by VARCHAR(255)
);