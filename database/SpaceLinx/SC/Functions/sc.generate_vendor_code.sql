CREATE OR REPLACE FUNCTION sc.generate_vendor_code()
RETURNS VARCHAR AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.vendor_code_seq');
    
    -- Return formatted program number
    RETURN 'VEN-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;