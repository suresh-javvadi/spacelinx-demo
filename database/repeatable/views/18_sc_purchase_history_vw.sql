DROP VIEW IF EXISTS sc.purchase_history_vw CASCADE;

CREATE VIEW sc.purchase_history_vw AS
 SELECT gli.id AS grn_line_item_id,
    gli.part_id,
    grn.grn_number,
    po.number AS po_number,
    grn.received_date,
    gli.received_quantity,
    c.name AS vendor_name,
    p.name AS project_name,
    NULLIF(concat(u.first_name, ' ', u.last_name), ' '::text) AS received_by,
    gli.tracking_id,
    gli.created_by
   FROM (((((sc.grn_line_item gli
     JOIN sc.goods_receipt_note grn ON ((gli.grn_id = grn.id)))
     LEFT JOIN sc.purchase_order po ON ((grn.purchase_order_id = po.id)))
     LEFT JOIN sc.company c ON ((po.company_id = c.id)))
     LEFT JOIN pm.project p ON ((po.project_id = p.id)))
     LEFT JOIN application."user" u ON ((grn.received_by_id = u.id)))
  WHERE ((grn.deleted_by IS NULL) AND (gli.deleted_by IS NULL));

ALTER VIEW sc.purchase_history_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.purchase_history_vw TO spacelinxuser;
