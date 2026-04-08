-- Table: mes.guide_check_out_history
-- DROP TABLE IF EXISTS mes.guide_checkout_history;

CREATE TABLE mes.guide_check_out_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    guide_id UUID NOT NULL,             
    is_checked_out BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,          
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE                         
);