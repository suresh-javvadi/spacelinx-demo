CREATE OR REPLACE PROCEDURE mes.release_eco(IN eco_entity_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    eco_record RECORD;
    eco_part_record RECORD;
    part_record RECORD;
    previous_part RECORD;
BEGIN
    -- Fetch the ECO record
    SELECT * INTO eco_record
    FROM mes.eco
    WHERE id = eco_entity_id;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'ECO record not found';
    END IF;
 
    -- Process each ECO part
    FOR eco_part_record IN 
        SELECT * FROM mes.eco_part WHERE eco_id = eco_entity_id
    LOOP
        -- Fetch the corresponding part
        SELECT * INTO part_record
        FROM mes.part
        WHERE id = eco_part_record.part_id;
 
        -- If ECO part status is 'Obsolete', mark the part as Obsolete
        IF eco_part_record.status = 'Obsolete' THEN
            UPDATE mes.part
            SET status = 'Obsolete',
                eco_id = eco_entity_id,
                updated_at = NOW(), 
                updated_by = user_email 
            WHERE id = part_record.id;
 
        ELSE
            -- Get the previous version of the part
           SELECT * INTO previous_part
	        FROM mes.part
	        WHERE part_number_suffix = part_record.part_number_suffix
	           AND version = TO_CHAR(CAST(part_record.version AS INTEGER) - 1, 'FM00')
	        LIMIT 1;
 
            -- If a previous version exists, archive it
            IF FOUND THEN
                UPDATE mes.part
                SET status = 'Archived',
                    updated_at = NOW(),
                    updated_by = user_email
                WHERE id = previous_part.id;
            END IF;
 
            -- Set the current version to 'Release'
            UPDATE mes.part
            SET status = 'Release',
                eco_id = eco_entity_id,
                updated_at = NOW(),
                updated_by = user_email
            WHERE id = part_record.id;
 
        END IF;
    END LOOP;
 
    -- Set ECO status to Released
    UPDATE mes.eco
    SET status = 'Released',
        updated_at = NOW(),
        updated_by = user_email
    WHERE id = eco_entity_id;
 
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Internal server error: %', SQLERRM;
END;
$$;

ALTER PROCEDURE mes.release_eco(uuid, text) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.release_eco(uuid, text) TO spacelinxuser;
