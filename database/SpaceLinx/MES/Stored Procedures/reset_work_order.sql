CREATE OR REPLACE PROCEDURE mes.reset_work_order(
	IN workorder_id uuid,
	IN user_email text)
LANGUAGE 'plpgsql'
AS $$
DECLARE
    guide_step RECORD;
    guide_task RECORD;
    work_order_step_id UUID;
BEGIN
    -- Check if the work order exists
    IF NOT EXISTS (SELECT 1 FROM mes.work_order wo WHERE wo.id = workorder_id) THEN
        RAISE EXCEPTION 'Work order not found';
    END IF;
 
    -- Delete tasks
    DELETE FROM mes.work_order_task wot 
    WHERE wot.work_order_id = workorder_id;
 
    -- Delete steps
    DELETE FROM mes.work_order_step wos 
    WHERE wos.work_order_id = workorder_id;
    -- Update execution time to 0 and set status to 'Pending'
    UPDATE mes.work_order
    SET execution_time = INTERVAL '0',
        status = 'Pending'
    WHERE id = workorder_id;
    -- Insert new steps from guide steps
    FOR guide_step IN
        SELECT gs.id, gs.image_id
        FROM mes.guide_step gs
        WHERE gs.guide_id = (SELECT wo.guide_id FROM mes.work_order wo WHERE wo.id = workorder_id)
    LOOP
        -- Insert into work_order_step and return the ID
        INSERT INTO mes.work_order_step (work_order_id, guide_step_id, captured_time, execution_time, image_id, manager_id, technician_id, is_active, created_by, created_at, comment)
        VALUES (workorder_id, guide_step.id, INTERVAL '0', INTERVAL '0', guide_step.image_id, NULL, NULL, TRUE, user_email, NOW(), NULL)
        RETURNING id INTO work_order_step_id;
 
        -- Insert tasks for each guide step
        FOR guide_task IN
            SELECT id
            FROM mes.guide_step_task
            WHERE guide_step_id = guide_step.id
        LOOP
            INSERT INTO mes.work_order_task (work_order_id, guide_step_task_id, work_order_step_id, status, created_at, created_by)
            VALUES (workorder_id, guide_task.id, work_order_step_id, 'Pending', NOW(), user_email);
        END LOOP;
    END LOOP;
 
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback transaction
        RAISE;
END;
$$;