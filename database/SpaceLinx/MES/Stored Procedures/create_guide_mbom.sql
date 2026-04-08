CREATE OR REPLACE PROCEDURE mes.create_guide_mbom(
	IN guide_id uuid,
	IN user_email text)
LANGUAGE 'plpgsql'
AS $$
DECLARE
    record RECORD;
    guide RECORD;
    part_weight NUMERIC;
BEGIN
    -- Fetch the guide
    PERFORM * FROM mes.guide WHERE id = guide_id;

    -- Fetch the related ebom records
    FOR record IN
        SELECT * FROM mes.ebom WHERE part_id = (SELECT part_id FROM mes.guide WHERE id = guide_id)
    LOOP
        -- Get the weight from the part table
        SELECT weight INTO part_weight FROM mes.part WHERE id = record.child_part_id;

        -- Insert into guide_mbom
        INSERT INTO mes.guide_mbom (guide_id, part_id, quantity, weight, created_at, created_by, is_active)
        VALUES (guide_id, record.child_part_id, 0, part_weight, NOW(), user_email, TRUE);
    END LOOP;
END;
$$;