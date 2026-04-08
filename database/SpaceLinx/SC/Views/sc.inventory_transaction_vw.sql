CREATE OR REPLACE VIEW sc.inventory_transaction_vw AS
SELECT 
    it.id,
    it.part_id,
    p.part_number,
    p.name AS part_name,
    p.part_type_id,
    p.status AS part_status,
    p.item_type,  
    it.transaction_type,
    it.current_quantity,
    it.previous_quantity,
    it.transacted_quantity,
    it.reference_type,
    it.reference_id,
        -- Reference Number (from GRN or PO)
    COALESCE(grn.reference_number, po.number) AS reference_number,
 
    it.transaction_date,
    it.notes,
 
    -- From and To Location Details
    it.from_location_id,
    fl.name AS from_location_name,
    fl.number AS from_location_number,
    it.to_location_id,
    tl.name AS to_location_name,
    tl.number AS to_location_number,
    it.created_at,
    it.created_by,
    cb.first_name || ' ' || COALESCE(cb.last_name, '') AS created_by_full_name,
    it.updated_at,
    it.updated_by
FROM sc.inventory_transaction it
LEFT JOIN mes.part p ON it.part_id = p.id AND p.deleted_by IS NULL
LEFT JOIN mes.location fl ON it.from_location_id = fl.id
LEFT JOIN mes.location tl ON it.to_location_id = tl.id
LEFT JOIN sc.goods_receipt_note grn 
    ON it.reference_type = 'GRN' AND it.reference_id = grn.id AND grn.is_active = TRUE AND grn.deleted_by IS NULL
LEFT JOIN sc.purchase_order po 
    ON it.reference_type = 'PO' AND it.reference_id = po.id AND po.is_active = TRUE AND po.deleted_by IS NULL
LEFT JOIN application."user" cb 
    ON it.created_by = cb.email WHERE it.deleted_by IS NULL;