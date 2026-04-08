-- Alter pm.task table to add new columns for enhanced task management
-- Run this after pm.generate_task_code function exists

-- Add sequence for task codes if not exists
CREATE SEQUENCE IF NOT EXISTS pm.task_code_seq START 1;

-- Add new columns to pm.task table
ALTER TABLE pm.task ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES pm.task(id) ON DELETE SET NULL;
ALTER TABLE pm.task ADD COLUMN IF NOT EXISTS task_code VARCHAR(50);
ALTER TABLE pm.task ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE pm.task ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(8, 2);
ALTER TABLE pm.task ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(8, 2);
ALTER TABLE pm.task ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;
ALTER TABLE pm.task ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) DEFAULT 'Task';
ALTER TABLE pm.task ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE pm.task ADD COLUMN IF NOT EXISTS board_column_id UUID;

-- Add check constraints
ALTER TABLE pm.task DROP CONSTRAINT IF EXISTS chk_progress_percent;
ALTER TABLE pm.task ADD CONSTRAINT chk_progress_percent CHECK (progress_percent >= 0 AND progress_percent <= 100);

ALTER TABLE pm.task DROP CONSTRAINT IF EXISTS chk_task_type;
ALTER TABLE pm.task ADD CONSTRAINT chk_task_type CHECK (task_type IN ('Task', 'Milestone', 'SubTask'));

-- Update existing rows to have task_code if null
UPDATE pm.task SET task_code = pm.generate_task_code() WHERE task_code IS NULL;

-- Make task_code NOT NULL and UNIQUE after populating existing rows
ALTER TABLE pm.task ALTER COLUMN task_code SET DEFAULT pm.generate_task_code();

-- Create index for parent_task_id for hierarchy queries
CREATE INDEX IF NOT EXISTS idx_task_parent_task_id ON pm.task(parent_task_id);

-- Create index for project_id for faster project-based queries
CREATE INDEX IF NOT EXISTS idx_task_project_id ON pm.task(project_id);

-- Create index for board_column_id for kanban board queries
CREATE INDEX IF NOT EXISTS idx_task_board_column_id ON pm.task(board_column_id);

-- Create index for assigned_to_id for my-tasks queries
CREATE INDEX IF NOT EXISTS idx_task_assigned_to_id ON pm.task(assigned_to_id);

-- Add comment
COMMENT ON COLUMN pm.task.parent_task_id IS 'Self-referential FK for subtask hierarchy';
COMMENT ON COLUMN pm.task.task_code IS 'Auto-generated unique task code (TSK-XXXXXX)';
COMMENT ON COLUMN pm.task.start_date IS 'Task start date for Gantt chart';
COMMENT ON COLUMN pm.task.estimated_hours IS 'Estimated hours to complete task';
COMMENT ON COLUMN pm.task.actual_hours IS 'Actual hours logged against task';
COMMENT ON COLUMN pm.task.progress_percent IS 'Completion percentage (0-100)';
COMMENT ON COLUMN pm.task.task_type IS 'Task, Milestone, or SubTask';
COMMENT ON COLUMN pm.task.sort_order IS 'Sort order within parent or project';
COMMENT ON COLUMN pm.task.board_column_id IS 'FK to pm.board_column for Kanban boards';
