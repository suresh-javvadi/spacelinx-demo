CREATE TABLE pm.task_assignee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES pm.task(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES application.user(id) ON DELETE CASCADE,
    assignee_role VARCHAR(50) NOT NULL DEFAULT 'Primary' CHECK (assignee_role IN ('Primary', 'Secondary', 'Reviewer', 'Watcher')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    CONSTRAINT uq_task_assignee UNIQUE (task_id, user_id)
);

-- Index for finding all assignees for a task
CREATE INDEX idx_task_assignee_task_id ON pm.task_assignee(task_id) WHERE deleted_at IS NULL;

-- Index for finding all tasks assigned to a user member (my-tasks query)
CREATE INDEX idx_task_assignee_user_id ON pm.task_assignee(user_id) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE pm.task_assignee IS 'Multiple assignees per task with different roles';
COMMENT ON COLUMN pm.task_assignee.assignee_role IS 'Primary=main assignee, Secondary=helper, Reviewer=approval, Watcher=notifications only';
COMMENT ON COLUMN pm.task_assignee.assigned_at IS 'When the user member was assigned to this task';
