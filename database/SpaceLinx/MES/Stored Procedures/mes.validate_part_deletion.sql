-- Procedure: mes.validate_part_deletion(uuid)
-- Purpose: Validate if a part can be safely deleted by checking all references in related tables.
-- Throws an exception listing all dependencies that block deletion or a notice if safe.
-- Author: spacelinxadmin
-- Date: 2025-11-18

CREATE OR REPLACE PROCEDURE mes.validate_part_deletion(
    IN input_part_id uuid)
LANGUAGE plpgsql
AS $BODY$
DECLARE
    v_part_id UUID := input_part_id;
    errors TEXT[] := ARRAY[]::TEXT[];  -- Accumulate error messages here
BEGIN
    -- Check references in EbomChildParts
    IF EXISTS (SELECT 1 FROM mes.ebom e WHERE e.part_id = v_part_id OR e.child_part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in EbomChildParts');
    END IF;

    -- Check references in EbomParts
    IF EXISTS (SELECT 1 FROM mes.ebom e WHERE e.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in EbomParts');
    END IF;

    -- Check references in EcoParts
    IF EXISTS (SELECT 1 FROM mes.eco_part ep WHERE ep.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in EcoParts');
    END IF;

    -- Check references in GrnLineItems
    IF EXISTS (SELECT 1 FROM sc.grn_line_item gli WHERE gli.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in GrnLineItems');
    END IF;

    -- Check references in GuideEbomChildParts
    IF EXISTS (SELECT 1 FROM mes.guide_ebom ge WHERE ge.part_id = v_part_id OR ge.child_part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in GuideEbomChildParts');
    END IF;

    -- Check references in GuideEbomParts
    IF EXISTS (SELECT 1 FROM mes.guide_ebom ge WHERE ge.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in GuideEbomParts');
    END IF;

    -- Check references in GuideMboms
    IF EXISTS (SELECT 1 FROM mes.guide_mbom gm WHERE gm.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in GuideMboms');
    END IF;

    -- Check references in GuideStepEquipments
    IF EXISTS (SELECT 1 FROM mes.guide_step_equipment gse WHERE gse.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in GuideStepEquipments');
    END IF;

    -- Check references in Guides
    IF EXISTS (SELECT 1 FROM mes.guide g WHERE g.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in Guides');
    END IF;

    -- Check references in InventoryParts
    IF EXISTS (SELECT 1 FROM sc.inventory_part ip WHERE ip.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in InventoryParts');
    END IF;

    -- Check references in InventoryStocks
    IF EXISTS (SELECT 1 FROM sc.inventory_stock ist WHERE ist.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in InventoryStocks');
    END IF;

    -- Check references in InventoryTransactions
    IF EXISTS (SELECT 1 FROM sc.inventory_transaction it WHERE it.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in InventoryTransactions');
    END IF;

    -- Check references in KitBomComments
    IF EXISTS (SELECT 1 FROM mes.kit_bom_comment kbc WHERE kbc.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in KitBomComments');
    END IF;

    -- Check references in KitSerials
    IF EXISTS (SELECT 1 FROM mes.kit_serial ks WHERE ks.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in KitSerials');
    END IF;

    -- Check references in Kits
    IF EXISTS (SELECT 1 FROM mes.kit k WHERE k.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in Kits');
    END IF;

    -- Check references in MaterialKits
    IF EXISTS (SELECT 1 FROM mes.material_kit mk WHERE mk.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in MaterialKits');
    END IF;

    -- Check references in PoLineItems
    IF EXISTS (SELECT 1 FROM sc.po_line_item pli WHERE pli.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in PoLineItems');
    END IF;

    -- Check references in Products via ECO
    IF EXISTS (
        SELECT 1 FROM mes.eco e
        WHERE e.id IN (
            SELECT ep.eco_id FROM mes.eco_part ep WHERE ep.part_id = v_part_id
        )
    ) THEN
        errors := array_append(errors, 'Found in Products');
    END IF;

    -- Check references in RequisitionLineItems
    IF EXISTS (SELECT 1 FROM sc.requisition_line_item rli WHERE rli.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in RequisitionLineItems');
    END IF;

    -- Check references in CompanyParts
    IF EXISTS (SELECT 1 FROM sc.company_part cp WHERE cp.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in CompanyParts');
    END IF;

    -- Check references in WorkPackages
    IF EXISTS (SELECT 1 FROM mes.work_package wp WHERE wp.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in WorkPackages');
    END IF;

    -- Check references in WorkOrders
    IF EXISTS (SELECT 1 FROM mes.work_order wo WHERE wo.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in WorkOrders');
    END IF;

    -- Final validation and error reporting
    IF array_length(errors, 1) > 0 THEN
        RAISE EXCEPTION 'Cannot delete part due to referenced dependencies: %', array_to_string(errors, ', ');
    ELSE
        RAISE NOTICE 'Part % is safe to delete. No references found.', v_part_id;
    END IF;
END;
$BODY$;

ALTER PROCEDURE mes.validate_part_deletion(uuid)
OWNER TO spacelinxadmin;
