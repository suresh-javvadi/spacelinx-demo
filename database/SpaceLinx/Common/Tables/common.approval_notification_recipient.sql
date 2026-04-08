CREATE TABLE common.approval_notification_recipient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type varchar(100) NOT NULL,
    entity_id uuid NOT NULL,
    recipient_user_id uuid NOT NULL,
    recipient_type varchar(50) NULL,  -- "CC", "Watcher", "Stakeholder"
    is_active BOOLEAN NOT NULL DEFAULT TRUE,	
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	created_by VARCHAR(255) NOT NULL,
	updated_at TIMESTAMPTZ,
	updated_by VARCHAR(255),
	deleted_at TIMESTAMPTZ,
	deleted_by VARCHAR(255),
    FOREIGN KEY(recipient_user_id) REFERENCES application.user(id) ON DELETE SET NULL,	
);