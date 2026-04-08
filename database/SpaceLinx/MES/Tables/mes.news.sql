-- Table: mes.news
-- DROP TABLE IF EXISTS mes.news;

CREATE TABLE mes.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) UNIQUE NOT NULL,     
    news_type_id UUID NOT NULL,
    hyperlink VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (news_type_id) REFERENCES mes.news_type(id) ON DELETE SET NULL
);