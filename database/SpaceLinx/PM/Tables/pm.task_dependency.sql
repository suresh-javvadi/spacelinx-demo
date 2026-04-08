CREATE TABLE pm.task_dependency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    predecessor_task_id UUID NOT NULL REFERENCES pm.task(id) ON DELETE CASCADE,
    successor_task_id UUID NOT NULL REFERENCES pm.task(id) ON DELETE CASCADE,
    dependency_type VARCHAR(10) NOT NULL DEFAULT 'FS' CHECK (dependency_type IN ('FS', 'SS', 'FF', 'SF')),
    lag_days INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    CONSTRAINT uq_task_dependency UNIQUE (predecessor_task_id, successor_task_id),
    CONSTRAINT chk_no_self_dependency CHECK (predecessor_task_id != successor_task_id)
);

-- Index for finding all dependencies for a task
CREATE INDEX idx_task_dependency_predecessor ON pm.task_dependency(predecessor_task_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_dependency_successor ON pm.task_dependency(successor_task_id) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE pm.task_dependency IS 'Task dependencies for Gantt chart scheduling';
COMMENT ON COLUMN pm.task_dependency.dependency_type IS 'FS=Finish-to-Start, SS=Start-to-Start, FF=Finish-to-Finish, SF=Start-to-Finish';
COMMENT ON COLUMN pm.task_dependency.lag_days IS 'Number of days delay between linked tasks (can be negative for lead)';
