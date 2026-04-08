CREATE TABLE pm.task_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES pm.task(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'Created', 'Updated', 'Deleted', 'Restored',
        'StatusChanged', 'PriorityChanged', 'AssigneeAdded', 'AssigneeRemoved',
        'DueDateChanged', 'StartDateChanged', 'ProgressChanged',
        'CommentAdded', 'CommentEdited', 'CommentDeleted',
        'DependencyAdded', 'DependencyRemoved',
        'SubtaskAdded', 'SubtaskRemoved',
        'AttachmentAdded', 'AttachmentRemoved',
        'Moved', 'TimeLogged'
    )),
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL
);

-- Index for finding all activities for a task (chronological)
CREATE INDEX idx_task_activity_task_id ON pm.task_activity(task_id, created_at DESC);

-- Index for filtering by activity type
CREATE INDEX idx_task_activity_type ON pm.task_activity(task_id, activity_type);

-- Index for user activity feed (what has this user done)
CREATE INDEX idx_task_activity_created_by ON pm.task_activity(created_by, created_at DESC);

-- Comments
COMMENT ON TABLE pm.task_activity IS 'Activity log for task changes - read-only audit trail';
COMMENT ON COLUMN pm.task_activity.activity_type IS 'Type of activity that occurred';
COMMENT ON COLUMN pm.task_activity.field_changed IS 'Name of field that was changed (for Updates)';
COMMENT ON COLUMN pm.task_activity.old_value IS 'Previous value (for tracking changes)';
COMMENT ON COLUMN pm.task_activity.new_value IS 'New value (for tracking changes)';
COMMENT ON COLUMN pm.task_activity.description IS 'Human-readable description of the activity';
