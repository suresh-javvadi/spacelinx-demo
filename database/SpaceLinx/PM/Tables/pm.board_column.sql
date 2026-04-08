CREATE TABLE pm.board_column (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES pm.project(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(50) DEFAULT '#1976d2',
    wip_limit INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    maps_to_status VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255)
);

-- Index for project-based queries
CREATE INDEX idx_board_column_project_id ON pm.board_column(project_id) WHERE deleted_at IS NULL;

-- Index for ordering columns within a project
CREATE INDEX idx_board_column_position ON pm.board_column(project_id, position) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE pm.board_column IS 'Kanban board columns for each project';
COMMENT ON COLUMN pm.board_column.position IS 'Order position of column from left to right';
COMMENT ON COLUMN pm.board_column.color IS 'Column header color (hex code)';
COMMENT ON COLUMN pm.board_column.wip_limit IS 'Work-in-progress limit for the column (null = no limit)';
COMMENT ON COLUMN pm.board_column.is_default IS 'Whether this is the default column for new tasks';
COMMENT ON COLUMN pm.board_column.maps_to_status IS 'Task status that this column maps to (e.g., To Do, In Progress)';

-- Add foreign key from pm.task to pm.board_column
ALTER TABLE pm.task ADD CONSTRAINT task_board_column_id_fkey
    FOREIGN KEY (board_column_id) REFERENCES pm.board_column(id) ON DELETE SET NULL;

-- Insert default columns function for new projects
CREATE OR REPLACE FUNCTION pm.create_default_board_columns(p_project_id UUID, p_created_by VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO pm.board_column (project_id, name, position, color, maps_to_status, is_default, created_by)
    VALUES
        (p_project_id, 'To Do', 0, '#9e9e9e', 'To Do', TRUE, p_created_by),
        (p_project_id, 'In Progress', 1, '#2196f3', 'In Progress', FALSE, p_created_by),
        (p_project_id, 'Review', 2, '#ff9800', 'Logged', FALSE, p_created_by),
        (p_project_id, 'Done', 3, '#4caf50', 'Completed', FALSE, p_created_by);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION pm.create_default_board_columns IS 'Creates default Kanban columns for a new project';
