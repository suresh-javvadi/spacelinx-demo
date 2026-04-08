CREATE OR REPLACE PROCEDURE mes.copy_guide_step(
	IN original_step_id uuid,
	IN user_email text,
	OUT new_step_id uuid)
LANGUAGE 'plpgsql'
AS $$
DECLARE
    original_step RECORD;
    new_sequence INTEGER;
BEGIN
    -- Get the original step details
    SELECT * INTO original_step FROM mes.guide_step WHERE id = original_step_id;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Step does not exist';
    END IF;
 
    -- Calculate the new sequence
    new_sequence := original_step.sequence + 1;
 
    -- Insert the new step
    INSERT INTO mes.guide_step (guide_id, image_id, video_id, sequence, title, is_active, created_by, created_at)
    VALUES (original_step.guide_id, original_step.image_id, original_step.video_id, 100000, 'Copy of ' || original_step.title, TRUE, user_email, NOW())
    RETURNING id INTO new_step_id;
 
    -- Copy tasks
    INSERT INTO mes.guide_step_task (guide_step_id, guide_id, name, description, type, taskdetails, sequence, ismandatory, is_active, created_by, created_at)
    SELECT new_step_id, original_step.guide_id, name, description, type, taskdetails, sequence, ismandatory, TRUE, user_email, NOW()
    FROM mes.guide_step_task
    WHERE guide_step_id = original_step_id;
 
    -- Copy equipment
    INSERT INTO mes.guide_step_equipment (quantity, guide_step_id, guide_id, equipment_type, part_id, tool_id, machine_id, is_active, created_by, created_at)
    SELECT quantity, new_step_id, original_step.guide_id, equipment_type, part_id, tool_id, machine_id, TRUE, user_email, NOW()
    FROM mes.guide_step_equipment
    WHERE guide_step_id = original_step_id;
 
    -- Reorder the steps
    CALL mes.reorder_guide_steps(new_step_id, new_sequence);
 
    -- Update the guide status to 'Draft'
    UPDATE mes.guide
    SET status = 'Draft'
    WHERE id = original_step.guide_id;
 
END;
$$;