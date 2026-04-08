CREATE OR REPLACE FUNCTION sc.generate_partner_code()
RETURNS VARCHAR AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.partner_code_seq');
    -- Return formatted program number
    RETURN 'P-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;