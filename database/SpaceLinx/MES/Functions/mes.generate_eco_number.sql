CREATE OR REPLACE FUNCTION mes.generate_eco_number()
RETURNS VARCHAR AS $$
DECLARE
    max_code INT;
    new_code VARCHAR(50);
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 5) AS INT)), 0) INTO max_code
    FROM mes.eco;
 
    new_code := 'ECO-' || LPAD((max_code + 1)::TEXT, 8, '0');
 
    RETURN new_code;
END;
$$
LANGUAGE plpgsql;