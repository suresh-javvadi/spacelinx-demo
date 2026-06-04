CREATE OR REPLACE PROCEDURE mes.reset_work_order_step(IN workorderstepid uuid, IN p_user_email text)
    LANGUAGE plpgsql
    AS $$DECLARE
    workorder_id UUID;
    guidestep_id UUID;
    total_execution_time INTERVAL := INTERVAL '0';
    guide_task RECORD;
BEGIN
    -- Check if the work order step exists
    IF NOT EXISTS (SELECT 1 FROM mes.work_order_step wo WHERE wo.id = workorderstepid) THEN
        RAISE EXCEPTION 'Work order step not found';
    END IF;
    -- Retrieve workorder_id and guide_step_id from the work order step
    SELECT wos.work_order_id, wos.guide_step_id
    INTO workorder_id, guidestep_id
    FROM mes.work_order_step wos
    WHERE wos.id = workorderstepid;
 
    -- Delete tasks associated with the work order step
    DELETE FROM mes.work_order_task wot
    WHERE wot.work_order_id = workorder_id
    AND wot.guide_step_task_id IN (
        SELECT gst.id FROM mes.guide_step_task gst
        WHERE gst.guide_step_id = guidestep_id
    );
 
    -- Set the captured time of the work order step to 0
    UPDATE mes.work_order_step wos
    SET captured_time = INTERVAL '0',
        status = 'Pending'
    WHERE wos.id = workorderstepid;
 
    -- Recalculate the total execution time for all steps in the work order
    SELECT SUM(wos.captured_time)
    INTO total_execution_time
    FROM mes.work_order_step wos
    WHERE wos.work_order_id = workorder_id;
 
    -- Update the work order with the new total execution time
    UPDATE mes.work_order wo
    SET execution_time = total_execution_time,
        status = 'Pending'
    WHERE wo.id = workorder_id;
 
    -- Create tasks for the guide step
    FOR guide_task IN
        SELECT id
        FROM mes.guide_step_task
        WHERE guide_step_id = guidestep_id
    LOOP
        -- Insert WorkOrderTask for each GuideTask
        INSERT INTO mes.work_order_task (work_order_id, guide_step_task_id, work_order_step_id, status, created_at, created_by)
        VALUES (workorder_id, guide_task.id, workorderstepid, 'Pending', NOW(), p_user_email);
    END LOOP;
 
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback transaction and re-raise the exception
        RAISE;
END;$$;

ALTER PROCEDURE mes.reset_work_order_step(uuid, text) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.reset_work_order_step(uuid, text) TO spacelinxuser;
