CREATE OR REPLACE PROCEDURE mes.is_eco_valid_for_submit(IN p_ecoid uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_errors TEXT := '';
    v_part_docs_missing TEXT;
    v_child_docs_missing TEXT;
    v_unreleased_bom TEXT;
    v_archived_bom TEXT;
    v_obsolete_bom TEXT;
    v_eco_docs_count INT;
BEGIN
    -- 4) Check ECO has at least one document
    SELECT COUNT(*) 
      INTO v_eco_docs_count
      FROM common.document d
     WHERE d.entity_id = p_ecoid
       AND d.deleted_at IS NULL;
    IF v_eco_docs_count = 0 THEN
        v_errors := v_errors || 'ECO has no documents. | ';
    END IF;

    -- 1) Effected parts should have documents
    SELECT string_agg('PartID:'|| ep.part_id::text, '; ')
      INTO v_part_docs_missing
      FROM mes.eco_part ep
      JOIN mes.part p ON p.id = ep.part_id
      LEFT JOIN common.document d ON d.entity_id = ep.part_id AND d.deleted_at IS NULL
     WHERE ep.eco_id = p_ecoid
       AND ep.is_active = true
       AND ep.deleted_at IS NULL
       AND p.is_active = true
       AND p.deleted_at IS NULL
       AND d.id IS NULL;
    IF v_part_docs_missing IS NOT NULL THEN
        v_errors := v_errors || 'Effected parts missing docs: '||v_part_docs_missing||' | ';
    END IF;

    -- 2) If effected parts have child parts, they should all have documents
    SELECT string_agg('ChildPartID:'|| c.id::text, '; ')
      INTO v_child_docs_missing
      FROM mes.eco_part ep
      JOIN mes.ebom b ON b.part_id = ep.part_id
                     AND b.is_active = true       
                     AND b.deleted_at IS NULL      
      JOIN mes.part c ON c.id = b.child_part_id
      LEFT JOIN common.document d ON d.entity_id = c.id AND d.deleted_at IS NULL
     WHERE ep.eco_id = p_ecoid
       AND ep.is_active = true
       AND ep.deleted_at IS NULL
       AND c.is_active = true
       AND c.deleted_at IS NULL
       AND d.id IS NULL;
    IF v_child_docs_missing IS NOT NULL THEN
        v_errors := v_errors || 'Child parts missing docs: '||v_child_docs_missing||' | ';
    END IF;

    -- 3) Effected BOM parts status should be 'Release'; if not, they must be included in effected parts
    SELECT string_agg('PartID:'|| b.child_part_id::text||',Status:'||c.status, '; ')
      INTO v_unreleased_bom
      FROM mes.eco_part ep
      JOIN mes.ebom b ON b.part_id = ep.part_id
                     AND b.is_active = true       
                     AND b.deleted_at IS NULL   
      JOIN mes.part c ON c.id = b.child_part_id
     WHERE ep.eco_id = p_ecoid
       AND ep.is_active = true
       AND ep.deleted_at IS NULL
       AND c.status NOT IN ('Release', 'Archived', 'Obsolete')
       AND c.is_active = true
       AND c.deleted_at IS NULL
       AND NOT EXISTS (
           SELECT 1 
             FROM mes.eco_part ep2
            WHERE ep2.eco_id = p_ecoid
              AND ep2.part_id = c.id
              AND ep2.is_active = true
              AND ep2.deleted_at IS NULL
       );
    IF v_unreleased_bom IS NOT NULL THEN
        v_errors := v_errors || 'Unreleased BOM parts not in ECO: '||v_unreleased_bom||' | ';
    END IF;

    -- 5) BOM child parts must not be in Archived status
    SELECT string_agg('EbomID:'|| b.id::text ||',PartID:'|| b.child_part_id::text, '; ')
      INTO v_archived_bom
      FROM mes.eco_part ep
      JOIN mes.ebom b ON b.part_id = ep.part_id
                     AND b.is_active = true
                     AND b.deleted_at IS NULL
      JOIN mes.part c ON c.id = b.child_part_id
     WHERE ep.eco_id = p_ecoid
       AND ep.is_active = true
       AND ep.deleted_at IS NULL
       AND c.status = 'Archived'
       AND c.is_active = true
       AND c.deleted_at IS NULL;
    IF v_archived_bom IS NOT NULL THEN
        v_errors := v_errors || 'Archived BOM parts in ECO: '||v_archived_bom||' | ';
    END IF;

    -- 6) BOM child parts must not be in Obsolete status
    SELECT string_agg('EbomID:'|| b.id::text ||',PartID:'|| b.child_part_id::text, '; ')
      INTO v_obsolete_bom
      FROM mes.eco_part ep
      JOIN mes.ebom b ON b.part_id = ep.part_id
                     AND b.is_active = true
                     AND b.deleted_at IS NULL
      JOIN mes.part c ON c.id = b.child_part_id
     WHERE ep.eco_id = p_ecoid
       AND ep.is_active = true
       AND ep.deleted_at IS NULL
       AND c.status = 'Obsolete'
       AND c.is_active = true
       AND c.deleted_at IS NULL;
    IF v_obsolete_bom IS NOT NULL THEN
        v_errors := v_errors || 'Obsolete BOM parts in ECO: '||v_obsolete_bom||' | ';
    END IF;

    -- Raise exception if any rule failed
    IF v_errors <> '' THEN
        RAISE EXCEPTION '%', v_errors;
    ELSE
        RAISE NOTICE 'ECO % is valid for submission.', p_ecoid;
    END IF;
END;
$$;

ALTER PROCEDURE mes.is_eco_valid_for_submit(uuid) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.is_eco_valid_for_submit(uuid) TO spacelinxuser;
