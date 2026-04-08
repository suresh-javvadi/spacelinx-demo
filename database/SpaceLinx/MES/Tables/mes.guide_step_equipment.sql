-- Table: mes.guide_step_equipment
-- DROP TABLE IF EXISTS mes.guide_step_equipment;

CREATE TABLE mes.guide_step_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_type VARCHAR(255) NOT NULL,     
    part_id UUID,
    tool_id UUID,
    machine_id UUID,
    quantity INT NOT NULL,
    guide_step_id UUID NOT NULL,
    guide_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (guide_step_id) REFERENCES mes.guide_step(id) ON DELETE CASCADE,
    FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (tool_id) REFERENCES mes.tool(id) ON DELETE SET NULL,
    FOREIGN KEY (machine_id) REFERENCES mes.machine(id) ON DELETE SET NULL
);