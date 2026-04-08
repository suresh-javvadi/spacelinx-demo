-- View: sc.scrap_request_with_user_vw

-- DROP VIEW sc.scrap_request_with_user_vw;

CREATE OR REPLACE VIEW sc.scrap_request_with_user_vw
 AS
 SELECT sr.id AS scrap_request_id,
    sr.scrap_number,
    sr.scrap_date,
    sr.reason AS scrap_reason,
    sr.status AS scrap_status,
    sr.is_active,
    sr.created_at,
    sr.created_by,
    sr.updated_at,
    sr.updated_by,
    (rb.first_name::text || ' '::text) || rb.last_name::text AS raised_by_full_name,
    rb.email AS raised_by_email,
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
    sli.id AS line_item_id,
    sli.part_id,
    sli.tracking_type,
    sli.tracking_id,
    sli.scrap_quantity,
    sli.reason AS line_item_reason
   FROM sc.scrap_request sr
     LEFT JOIN application."user" rb ON sr.raised_by_id = rb.id
     LEFT JOIN mes.location loc ON sr.location_id = loc.id
     LEFT JOIN sc.purchase_order po ON sr.po_id = po.id
     LEFT JOIN sc.goods_receipt_note grn ON sr.grn_id = grn.id
     LEFT JOIN mes.work_order wo ON sr.wo_id = wo.id
     LEFT JOIN sc.scrap_line_item sli ON sr.id = sli.scrap_request_id AND sli.deleted_by IS NULL
  WHERE sr.deleted_by IS NULL;