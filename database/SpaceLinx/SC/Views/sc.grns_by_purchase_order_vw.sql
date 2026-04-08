CREATE OR REPLACE VIEW sc.grns_by_purchase_order_vw AS
SELECT
    grn.id AS grn_id,
    grn.grn_number,
    grn.purchase_order_id,
    grn.received_date,
    grn.received_by_id,
    u.first_name || ' ' || u.last_name AS received_by_full_name,
    u.email AS received_by_email,
    grn.location_id,
    loc.number AS location_number,
    loc.name AS location_name,
    grn.description,
    grn.reference_number,
    grn.invoice_number,
    grn.invoice_date,
    grn.vendor_reference_id,
    grn.status,
    grn.vendor_id,
    vendor.vendor_code AS vendor_code,
    vendor.name AS vendor_name,
	grn.is_active,
    grn.created_at,
    grn.created_by,
    grn.updated_at,
    grn.updated_by,
    json_agg(
        jsonb_build_object(
            'grn_line_item_id', li.id,
            'part_id', li.part_id,
            'part_name', p.name,
            'part_number', p.part_number,
            'received_quantity', li.received_quantity
        )
    ) FILTER (WHERE li.id IS NOT NULL) AS grn_line_items
FROM 
    sc.goods_receipt_note grn
LEFT JOIN 
    application."user" u ON grn.received_by_id = u.id
LEFT JOIN 
    mes.location loc ON grn.location_id = loc.id
LEFT JOIN 
    sc.grn_line_item li ON li.grn_id = grn.id AND li.deleted_by IS NULL
LEFT JOIN 
    mes.part p ON p.id = li.part_id
LEFT JOIN 
    sc.company vendor ON grn.vendor_id = vendor.id
WHERE grn.deleted_by IS NULL
GROUP BY
    grn.id, grn.grn_number, grn.purchase_order_id, grn.received_date, grn.received_by_id,
    u.first_name, u.last_name, u.email,
    grn.location_id, loc.number, loc.name, grn.description, grn.vendor_reference_id, grn.status, grn.vendor_id, vendor.vendor_code, vendor.name,
    grn.is_active, grn.created_at, grn.created_by, grn.updated_at, grn.updated_by;