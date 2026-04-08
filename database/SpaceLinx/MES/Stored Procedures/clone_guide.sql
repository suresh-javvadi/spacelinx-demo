CREATE OR REPLACE PROCEDURE mes.clone_guide(
IN original_guide_id uuid,
IN new_part_id uuid,
IN user_email text,
OUT new_guide_id uuid,
OUT new_guide_number text)
LANGUAGE 'plpgsql'
AS $$
DECLARE
    original_guide RECORD;
    new_part RECORD;
    original_step RECORD;
    new_step_id UUID;
    ebom_record RECORD;
    part_weight NUMERIC;
BEGIN
    -- Get the original guide details
    SELECT * INTO original_guide FROM mes.guide WHERE id = original_guide_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guide does not exist';
    END IF;
 
    -- Get the part details
    SELECT * INTO new_part FROM mes.part WHERE id = new_part_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Part does not exist';
    END IF;
 
    -- Insert the new guide
    INSERT INTO mes.guide (name, platform_id, part_id, guide_type_id, clone_from_id, calculated_weight, status, created_by, created_at)
    VALUES ('Copy of ' || original_guide.name, original_guide.platform_id, new_part.id, original_guide.guide_type_id,
        original_guide_id, original_guide.calculated_weight, 'Draft', user_email, NOW())
    RETURNING id INTO new_guide_id;
 
    SELECT number INTO new_guide_number FROM mes.guide WHERE id = new_guide_id;
 
    -- Copy steps
    FOR original_step IN SELECT * FROM mes.guide_step WHERE guide_id = original_guide_id
    LOOP
        INSERT INTO mes.guide_step (guide_id, image_id, video_id, sequence, title, is_active, created_by, created_at)
        VALUES (new_guide_id, original_step.image_id, original_step.video_id, original_step.sequence, original_step.title, original_step.is_active, user_email, NOW())
        RETURNING id INTO new_step_id;
 
        -- Copy tasks for each step
        INSERT INTO mes.guide_step_task (guide_step_id, guide_id, name, description, type, sequence, taskdetails, ismandatory, is_active, created_by, created_at)
        SELECT new_step_id, new_guide_id, name, description, type, sequence, taskdetails, ismandatory, TRUE, user_email, NOW()
        FROM mes.guide_step_task
        WHERE guide_step_id = original_step.id;
 
        -- Copy equipment for each step
        INSERT INTO mes.guide_step_equipment (guide_step_id, guide_id, equipment_type, part_id, tool_id, machine_id, quantity, is_active, created_by, created_at)
        SELECT new_step_id, new_guide_id, equipment_type, part_id, tool_id, machine_id, quantity, TRUE, user_email, NOW()
        FROM mes.guide_step_equipment
        WHERE guide_step_id = original_step.id;
    END LOOP;
 
    -- BOM cloning removed and handled in a separate procedure
    /*
    -- Copy EBOM from the original guide and insert into the new part's EBOM
    FOR guide_ebom_record IN
        SELECT * FROM mes.guide_ebom WHERE guide_id = original_guide_id
    LOOP
        -- Insert into mes.ebom with ON CONFLICT to avoid duplicates
        INSERT INTO mes.ebom (part_id, child_part_id, quantity, created_by, created_at)
        VALUES (new_part_id, guide_ebom_record.child_part_id, guide_ebom_record.quantity, user_email, NOW())
        ON CONFLICT (part_id, child_part_id) DO NOTHING;
    END LOOP;
    */
 
    -- Copy EBOM from the original guide and insert into the new guide's MBOM
    FOR ebom_record IN
        SELECT * FROM mes.ebom WHERE part_id = new_part_id
    LOOP
        -- Get the weight from the part table
        SELECT weight INTO part_weight FROM mes.part WHERE id = ebom_record.child_part_id;
 
        -- Insert into guide_mbom
        INSERT INTO mes.guide_mbom (guide_id, part_id, quantity, weight, created_at, created_by, is_active)
        VALUES (new_guide_id, ebom_record.child_part_id, ebom_record.quantity, part_weight, NOW(), user_email, TRUE);
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
$$;