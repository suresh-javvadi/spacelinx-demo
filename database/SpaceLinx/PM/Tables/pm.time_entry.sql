CREATE TABLE pm.time_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES pm.task(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES application.user(id) ON DELETE RESTRICT,
    entry_date DATE NOT NULL,
    hours_worked DECIMAL(5, 2) NOT NULL CHECK (hours_worked > 0 AND hours_worked <= 24),
    description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    work_type VARCHAR(50) DEFAULT 'Development',

    -- Standard audit columns
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255)
);

-- Indexes for common queries
CREATE INDEX idx_time_entry_task_id ON pm.time_entry(task_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_entry_user_id ON pm.time_entry(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_entry_entry_date ON pm.time_entry(entry_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_entry_task_user ON pm.time_entry(task_id, user_id) WHERE deleted_at IS NULL;

-- Composite index for date range queries
CREATE INDEX idx_time_entry_date_range ON pm.time_entry(user_id, entry_date) WHERE deleted_at IS NULL;

COMMENT ON TABLE pm.time_entry IS 'Time entries logged against tasks';
COMMENT ON COLUMN pm.time_entry.task_id IS 'Reference to the task this time was logged against';
COMMENT ON COLUMN pm.time_entry.user_id IS 'User member who logged the time';
COMMENT ON COLUMN pm.time_entry.entry_date IS 'Date the work was performed';
COMMENT ON COLUMN pm.time_entry.hours_worked IS 'Number of hours worked (max 24)';
COMMENT ON COLUMN pm.time_entry.billable IS 'Whether this time is billable to the client';
COMMENT ON COLUMN pm.time_entry.work_type IS 'Type of work performed (Development, Design, Testing, etc.)';
