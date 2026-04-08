CREATE TABLE pm.dashboard_widget (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    widget_type VARCHAR(50) NOT NULL CHECK (widget_type IN (
        'TaskSummary', 'ProjectProgress', 'OverdueTasks', 'MyTasks',
        'TeamWorkload', 'RecentActivity', 'TimeLoggedChart', 'MilestoneTracker',
        'PriorityBreakdown', 'StatusDistribution'
    )),
    title VARCHAR(100),
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 4,
    height INTEGER NOT NULL DEFAULT 2,
    settings JSONB DEFAULT '{}'::JSONB,
    project_id UUID REFERENCES pm.project(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255)
);

-- Index for user-based queries (dashboard load)
CREATE INDEX idx_dashboard_widget_user_id ON pm.dashboard_widget(user_id) WHERE deleted_at IS NULL;

-- Index for project-specific widgets
CREATE INDEX idx_dashboard_widget_project_id ON pm.dashboard_widget(project_id) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE pm.dashboard_widget IS 'User-configurable dashboard widgets for project management';
COMMENT ON COLUMN pm.dashboard_widget.user_id IS 'Reference to the user who owns this widget configuration';
COMMENT ON COLUMN pm.dashboard_widget.widget_type IS 'Type of widget to render';
COMMENT ON COLUMN pm.dashboard_widget.title IS 'Custom title for the widget (optional)';
COMMENT ON COLUMN pm.dashboard_widget.position_x IS 'Grid X position (react-grid-layout)';
COMMENT ON COLUMN pm.dashboard_widget.position_y IS 'Grid Y position (react-grid-layout)';
COMMENT ON COLUMN pm.dashboard_widget.width IS 'Widget width in grid units';
COMMENT ON COLUMN pm.dashboard_widget.height IS 'Widget height in grid units';
COMMENT ON COLUMN pm.dashboard_widget.settings IS 'Widget-specific settings as JSON (filters, display options, etc.)';
COMMENT ON COLUMN pm.dashboard_widget.project_id IS 'Optional: Filter widget data to specific project';
