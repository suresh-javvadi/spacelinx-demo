-- PROCEDURE: mes.create_guide_ebom()
-- DROP PROCEDURE IF EXISTS mes.create_guide_ebom();

CREATE OR REPLACE PROCEDURE mes.create_guide_ebom(
       IN guide_id uuid, 
       IN user_email text)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    guide RECORD;
BEGIN
    -- Fetch the published guide by ID
    SELECT id, part_id INTO guide
    FROM mes.guide
    WHERE id = guide_id AND status = 'Published';

    -- If the guide exists and is published
    IF guide.id IS NOT NULL THEN
        -- Insert related ebom records directly into guide_ebom table
        INSERT INTO mes.guide_ebom (guide_id, part_id, child_part_id, quantity, is_active, created_at, created_by)
        SELECT guide.id, record.part_id, record.child_part_id, record.quantity, TRUE, NOW(), user_email
        FROM mes.ebom record
        WHERE record.part_id = guide.part_id;
    ELSE
        RAISE EXCEPTION 'Guide with ID % is either not published or does not exist.', guide_id;
    END IF;
END;
$BODY$;