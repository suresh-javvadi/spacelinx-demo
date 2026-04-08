CREATE OR REPLACE PROCEDURE mes.is_eco_valid_for_submit(IN p_ecoid uuid)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    v_errors TEXT := '';
BEGIN
    -- Check ECO has documents
    IF NOT EXISTS (SELECT 1 FROM common.document WHERE entity_id = p_ecoid) THEN
        v_errors := v_errors || 'ECO has no documents. | ';
    END IF;

    -- Check effected parts (Make and Buy) have documents
    SELECT COALESCE(v_errors || string_agg('Effected parts missing documents: ' || 
        'PartID:' || ep.part_id::text || ' (' || p.name || ')', '; ') || ' | ', v_errors)
    INTO v_errors
    FROM mes.eco_part ep
    JOIN mes.part p ON p.id = ep.part_id
    WHERE ep.eco_id = p_ecoid
        AND p.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM common.document WHERE entity_id = ep.part_id);

    -- Check child parts (Make and Buy) have documents
    SELECT COALESCE(v_errors || string_agg('Child parts missing documents: ' || 
        'PartID:' || c.id::text || ' (' || c.name || ')', '; ') || ' | ', v_errors)
    INTO v_errors
    FROM mes.eco_part ep
    JOIN mes.ebom b ON b.part_id = ep.part_id AND b.deleted_at IS NULL
    JOIN mes.part c ON c.id = b.child_part_id
    WHERE ep.eco_id = p_ecoid
        AND c.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM common.document WHERE entity_id = c.id);

    -- Check unreleased BOM parts are in ECO
    SELECT COALESCE(v_errors || string_agg('Unreleased BOM parts not in ECO: ' || 
        'PartID:' || c.id::text || ' (' || c.name || '), Status:' || c.status, '; ') || ' | ', v_errors)
    INTO v_errors
    FROM mes.eco_part ep
    JOIN mes.ebom b ON b.part_id = ep.part_id AND b.deleted_at IS NULL
    JOIN mes.part c ON c.id = b.child_part_id
    WHERE ep.eco_id = p_ecoid
        AND c.status <> 'Release'
        AND c.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM mes.eco_part ep2 WHERE ep2.eco_id = p_ecoid AND ep2.part_id = c.id);

    -- Check Buy parts have manufacturer details
    SELECT COALESCE(v_errors || string_agg('Buy parts missing manufacturer details: ' || 
        'PartID:' || p.id::text || ' (' || p.name || ')' ||
        CASE WHEN p.manufacturing_part_number IS NULL OR TRIM(p.manufacturing_part_number) = '' THEN ' [Missing: MPN]' ELSE '' END ||
        CASE WHEN p.manufacturer_name IS NULL OR TRIM(p.manufacturer_name) = '' THEN ' [Missing: Manufacturer]' ELSE '' END, '; ') || ' | ', v_errors)
    INTO v_errors
    FROM mes.eco_part ep
    JOIN mes.part p ON p.id = ep.part_id
    WHERE ep.eco_id = p_ecoid
        AND p.make_buy = 1
        AND p.deleted_at IS NULL
        AND (p.manufacturing_part_number IS NULL OR TRIM(p.manufacturing_part_number) = '' 
            OR p.manufacturer_name IS NULL OR TRIM(p.manufacturer_name) = '');

    IF v_errors <> '' THEN
        RAISE EXCEPTION 'ECO validation failed: %', RTRIM(v_errors, ' | ');
    END IF;

    RAISE NOTICE 'ECO % is valid for submission.', p_ecoid;
END;
$BODY$;

ALTER PROCEDURE mes.is_eco_valid_for_submit(uuid) OWNER TO spacelinxadmin;
