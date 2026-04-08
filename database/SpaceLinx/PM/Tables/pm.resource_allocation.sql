CREATE TABLE pm.resource_allocation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES application.user(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES pm.project(id) ON DELETE CASCADE,
    task_id UUID REFERENCES pm.task(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    allocated_hours_per_day DECIMAL(4, 2) NOT NULL DEFAULT 8.0 CHECK (allocated_hours_per_day > 0 AND allocated_hours_per_day <= 24),
    allocation_percent INTEGER NOT NULL DEFAULT 100 CHECK (allocation_percent > 0 AND allocation_percent <= 100),
    allocation_type VARCHAR(50) NOT NULL DEFAULT 'Project' CHECK (allocation_type IN ('Project', 'Task', 'Overhead', 'Leave', 'Training')),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    CONSTRAINT chk_date_range CHECK (end_date >= start_date)
);

-- Index for user-based queries (workload view)
CREATE INDEX idx_resource_allocation_user_id ON pm.resource_allocation(user_id) WHERE deleted_at IS NULL;

-- Index for project-based queries
CREATE INDEX idx_resource_allocation_project_id ON pm.resource_allocation(project_id) WHERE deleted_at IS NULL;

-- Index for date range queries
CREATE INDEX idx_resource_allocation_dates ON pm.resource_allocation(start_date, end_date) WHERE deleted_at IS NULL;

-- Composite index for workload calculations
CREATE INDEX idx_resource_allocation_user_dates ON pm.resource_allocation(user_id, start_date, end_date) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE pm.resource_allocation IS 'Resource allocation tracking for capacity planning';
COMMENT ON COLUMN pm.resource_allocation.user_id IS 'User member being allocated';
COMMENT ON COLUMN pm.resource_allocation.project_id IS 'Project the resource is allocated to';
COMMENT ON COLUMN pm.resource_allocation.task_id IS 'Optional: Specific task within the project';
COMMENT ON COLUMN pm.resource_allocation.start_date IS 'Start date of allocation period';
COMMENT ON COLUMN pm.resource_allocation.end_date IS 'End date of allocation period';
COMMENT ON COLUMN pm.resource_allocation.allocated_hours_per_day IS 'Hours per day allocated to this work';
COMMENT ON COLUMN pm.resource_allocation.allocation_percent IS 'Percentage of daily capacity (100% = full time)';
COMMENT ON COLUMN pm.resource_allocation.allocation_type IS 'Type of allocation (Project, Task, Overhead, Leave, Training)';
