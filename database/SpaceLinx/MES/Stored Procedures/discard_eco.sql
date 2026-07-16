-- PROCEDURE: mes.discard_eco(uuid, text)

-- DROP PROCEDURE IF EXISTS mes.discard_eco(uuid, text);

CREATE OR REPLACE PROCEDURE mes.discard_eco(
	IN eco_entity_id uuid,
	IN user_email text)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    eco_part_record RECORD;
    remaining_eco_parts INT;
    remaining_parts INT;
BEGIN
    -- Loop through each ECO part associated with the provided ECO ID
    FOR eco_part_record IN 
        SELECT * FROM mes.eco_part WHERE eco_id = eco_entity_id
    LOOP
	   -- Delete the ECO part entry first
         -- DELETE FROM mes.eco_part WHERE eco_id = eco_entity_id AND part_id = eco_part_record.part_id;
       -- Check if the part status is 'Draft'
       -- IF (SELECT status FROM mes.part WHERE id = eco_part_record.part_id) = 'Draft' THEN
            -- Delete related EBOM records
            -- DELETE FROM mes.ebom WHERE part_id = eco_part_record.part_id;
            -- Delete the part itself
            -- DELETE FROM mes.part WHERE id = eco_part_record.part_id;     			
       -- END IF;
	   UPDATE mes.part
        SET eco_id = NULL
        WHERE id = eco_part_record.part_id;
    END LOOP;
        UPDATE mes.eco
        SET status = 'Discarded',
            updated_at = COALESCE(updated_at, NOW()),
            updated_by = user_email
        WHERE id = eco_entity_id;
	   	UPDATE common.approval
	    SET deleted_at = NOW(),
	        deleted_by = 'System'
	    WHERE entity_id = eco_entity_id AND deleted_by IS NULL;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in discard_eco: %', SQLERRM;
END;
$BODY$;