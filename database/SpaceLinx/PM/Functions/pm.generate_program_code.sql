CREATE OR REPLACE FUNCTION pm.generate_program_code()
RETURNS VARCHAR AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('pm.program_code_seq');

    -- Return the formatted program_code as 'PRG-000001', 'PRG-000002', etc.
    RETURN 'PRG-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
