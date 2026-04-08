-- Table: common.approval_log
CREATE TABLE common.approval_log
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    entity_type character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    action_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action_by character varying(255) NOT NULL,
    stage_number integer,
    notes text,
    previous_status character varying(50),
    new_status character varying(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,	
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	created_by VARCHAR(255) NOT NULL,
	updated_at TIMESTAMPTZ,
	updated_by VARCHAR(255),
	deleted_at TIMESTAMPTZ,
	deleted_by VARCHAR(255),
);