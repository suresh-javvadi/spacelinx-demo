DROP VIEW IF EXISTS sc.inventory_transaction_vw CASCADE;

CREATE VIEW sc.inventory_transaction_vw AS
 SELECT it.id,
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
    COALESCE(grn.reference_number, po.number) AS reference_number,
    it.transaction_date,
    it.notes,
    it.from_location_id,
    fl.name AS from_location_name,
    fl.number AS from_location_number,
    it.to_location_id,
    tl.name AS to_location_name,
    tl.number AS to_location_number,
    it.created_at,
    it.created_by,
    (((cb.first_name)::text || ' '::text) || (COALESCE(cb.last_name, ''::character varying))::text) AS created_by_full_name,
    it.updated_at,
    it.updated_by
   FROM ((((((sc.inventory_transaction it
     LEFT JOIN mes.part p ON (((it.part_id = p.id) AND (p.deleted_by IS NULL))))
     LEFT JOIN mes.location fl ON ((it.from_location_id = fl.id)))
     LEFT JOIN mes.location tl ON ((it.to_location_id = tl.id)))
     LEFT JOIN sc.goods_receipt_note grn ON ((((it.reference_type)::text = 'GRN'::text) AND (it.reference_id = grn.id) AND (grn.is_active = true) AND (grn.deleted_by IS NULL))))
     LEFT JOIN sc.purchase_order po ON ((((it.reference_type)::text = 'PO'::text) AND (it.reference_id = po.id) AND (po.is_active = true) AND (po.deleted_by IS NULL))))
     LEFT JOIN application."user" cb ON (((it.created_by)::text = (cb.email)::text)))
  WHERE (it.deleted_by IS NULL);

ALTER VIEW sc.inventory_transaction_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.inventory_transaction_vw TO spacelinxuser;
