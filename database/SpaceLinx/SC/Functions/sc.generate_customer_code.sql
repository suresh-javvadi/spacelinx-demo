CREATE OR REPLACE FUNCTION sc.generate_customer_code()
RETURNS VARCHAR AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.customer_code_seq');
    -- Return formatted program number
    RETURN 'CUS-' || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;