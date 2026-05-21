-- Migration: Add department and manager fields to requisitions_with_user_vw
-- Work Item: 2411
-- Description:
--   Recreates sc.requisitions_with_user_vw to:
--   1. Add department_id, department_name, and manager_full_name columns
--      by joining the common.department table using r.department_id, and
--      the application."user" table for the head of department.
--
-- This is idempotent — CREATE OR REPLACE VIEW is safe to re-run.

CREATE OR REPLACE VIEW sc.requisitions_with_user_vw AS
SELECT
    r.id,
    r.req_number,
    r.requested_by_id,
    r.title,
    r.project_id,
    r.request_date,
    r.required_by_date,
    r.justification,
    r.priority,
    r.status,
    r.total_estimated_amount,
    r.created_by,
    r.created_at,
    r.approved_by,
    r.approved_date,
    r.rejected_by,
    r.rejected_date,
    r.approver_comment,
    rb.id AS user_id,
    rb.first_name || ' ' || COALESCE(rb.last_name, '') AS user_full_name,
    rb.email AS user_email,
    dept.id AS department_id,
    dept.name AS department_name,
    mgr.first_name || ' ' || COALESCE(mgr.last_name, '') AS manager_full_name,
    po.id AS po_id,
    po.number AS po_number,
    po.status AS po_status
FROM sc.requisition r
JOIN application."user" rb ON rb.id = r.requested_by_id
LEFT JOIN common.department dept ON r.department_id = dept.id
LEFT JOIN application."user" mgr ON dept.head_of_department_user_id = mgr.id AND mgr.deleted_by IS NULL
LEFT JOIN LATERAL (
    SELECT id, number, status
    FROM sc.purchase_order
    WHERE requisition_id = r.id
      AND deleted_by IS NULL
      AND status NOT IN ('Cancelled', 'Rejected')
    ORDER BY created_at DESC
    LIMIT 1
) po ON TRUE
WHERE r.deleted_by IS NULL;
