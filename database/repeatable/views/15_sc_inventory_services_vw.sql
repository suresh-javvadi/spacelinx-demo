DROP VIEW IF EXISTS sc.inventory_services_vw CASCADE;

CREATE VIEW sc.inventory_services_vw AS
 SELECT ip.id AS inventory_id,
    ip.part_id AS inventory_part_id,
    ip.sku_code,
    ip.reorder_level,
    ip.unit_price AS inventory_unit_price,
    ip.qty_onhand,
    ip.qty_reserved,
    ip.qty_available,
    ip.consumed_quantity,
    ip.is_active AS inventory_is_active,
    ip.created_at AS inventory_created_at,
    ip.created_by AS inventory_created_by,
    ip.updated_at AS inventory_updated_at,
    ip.updated_by AS inventory_updated_by,
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
    p.is_active AS part_is_active,
    p.item_type
   FROM (mes.part p
     LEFT JOIN sc.inventory_part ip ON (((ip.part_id = p.id) AND (ip.deleted_by IS NULL))))
  WHERE (((p.item_type)::text = 'Services'::text) AND (p.deleted_by IS NULL));

ALTER VIEW sc.inventory_services_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.inventory_services_vw TO spacelinxuser;
