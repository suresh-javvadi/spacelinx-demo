-- Table: mes.work_order_task
-- DROP TABLE IF EXISTS mes.work_order_task;

CREATE TABLE mes.work_order_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL,
    work_order_step_id UUID NOT NULL,
    guide_step_task_id UUID NOT NULL,
    task_response JSON,
    status VARCHAR(255) NOT NULL DEFAULT 'Pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE CASCADE,
    FOREIGN KEY (work_order_step_id) REFERENCES mes.work_order_step(id),
    FOREIGN KEY (guide_step_task_id) REFERENCES mes.guide_step_task(id),
    UNIQUE (work_order_id, guide_step_task_id)
);