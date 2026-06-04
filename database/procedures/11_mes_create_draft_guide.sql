CREATE OR REPLACE PROCEDURE mes.create_draft_guide(IN original_guide_id uuid, IN user_email text, OUT new_guide_id uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    original_guide RECORD;
    original_step RECORD;
    new_step_id UUID;
    new_version_number INT;
    existing_draft_count INT;
    ebom_record RECORD;
    part_weight NUMERIC;
BEGIN
    -- Get the original guide details
    SELECT * INTO original_guide FROM mes.guide WHERE id = original_guide_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guide does not exist';
    END IF;

    -- Check for existing draft versions
    SELECT COUNT(*)
    INTO existing_draft_count
    FROM mes.guide
    WHERE number = original_guide.number
      AND status = 'Draft';

    IF existing_draft_count > 0 THEN
        RAISE EXCEPTION 'A draft version for this guide already exists.';
    END IF;

    -- Determine the new version number
    SELECT COALESCE(MAX(version), 0) + 1 
    INTO new_version_number
    FROM mes.guide 
    WHERE number = original_guide.number; 

    -- Insert the new guide
    INSERT INTO mes.guide (name, platform_id, part_id, number, version, guide_type_id, clone_from_id, status, created_by, created_at)
    VALUES (original_guide.name, original_guide.platform_id, original_guide.part_id, original_guide.number, new_version_number, original_guide.guide_type_id,
           original_guide_id, 'Draft', user_email, NOW())
    RETURNING id INTO new_guide_id;

    -- Copy steps
    FOR original_step IN SELECT * FROM mes.guide_step WHERE guide_id = original_guide_id
    LOOP
        INSERT INTO mes.guide_step (guide_id, image_id, video_id, sequence, title, is_active, created_by, created_at)
        VALUES (new_guide_id, original_step.image_id, original_step.video_id, original_step.sequence, original_step.title, original_step.is_active, user_email, original_step.created_at)
        RETURNING id INTO new_step_id;

        -- Copy tasks for each step
        INSERT INTO mes.guide_step_task (guide_step_id, guide_id, name, description, type, taskdetails, sequence, ismandatory, is_active, created_by, created_at)
        SELECT new_step_id, new_guide_id, name, description, type, taskdetails, sequence, ismandatory, is_active, user_email, created_at
        FROM mes.guide_step_task
        WHERE guide_step_id = original_step.id;

        -- Copy equipment for each step
        INSERT INTO mes.guide_step_equipment (guide_step_id, guide_id, equipment_type, part_id, tool_id, machine_id, quantity, is_active, created_by, created_at)
        SELECT new_step_id, new_guide_id, equipment_type, part_id, tool_id, machine_id, quantity, is_active, user_email, created_at
        FROM mes.guide_step_equipment
        WHERE guide_step_id = original_step.id;
    END LOOP;

    -- Generate guide MBOM
    FOR ebom_record IN
        SELECT * FROM mes.ebom WHERE part_id = (SELECT part_id FROM mes.guide WHERE id = new_guide_id)
    LOOP
        -- Get the weight from the part table
        SELECT weight INTO part_weight FROM mes.part WHERE id = ebom_record.child_part_id;

        -- Insert into guide_mbom
        INSERT INTO mes.guide_mbom (guide_id, part_id, quantity, weight, created_at, created_by, is_active)
        VALUES (new_guide_id, ebom_record.child_part_id, 0, part_weight, NOW(), user_email, TRUE);
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
$$;

ALTER PROCEDURE mes.create_draft_guide(uuid, text, uuid) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.create_draft_guide(uuid, text, uuid) TO spacelinxuser;
