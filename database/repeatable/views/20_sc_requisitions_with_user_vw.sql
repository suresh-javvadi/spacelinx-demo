DROP VIEW IF EXISTS sc.requisitions_with_user_vw CASCADE;

CREATE VIEW sc.requisitions_with_user_vw AS
 SELECT r.id,
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
    (((rb.first_name)::text || ' '::text) || (COALESCE(rb.last_name, ''::character varying))::text) AS user_full_name,
    rb.email AS user_email,
    po.id AS po_id,
    po.number AS po_number,
    po.status AS po_status,
    dept.id AS department_id,
    dept.name AS department_name,
    (((mgr.first_name)::text || ' '::text) || (COALESCE(mgr.last_name, ''::character varying))::text) AS manager_full_name
   FROM ((((sc.requisition r
     JOIN application."user" rb ON ((rb.id = r.requested_by_id)))
     LEFT JOIN common.department dept ON ((r.department_id = dept.id)))
     LEFT JOIN application."user" mgr ON (((dept.head_of_department_user_id = mgr.id) AND (mgr.deleted_by IS NULL))))
     LEFT JOIN LATERAL ( SELECT purchase_order.id,
            purchase_order.number,
            purchase_order.status
           FROM sc.purchase_order
          WHERE ((purchase_order.requisition_id = r.id) AND (purchase_order.deleted_by IS NULL) AND ((purchase_order.status)::text <> ALL (ARRAY[('Cancelled'::character varying)::text, ('Rejected'::character varying)::text])))
          ORDER BY purchase_order.created_at DESC
         LIMIT 1) po ON (true))
  WHERE (r.deleted_by IS NULL);

ALTER VIEW sc.requisitions_with_user_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.requisitions_with_user_vw TO spacelinxuser;
