-- Table: mes.work_order_step
-- DROP TABLE IF EXISTS mes.work_order_step;

CREATE TABLE mes.work_order_step (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL,
    guide_step_id UUID NOT NULL, 
    technician_id UUID,
    manager_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    execution_time INTERVAL,     
    captured_time INTERVAL,       
    image_id UUID,
    comment varchar(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY(work_order_id) REFERENCES mes.work_order(id) ON DELETE CASCADE,
    FOREIGN KEY(guide_step_id) REFERENCES mes.guide_step(id),
    FOREIGN KEY(image_id) REFERENCES common.image(id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES application.user(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES application.user(id) ON DELETE SET NULL
);