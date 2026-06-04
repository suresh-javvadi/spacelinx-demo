DROP VIEW IF EXISTS mes.guide_mbom_vw CASCADE;

CREATE VIEW mes.guide_mbom_vw AS
 SELECT g.id AS guide_id,
    g.part_id AS guide_part_id,
    gp.part_number AS guide_part_number,
    gp.name AS guide_part_name,
    gp.part_number_suffix AS guide_part_number_suffix,
    e.id AS ebom_id,
    e.child_part_id AS ebom_part_id,
    ep.part_number,
    ep.name,
    ep.part_number_suffix,
    ep.is_serial_number_required,
    e.quantity AS quantity_e,
    gse.part_id AS gse_part_id,
    gm.weight AS guide_mbom_weight,
    COALESCE(sum(gse.quantity), (0)::bigint) AS quantity_m,
    cp.weight AS child_part_weight
   FROM ((((((mes.guide g
     LEFT JOIN mes.part gp ON (((g.part_id = gp.id) AND (gp.deleted_by IS NULL))))
     LEFT JOIN mes.ebom e ON (((g.part_id = e.part_id) AND (e.deleted_by IS NULL))))
     LEFT JOIN mes.part ep ON (((e.child_part_id = ep.id) AND (ep.deleted_by IS NULL))))
     LEFT JOIN mes.guide_step_equipment gse ON (((g.id = gse.guide_id) AND (e.child_part_id = gse.part_id) AND (gse.deleted_by IS NULL))))
     LEFT JOIN mes.guide_mbom gm ON (((g.id = gm.guide_id) AND (gm.part_id = e.child_part_id) AND (gm.deleted_by IS NULL))))
     LEFT JOIN mes.part cp ON (((e.child_part_id = cp.id) AND (cp.deleted_by IS NULL))))
  WHERE (g.deleted_by IS NULL)
  GROUP BY g.id, g.part_id, gp.part_number, gp.name, gp.part_number_suffix, e.id, e.child_part_id, ep.part_number, ep.name, ep.part_number_suffix, ep.is_serial_number_required, gse.part_id, e.quantity, gm.weight, cp.weight
 HAVING ((gse.part_id IS NOT NULL) OR (e.child_part_id IS NOT NULL));

ALTER VIEW mes.guide_mbom_vw OWNER TO spacelinxadmin;
GRANT SELECT ON mes.guide_mbom_vw TO spacelinxuser;
