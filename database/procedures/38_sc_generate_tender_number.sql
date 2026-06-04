CREATE OR REPLACE FUNCTION sc.generate_tender_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_seq INT;
    current_year VARCHAR(4);
    prefix VARCHAR(10);
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    prefix := 'TND-' || current_year || '-';

    SELECT COALESCE(MAX(
        CASE
            WHEN tender_number LIKE prefix || '%'
            THEN CAST(SUBSTRING(tender_number FROM LENGTH(prefix) + 1) AS INT)
            ELSE 0
        END
    ), 0) + 1
    INTO next_seq
    FROM sc.tender
    WHERE tender_number LIKE prefix || '%';

    RETURN prefix || LPAD(next_seq::TEXT, 5, '0');
END;
$$;

ALTER FUNCTION sc.generate_tender_number() OWNER TO spacelinxadmin;
GRANT EXECUTE ON FUNCTION sc.generate_tender_number() TO spacelinxuser;
