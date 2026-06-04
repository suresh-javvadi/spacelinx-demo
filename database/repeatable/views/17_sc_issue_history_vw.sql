DROP VIEW IF EXISTS sc.issue_history_vw CASCADE;

CREATE VIEW sc.issue_history_vw AS
 SELECT smli.id AS stock_movement_line_item_id,
    smli.part_id,
    sm.movement_number,
    sm.movement_date AS issued_date,
    sm.department,
    NULLIF(concat(u.first_name, ' ', u.last_name), ' '::text) AS responsible_person,
    smli.quantity AS issued_quantity,
    b.bin_code AS issued_bin,
    p.name AS project_name,
    sm.movement_type,
    smli.created_by,
    smli.tracking_id
   FROM ((((sc.stock_movement_line_item smli
     JOIN sc.stock_movement sm ON ((smli.stock_movement_id = sm.id)))
     LEFT JOIN application."user" u ON ((sm.performed_by_id = u.id)))
     LEFT JOIN sc.bin_management b ON ((sm.from_bin_id = b.id)))
     LEFT JOIN pm.project p ON ((sm.project_id = p.id)))
  WHERE (((sm.movement_type)::text = 'Issued'::text) AND (sm.deleted_by IS NULL) AND (smli.deleted_by IS NULL));

ALTER VIEW sc.issue_history_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.issue_history_vw TO spacelinxuser;
