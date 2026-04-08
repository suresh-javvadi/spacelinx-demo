CREATE OR REPLACE FUNCTION sc.generate_req_number()
RETURNS VARCHAR AS $$
DECLARE
    next_val BIGINT;
    current_year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
BEGIN
    -- Get next value from the requisition sequence
    next_val := nextval('sc.req_seq');

    -- Return formatted requisition number like 'REQ-2025-0001'
    RETURN 'REQ-' || current_year || '-' || LPAD(next_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
