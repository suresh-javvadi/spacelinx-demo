CREATE OR REPLACE FUNCTION pm.generate_project_code()
RETURNS VARCHAR AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('pm.project_code_seq');

    -- Return the formatted project_code as 'PGJ-000001', 'PGJ-000002', etc.
    RETURN 'PRJ-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
