CREATE OR REPLACE PROCEDURE mes.reorder_guide_steps_after_deletion(IN guide_id_var uuid, IN deleted_sequence integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Decrease sequence numbers for all steps that come after the deleted step
    UPDATE mes.guide_step
    SET sequence = sequence - 1
    WHERE guide_id = guide_id_var AND sequence > deleted_sequence;
END;
$$;

ALTER PROCEDURE mes.reorder_guide_steps_after_deletion(uuid, integer) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.reorder_guide_steps_after_deletion(uuid, integer) TO spacelinxuser;
