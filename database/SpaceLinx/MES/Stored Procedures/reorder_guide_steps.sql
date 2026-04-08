-- Create a new stored procedure to reorder guide steps
CREATE OR REPLACE PROCEDURE mes.reorder_guide_steps(IN guide_step_id UUID, IN new_sequence INT)
LANGUAGE plpgsql
AS $$
DECLARE
    var_guide_id UUID;
    old_sequence INT;
BEGIN
    -- Get the current guide_id and sequence for the guide_step_id
    SELECT guide_id, sequence INTO var_guide_id, old_sequence
    FROM mes.guide_step
    WHERE id = guide_step_id;

    IF old_sequence < new_sequence THEN
        -- Decrease sequence numbers to create space if moving a step up
        UPDATE mes.guide_step
        SET sequence = sequence - 1
        WHERE guide_id = var_guide_id AND sequence > old_sequence AND sequence <= new_sequence;

        -- Move the old step to the new sequence position
        UPDATE mes.guide_step
        SET sequence = new_sequence
        WHERE id = guide_step_id;

    ELSIF old_sequence > new_sequence THEN
        -- Increase sequence numbers to create space if moving a step down
        UPDATE mes.guide_step
        SET sequence = sequence + 1
        WHERE guide_id = var_guide_id AND sequence < old_sequence AND sequence >= new_sequence;

        -- Move the old step to the new sequence position
        UPDATE mes.guide_step
        SET sequence = new_sequence
        WHERE id = guide_step_id;
    END IF;
END;
$$
