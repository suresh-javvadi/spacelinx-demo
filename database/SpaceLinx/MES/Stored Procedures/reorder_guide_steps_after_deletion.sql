-- Create a new stored procedure to reorder guide steps after deletion
CREATE OR REPLACE PROCEDURE mes.reorder_guide_steps_after_deletion(IN guide_id_var UUID, IN deleted_sequence INT)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Decrease sequence numbers for all steps that come after the deleted step
    UPDATE mes.guide_step
    SET sequence = sequence - 1
    WHERE guide_id = guide_id_var AND sequence > deleted_sequence;
END;
$$