DROP VIEW IF EXISTS mes.parts_not_associated_with_guides CASCADE;

CREATE VIEW mes.parts_not_associated_with_guides AS
 SELECT id,
    part_number,
    name,
    description,
    part_type_id,
    unit_of_measure_id,
    make_buy,
    is_active,
    is_serial_number_required,
    status,
    reference_number,
    short_description,
    created_at,
    created_by,
    updated_at,
    updated_by
   FROM mes.part p
  WHERE ((deleted_by IS NULL) AND ((status)::text = ANY (ARRAY[('Release'::character varying)::text, ('Draft'::character varying)::text])) AND (id IN ( SELECT DISTINCT eb.part_id
           FROM mes.ebom eb
          WHERE ((eb.deleted_by IS NULL) AND (NOT (EXISTS ( SELECT 1
                   FROM mes.guide g
                  WHERE ((g.part_id = eb.part_id) AND (g.deleted_by IS NULL)))))))));

ALTER VIEW mes.parts_not_associated_with_guides OWNER TO spacelinxadmin;
GRANT SELECT ON mes.parts_not_associated_with_guides TO spacelinxuser;
