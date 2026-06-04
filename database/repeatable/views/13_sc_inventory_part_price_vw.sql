DROP VIEW IF EXISTS sc.inventory_part_price_vw CASCADE;

CREATE VIEW sc.inventory_part_price_vw AS
 SELECT i.id AS inventory_id,
    i.id AS inventory_part_id,
    i.location_id,
    i.bin_id,
    i.sku_code,
    i.reorder_level,
    i.unit_price AS inventory_unit_price,
    sum(ins.qty_onhand) AS qty_onhand,
    sum(ins.qty_reserved) AS qty_reserved,
    sum(ins.qty_issued) AS qty_issued,
    sum(ins.qty_qc_pending) AS qty_qc_pending,
    sum(ins.qty_qc_failed) AS qty_qc_failed,
    sum(ins.qty_scrapped) AS qty_scrapped,
    sum(ins.qty_returned) AS qty_returned,
    sum(ins.qty_available) AS qty_available,
    sum(ins.issued_price) AS issued_price,
    sum(ins.reserved_price) AS reserved_price,
    sum(ins.available_price) AS available_price,
    sum(ins.total_price) AS total_price,
    i.consumed_quantity,
    i.is_active AS inventory_is_active,
    i.created_at AS inventory_created_at,
    i.created_by AS inventory_created_by,
    i.updated_at AS inventory_updated_at,
    i.updated_by AS inventory_updated_by,
    p.id AS part_id,
    p.part_number,
    p.part_type_id,
    p.part_number_suffix,
    p.version,
    p.name AS part_name,
    p.description,
    p.weight,
    p.unit_price AS part_unit_price,
    p.status,
    p.manufacturing_part_number,
    p.is_serial_number_required,
    p.is_active AS part_is_active
   FROM ((sc.inventory_part i
     LEFT JOIN mes.part p ON ((i.part_id = p.id)))
     LEFT JOIN sc.inventory_stock ins ON (((ins.part_id = i.part_id) AND (ins.is_active = true))))
  WHERE ((i.deleted_at IS NULL) AND (p.item_type IS NULL))
  GROUP BY i.id, i.location_id, i.bin_id, i.sku_code, i.reorder_level, i.unit_price, i.consumed_quantity, i.is_active, i.created_at, i.created_by, i.updated_at, i.updated_by, p.id, p.part_number, p.part_type_id, p.part_number_suffix, p.version, p.name, p.description, p.weight, p.unit_price, p.status, p.manufacturing_part_number, p.is_serial_number_required, p.is_active;

ALTER VIEW sc.inventory_part_price_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.inventory_part_price_vw TO spacelinxuser;
