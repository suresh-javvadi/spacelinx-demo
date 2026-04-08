CREATE OR REPLACE FUNCTION sc.generate_grn_number()
RETURNS VARCHAR AS $$
DECLARE
    next_val BIGINT;
    current_year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
BEGIN
    -- Get the next value from the sequence
    next_val := nextval('sc.grn_seq');
 
    -- Return the formatted GRN number as 'GRN-2025-0001', 'GRN-2025-0002', etc.
    RETURN 'GRN-' || current_year || '-' || LPAD(next_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
