CREATE OR REPLACE PROCEDURE mes.reorder_guide_step_tasks(IN guide_step_task_id uuid, IN new_sequence integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    var_guide_step_id UUID;
    old_sequence INT;
BEGIN
    -- Get the current guide_step_id and sequence for the guide_step_task_id
    SELECT guide_step_id, sequence INTO var_guide_step_id, old_sequence
    FROM mes.guide_step_task
    WHERE id = guide_step_task_id;

    IF old_sequence < new_sequence THEN
        -- Decrease sequence numbers to create space if moving a task up
        UPDATE mes.guide_step_task
        SET sequence = sequence - 1
        WHERE guide_step_id = var_guide_step_id AND sequence > old_sequence AND sequence <= new_sequence;

        -- Move the old task to the new sequence position
        UPDATE mes.guide_step_task
        SET sequence = new_sequence
        WHERE id = guide_step_task_id;

    ELSIF old_sequence > new_sequence THEN
        -- Increase sequence numbers to create space if moving a task down
        UPDATE mes.guide_step_task
        SET sequence = sequence + 1
        WHERE guide_step_id = var_guide_step_id AND sequence < old_sequence AND sequence >= new_sequence;

        -- Move the old task to the new sequence position
        UPDATE mes.guide_step_task
        SET sequence = new_sequence
        WHERE id = guide_step_task_id;
    END IF;
END;
$$;

ALTER PROCEDURE mes.reorder_guide_step_tasks(uuid, integer) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.reorder_guide_step_tasks(uuid, integer) TO spacelinxuser;
