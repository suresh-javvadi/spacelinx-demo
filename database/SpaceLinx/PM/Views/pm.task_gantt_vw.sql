CREATE OR REPLACE VIEW pm.task_gantt_vw AS
SELECT
    t.id,
    t.task_code,
    t.name,
    t.description,
    t.project_id,
    t.parent_task_id,
    t.status,
    t.priority,
    t.task_type,
    t.start_date,
    t.due_date,
    t.progress_percent,
    t.estimated_hours,
    t.actual_hours,
    t.sort_order,
    t.assigned_to_id,
    t.is_active,
    t.created_at,
    t.created_by,
    -- Project info
    p.name AS project_name,
    p.project_code,
    -- Assigned user info
    s.first_name AS assignee_first_name,
    s.last_name AS assignee_last_name,
    s.email AS assignee_email,
    -- Parent task info
    pt.name AS parent_task_name,
    pt.task_code AS parent_task_code,
    -- Dependencies aggregated as JSON array
    (
        SELECT COALESCE(json_agg(json_build_object(
            'id', td.id,
            'predecessorTaskId', td.predecessor_task_id,
            'predecessorTaskName', pred.name,
            'predecessorTaskCode', pred.task_code,
            'dependencyType', td.dependency_type,
            'lagDays', td.lag_days
        )), '[]'::json)
        FROM pm.task_dependency td
        JOIN pm.task pred ON td.predecessor_task_id = pred.id
        WHERE td.successor_task_id = t.id
        AND td.deleted_at IS NULL
    ) AS dependencies,
    -- Subtask count
    (
        SELECT COUNT(*)
        FROM pm.task st
        WHERE st.parent_task_id = t.id
        AND st.deleted_at IS NULL
    ) AS subtask_count,
    -- Completed subtask count (for roll-up progress)
    (
        SELECT COUNT(*)
        FROM pm.task st
        WHERE st.parent_task_id = t.id
        AND st.deleted_at IS NULL
        AND st.status = 'Completed'
    ) AS completed_subtask_count,
    -- Multiple assignees as JSON array
    (
        SELECT COALESCE(json_agg(json_build_object(
            'id', ta.id,
            'userId', ta.user_id,
            'firstName', tas.first_name,
            'lastName', tas.last_name,
            'role', ta.assignee_role
        )), '[]'::json)
        FROM pm.task_assignee ta
        JOIN application.user tas ON ta.user_id = tas.id
        WHERE ta.task_id = t.id
        AND ta.deleted_at IS NULL
    ) AS assignees
FROM pm.task t
LEFT JOIN pm.project p ON t.project_id = p.id
LEFT JOIN application."user" s ON t.assigned_to_id = s.id
LEFT JOIN pm.task pt ON t.parent_task_id = pt.id
WHERE t.deleted_at IS NULL;

COMMENT ON VIEW pm.task_gantt_vw IS 'Aggregated task view for Gantt chart with dependencies and assignees as JSON';
