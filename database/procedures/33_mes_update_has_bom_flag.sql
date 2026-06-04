CREATE OR REPLACE FUNCTION mes.update_has_bom_flag() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    ebom_count INT;
    current_has_bom BOOLEAN;
BEGIN
    -- Get the current flag
    SELECT has_bom INTO current_has_bom
    FROM mes.part
    WHERE id = COALESCE(NEW.part_id, OLD.part_id);
 
    -- Get number of active child parts
    SELECT COUNT(*) INTO ebom_count
    FROM mes.ebom
    WHERE part_id = COALESCE(NEW.part_id, OLD.part_id)
      AND deleted_by IS NULL;
 
    --CASE 1: If has_bom = false and ebomCount > 0 → set to true
    IF (NOT current_has_bom AND ebom_count > 0) THEN
        UPDATE mes.part
        SET has_bom = TRUE
        WHERE id = COALESCE(NEW.part_id, OLD.part_id);
 
    --CASE 2: If has_bom = true and ebomCount = 0 → set to false
    ELSIF (current_has_bom AND ebom_count = 0) THEN
        UPDATE mes.part
        SET has_bom = FALSE
        WHERE id = COALESCE(NEW.part_id, OLD.part_id);
    END IF;
 
    RETURN NULL;
END;
$$;

ALTER FUNCTION mes.update_has_bom_flag() OWNER TO spacelinxadmin;
GRANT EXECUTE ON FUNCTION mes.update_has_bom_flag() TO spacelinxuser;
