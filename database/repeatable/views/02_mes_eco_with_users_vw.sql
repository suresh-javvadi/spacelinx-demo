DROP VIEW IF EXISTS mes.eco_with_users_vw CASCADE;

CREATE VIEW mes.eco_with_users_vw AS
 SELECT eco.id,
    eco.number,
    eco.name,
    eco.reason_for_change,
    eco.description,
    eco.change_type,
    eco.impact_analysis,
    eco.priority,
    eco.requestor,
    eco.approver,
    eco.planned_implementation_date,
    eco.approved_by,
    eco.approved_date,
    eco.status,
    eco.is_active,
    eco.created_at,
    eco.created_by,
    eco.updated_at,
    eco.updated_by,
    req_user.id AS requestor_id,
    (((req_user.first_name)::text || ' '::text) || (req_user.last_name)::text) AS requestor_full_name,
    req_user.email AS requestor_email,
    json_agg(json_build_object('approval_id', appr.id, 'approver_id', appr.approver_id, 'status', appr.status, 'comment', appr.comment, 'full_name', (((appr_user.first_name)::text || ' '::text) || (appr_user.last_name)::text), 'email', appr_user.email)) FILTER (WHERE (appr.id IS NOT NULL)) AS approvers
   FROM (((mes.eco eco
     LEFT JOIN application."user" req_user ON ((((eco.requestor)::text = (req_user.email)::text) AND (req_user.deleted_by IS NULL))))
     LEFT JOIN common.approval appr ON (((appr.entity_id = eco.id) AND (appr.deleted_by IS NULL))))
     LEFT JOIN application."user" appr_user ON (((appr.approver_id = appr_user.id) AND (appr_user.deleted_by IS NULL))))
  WHERE (eco.deleted_by IS NULL)
  GROUP BY eco.id, eco.number, eco.name, eco.reason_for_change, eco.description, eco.change_type, eco.impact_analysis, eco.priority, eco.requestor, eco.approver, eco.planned_implementation_date, eco.approved_by, eco.approved_date, eco.status, eco.is_active, eco.created_at, eco.created_by, eco.updated_at, eco.updated_by, req_user.id, req_user.first_name, req_user.last_name, req_user.email;

ALTER VIEW mes.eco_with_users_vw OWNER TO spacelinxadmin;
GRANT SELECT ON mes.eco_with_users_vw TO spacelinxuser;
