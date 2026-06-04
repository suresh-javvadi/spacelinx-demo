DROP VIEW IF EXISTS pm.resource_workload_vw CASCADE;

CREATE VIEW pm.resource_workload_vw AS
 SELECT id AS user_id,
    first_name,
    last_name,
    email,
    image_url,
    department,
    job_title,
    ( SELECT COALESCE(json_agg(json_build_object('id', ra.id, 'projectId', ra.project_id, 'projectName', p.name, 'taskId', ra.task_id, 'taskName', t.name, 'startDate', ra.start_date, 'endDate', ra.end_date, 'allocatedHoursPerDay', ra.allocated_hours_per_day, 'allocationPercent', ra.allocation_percent, 'allocationType', ra.allocation_type)), '[]'::json) AS "coalesce"
           FROM ((pm.resource_allocation ra
             LEFT JOIN pm.project p ON ((ra.project_id = p.id)))
             LEFT JOIN pm.task t ON ((ra.task_id = t.id)))
          WHERE ((ra.user_id = s.id) AND (ra.deleted_at IS NULL) AND (ra.end_date >= CURRENT_DATE))) AS current_allocations,
    ( SELECT COALESCE(sum(ra.allocation_percent), (0)::bigint) AS "coalesce"
           FROM pm.resource_allocation ra
          WHERE ((ra.user_id = s.id) AND (ra.deleted_at IS NULL) AND (CURRENT_DATE >= ra.start_date) AND (CURRENT_DATE <= ra.end_date))) AS today_allocation_percent,
    ( SELECT count(*) AS count
           FROM pm.task t
          WHERE ((t.assigned_to_id = s.id) AND (t.deleted_at IS NULL) AND ((t.status)::text <> 'Completed'::text))) AS active_tasks_count,
    ( SELECT count(*) AS count
           FROM pm.task_assignee ta
          WHERE ((ta.user_id = s.id) AND (ta.deleted_at IS NULL) AND ((ta.assignee_role)::text = 'Primary'::text) AND (EXISTS ( SELECT 1
                   FROM pm.task t
                  WHERE ((t.id = ta.task_id) AND (t.deleted_at IS NULL) AND ((t.status)::text <> 'Completed'::text)))))) AS primary_assignments_count,
    ( SELECT COALESCE(sum(te.hours_worked), (0)::numeric) AS "coalesce"
           FROM pm.time_entry te
          WHERE ((te.user_id = s.id) AND (te.deleted_at IS NULL) AND (te.entry_date >= date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone)))) AS hours_logged_this_week,
    ( SELECT COALESCE(sum(te.hours_worked), (0)::numeric) AS "coalesce"
           FROM pm.time_entry te
          WHERE ((te.user_id = s.id) AND (te.deleted_at IS NULL) AND (te.entry_date >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)))) AS hours_logged_this_month,
    ( SELECT count(*) AS count
           FROM pm.task t
          WHERE ((t.assigned_to_id = s.id) AND (t.deleted_at IS NULL) AND ((t.status)::text <> ALL (ARRAY[('Completed'::character varying)::text, ('Logged'::character varying)::text])) AND (t.due_date < CURRENT_DATE))) AS overdue_tasks_count
   FROM application."user" s
  WHERE ((deleted_at IS NULL) AND (is_active = true));

ALTER VIEW pm.resource_workload_vw OWNER TO spacelinxadmin;
GRANT SELECT ON pm.resource_workload_vw TO spacelinxuser;
