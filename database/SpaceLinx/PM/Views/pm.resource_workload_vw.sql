CREATE OR REPLACE VIEW pm.resource_workload_vw AS
SELECT
    s.id AS user_id,
    s.first_name,
    s.last_name,
    s.email,
    s.image_url,
    s.department,
    s.job_title,
    -- Total allocations aggregated
    (
        SELECT COALESCE(json_agg(json_build_object(
            'id', ra.id,
            'projectId', ra.project_id,
            'projectName', p.name,
            'taskId', ra.task_id,
            'taskName', t.name,
            'startDate', ra.start_date,
            'endDate', ra.end_date,
            'allocatedHoursPerDay', ra.allocated_hours_per_day,
            'allocationPercent', ra.allocation_percent,
            'allocationType', ra.allocation_type
        )), '[]'::json)
        FROM pm.resource_allocation ra
        LEFT JOIN pm.project p ON ra.project_id = p.id
        LEFT JOIN pm.task t ON ra.task_id = t.id
        WHERE ra.user_id = s.id
        AND ra.deleted_at IS NULL
        AND ra.end_date >= CURRENT_DATE
    ) AS current_allocations,
    -- Total allocated percent for today
    (
        SELECT COALESCE(SUM(ra.allocation_percent), 0)
        FROM pm.resource_allocation ra
        WHERE ra.user_id = s.id
        AND ra.deleted_at IS NULL
        AND CURRENT_DATE BETWEEN ra.start_date AND ra.end_date
    ) AS today_allocation_percent,
    -- Assigned tasks count
    (
        SELECT COUNT(*)
        FROM pm.task t
        WHERE t.assigned_to_id = s.id
        AND t.deleted_at IS NULL
        AND t.status != 'Completed'
    ) AS active_tasks_count,
    -- Tasks as primary assignee
    (
        SELECT COUNT(*)
        FROM pm.task_assignee ta
        WHERE ta.user_id = s.id
        AND ta.deleted_at IS NULL
        AND ta.assignee_role = 'Primary'
        AND EXISTS (
            SELECT 1 FROM pm.task t
            WHERE t.id = ta.task_id
            AND t.deleted_at IS NULL
            AND t.status != 'Completed'
        )
    ) AS primary_assignments_count,
    -- Hours logged this week
    (
        SELECT COALESCE(SUM(te.hours_worked), 0)
        FROM pm.time_entry te
        WHERE te.user_id = s.id
        AND te.deleted_at IS NULL
        AND te.entry_date >= date_trunc('week', CURRENT_DATE)
    ) AS hours_logged_this_week,
    -- Hours logged this month
    (
        SELECT COALESCE(SUM(te.hours_worked), 0)
        FROM pm.time_entry te
        WHERE te.user_id = s.id
        AND te.deleted_at IS NULL
        AND te.entry_date >= date_trunc('month', CURRENT_DATE)
    ) AS hours_logged_this_month,
    -- Overdue tasks count
    (
        SELECT COUNT(*)
        FROM pm.task t
        WHERE t.assigned_to_id = s.id
        AND t.deleted_at IS NULL
        AND t.status NOT IN ('Completed', 'Logged')
        AND t.due_date < CURRENT_DATE
    ) AS overdue_tasks_count
FROM application.user s
WHERE s.deleted_at IS NULL
AND s.is_active = TRUE;

COMMENT ON VIEW pm.resource_workload_vw IS 'Aggregated resource workload view for capacity planning';
