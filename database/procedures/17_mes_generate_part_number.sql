CREATE OR REPLACE FUNCTION mes.generate_part_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    part_number_prefix_local TEXT;
    last_suffix TEXT;
    next_sequence INT;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.part_number_suffix IS NULL)
       OR (TG_OP = 'UPDATE' AND NEW.part_type_id IS DISTINCT FROM OLD.part_type_id) THEN
 
        -- Get the prefix from PartType
    SELECT part_number_prefix INTO part_number_prefix_local FROM mes.part_type WHERE id = NEW.part_type_id;
 
        IF part_number_prefix_local IS NULL THEN
            RAISE EXCEPTION 'No part_number_prefix found for part_type_id: %', NEW.part_type_id;
        END IF;
 
        -- Lock to prevent race conditions
        LOCK TABLE mes.part IN SHARE ROW EXCLUSIVE MODE;
 
        -- Get last used suffix globally for that prefix
        SELECT part_number_suffix
        INTO last_suffix
        FROM mes.part
        WHERE part_number_suffix LIKE part_number_prefix_local || '-%'
        ORDER BY (regexp_match(part_number_suffix, '-(\d+)$'))[1]::INT DESC
        LIMIT 1;
 
        -- Generate next sequence
        IF last_suffix IS NOT NULL THEN
            next_sequence := COALESCE((substring(last_suffix FROM '-(\d+)$'))::INT, 0) + 1;
        ELSE
            next_sequence := 1;
        END IF;
 
        -- Assign the new suffix
        NEW.part_number_suffix := part_number_prefix_local || '-' || LPAD(next_sequence::TEXT, 5, '0');
    END IF;
 
    RETURN NEW;
END;
$_$;

ALTER FUNCTION mes.generate_part_number() OWNER TO spacelinxadmin;
GRANT EXECUTE ON FUNCTION mes.generate_part_number() TO spacelinxuser;
