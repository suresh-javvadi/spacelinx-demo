-- Migration: Update inventory_part_vw to include location_id and bin_id
-- Date: 2026-01-27
-- NOTE: This drops and recreates the view. Run pg_get_viewdef('sc.inventory_part_vw', true)
--       first to verify the current definition if needed.

DROP VIEW IF EXISTS sc.inventory_part_vw;

CREATE VIEW sc.inventory_part_vw AS
SELECT
    i.id AS inventory_id,
    i.id AS inventory_part_id,
    i.location_id,
    i.bin_id,
    i.sku_code,
    i.reorder_level,
    i.unit_price AS inventory_unit_price,
    i.qty_onhand,
    i.qty_reserved,
    i.qty_available,
    i.qty_issued,
    i.qty_qc_pending,
    i.qty_qc_failed,
    i.qty_scrapped,
    i.consumed_quantity,
    i.qty_returned,
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
FROM sc.inventory_part i
LEFT JOIN mes.part p ON i.part_id = p.id
WHERE i.deleted_at IS NULL;

-- Grant permissions
GRANT SELECT ON sc.inventory_part_vw TO spacelinxuser;
