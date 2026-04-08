-- Table: mes.guide_step_task
-- DROP TABLE IF EXISTS mes.guide_step_task;

CREATE TABLE mes.guide_step_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(450) NOT NULL,
    type VARCHAR(50) NOT NULL,
    taskdetails JSON,
    description Text,
    ismandatory INT NOT NULL,
    guide_step_id UUID NOT NULL,
    guide_id UUID NOT NULL,
    sequence INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (guide_step_id) REFERENCES mes.guide_step(id) ON DELETE CASCADE,
    FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE
);