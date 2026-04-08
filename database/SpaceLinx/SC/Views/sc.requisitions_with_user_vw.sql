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
    rb.email AS user_email
FROM sc.requisition r
JOIN application."user" rb ON rb.id = r.requested_by_id WHERE r.deleted_by IS NULL;