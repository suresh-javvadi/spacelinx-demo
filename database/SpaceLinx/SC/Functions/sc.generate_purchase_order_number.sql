CREATE OR REPLACE FUNCTION sc.generate_purchase_order_number()
RETURNS VARCHAR AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('sc.purchase_order_seq');

    -- Return the formatted purchase order number as 'PO-000001', 'PO-000002', etc.
    RETURN 'PO-' || LPAD(next_val::TEXT, 6, '0');

END;
$$ LANGUAGE plpgsql;