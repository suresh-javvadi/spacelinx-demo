CREATE OR REPLACE FUNCTION sc.generate_stock_movement_number()
RETURNS varchar(255) AS $$
DECLARE
    next_val INTEGER;
    prefix TEXT := 'SM-';
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(movement_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_val
    FROM sc.stock_movement
    WHERE movement_number LIKE 'SM-%';

    RETURN prefix || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;