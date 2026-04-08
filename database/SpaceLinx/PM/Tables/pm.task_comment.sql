CREATE TABLE pm.task_comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES pm.task(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES pm.task_comment(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    mentions JSONB DEFAULT '[]'::JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255)
);

-- Index for finding all comments for a task
CREATE INDEX idx_task_comment_task_id ON pm.task_comment(task_id) WHERE deleted_at IS NULL;

-- Index for finding replies to a comment
CREATE INDEX idx_task_comment_parent_id ON pm.task_comment(parent_comment_id) WHERE deleted_at IS NULL;

-- Index for created_at to sort comments chronologically
CREATE INDEX idx_task_comment_created_at ON pm.task_comment(task_id, created_at) WHERE deleted_at IS NULL;

-- GIN index for searching mentions
CREATE INDEX idx_task_comment_mentions ON pm.task_comment USING GIN (mentions) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE pm.task_comment IS 'Comments and discussions on tasks';
COMMENT ON COLUMN pm.task_comment.parent_comment_id IS 'Self-referential FK for threaded replies';
COMMENT ON COLUMN pm.task_comment.content IS 'Comment text content (may include markdown)';
COMMENT ON COLUMN pm.task_comment.mentions IS 'JSON array of user IDs mentioned with @, e.g., ["uuid1", "uuid2"]';
