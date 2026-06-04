DROP VIEW IF EXISTS sc.vendor_return_request_with_user_vw CASCADE;

CREATE VIEW sc.vendor_return_request_with_user_vw AS
 SELECT vr.id AS vendor_return_request_id,
    vr.return_number,
    vr.return_date,
    vr.reason AS return_reason,
    vr.status AS return_status,
    vr.is_active,
    vr.created_at,
    vr.created_by,
    vr.updated_at,
    vr.updated_by,
    (((rb.first_name)::text || ' '::text) || (rb.last_name)::text) AS raised_by_full_name,
    rb.email AS raised_by_email,
    vendor.id AS vendor_id,
    vendor.name AS vendor_name,
    loc.id AS location_id,
    loc.number AS location_number,
    loc.name AS location_name,
    po.id AS po_id,
    po.number AS po_number,
    po.order_date AS po_order_date,
    po.status AS po_status,
    grn.id AS grn_id,
    grn.grn_number,
    grn.received_date AS grn_received_date,
    grn.status AS grn_status,
    wo.id AS wo_id,
    wo.number AS work_order_number,
    wo.status AS wo_status,
    vrli.id AS line_item_id,
    vrli.part_id,
    vrli.grn_line_item_id,
    vrli.tracking_type,
    vrli.tracking_id,
    vrli.return_quantity,
    vrli.reason AS line_item_reason
   FROM (((((((sc.vendor_return_request vr
     LEFT JOIN application."user" rb ON ((vr.raised_by_id = rb.id)))
     LEFT JOIN sc.company vendor ON ((vr.vendor_id = vendor.id)))
     LEFT JOIN mes.location loc ON ((vr.location_id = loc.id)))
     LEFT JOIN sc.purchase_order po ON ((vr.po_id = po.id)))
     LEFT JOIN sc.goods_receipt_note grn ON ((vr.grn_id = grn.id)))
     LEFT JOIN mes.work_order wo ON ((vr.wo_id = wo.id)))
     LEFT JOIN sc.vendor_return_line_item vrli ON (((vr.id = vrli.return_request_id) AND (vrli.deleted_by IS NULL))))
  WHERE (vr.deleted_by IS NULL);

ALTER VIEW sc.vendor_return_request_with_user_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.vendor_return_request_with_user_vw TO spacelinxuser;
