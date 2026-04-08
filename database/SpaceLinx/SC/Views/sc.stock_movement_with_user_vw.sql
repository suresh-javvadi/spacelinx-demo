-- View: sc.stock_movement_with_user_vw

-- DROP VIEW sc.stock_movement_with_user_vw;

CREATE OR REPLACE VIEW sc.stock_movement_with_user_vw
 AS
 SELECT sm.id AS stock_movement_id,
    sm.movement_number,
    sm.movement_type,
    sm.status,
    sm.movement_reason,
    sm.reference_number,
    sm.notes,
    sm.movement_date,
    sm.expected_return_date,
    sm.project_date,
    sm.from_location_id,
    fl.number AS from_location_number,
    fl.name AS from_location_name,
    sm.to_location_id,
    tl.number AS to_location_number,
    tl.name AS to_location_name,
    sm.from_bin_id,
    fb.bin_code AS from_bin_code,
    fb.aisle AS from_bin_aisle,
    fb.rack AS from_bin_rack,
    sm.to_bin_id,
    tb.bin_code AS to_bin_code,
    tb.aisle AS to_bin_aisle,
    tb.rack AS to_bin_rack,
    sm.work_order_id,
    wo.number AS work_order_number,
    sm.performed_by_id,
    (u.first_name::text || ' '::text) || u.last_name::text AS performed_by_full_name,
    u.email AS performed_by_email,
    sm.is_active,
    sm.created_at,
    sm.created_by,
    sm.updated_at,
    sm.updated_by
   FROM sc.stock_movement sm
     LEFT JOIN application."user" u ON sm.performed_by_id = u.id
     LEFT JOIN mes.location fl ON sm.from_location_id = fl.id
     LEFT JOIN mes.location tl ON sm.to_location_id = tl.id
     LEFT JOIN sc.bin_management fb ON sm.from_bin_id = fb.id AND fb.deleted_by IS NULL
     LEFT JOIN sc.bin_management tb ON sm.to_bin_id = tb.id AND tb.deleted_by IS NULL
     LEFT JOIN mes.work_order wo ON sm.work_order_id = wo.id
  WHERE sm.deleted_by IS NULL;

