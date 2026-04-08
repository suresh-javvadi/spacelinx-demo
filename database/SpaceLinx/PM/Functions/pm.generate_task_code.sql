CREATE SEQUENCE IF NOT EXISTS pm.task_code_seq START 1;

CREATE OR REPLACE FUNCTION pm.generate_task_code()
RETURNS VARCHAR AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('pm.task_code_seq');

    -- Return the formatted task_code as 'TSK-000001', 'TSK-000002', etc.
    RETURN 'TSK-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
