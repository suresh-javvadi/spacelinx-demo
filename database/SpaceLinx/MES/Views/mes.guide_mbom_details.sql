CREATE OR REPLACE VIEW mes.guide_mbom_details
 AS
 SELECT g.id AS guideid,
    ge.child_part_id AS partid,
    COALESCE(gmv.quantity_m, ge.quantity::bigint) AS quantity
   FROM mes.guide g
     JOIN mes.guide_ebom ge ON g.part_id = ge.part_id AND ge.deleted_by IS NULL
     LEFT JOIN mes.guide_mbom_vw gmv ON g.id = gmv.guide_id AND gmv.ebom_part_id = ge.child_part_id
  WHERE g.status::text = 'Published'::text AND g.deleted_by IS NULL
UNION
 SELECT g.id AS guideid,
    e.child_part_id AS partid,
    COALESCE(gmv.quantity_m, e.quantity::bigint) AS quantity
   FROM mes.guide g
     JOIN mes.ebom e ON g.part_id = e.part_id AND e.deleted_by IS NULL
     LEFT JOIN mes.guide_mbom_vw gmv ON g.id = gmv.guide_id AND gmv.ebom_part_id = e.child_part_id
  WHERE g.status::text = 'Draft'::text AND g.deleted_by IS NULL;