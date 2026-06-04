CREATE OR REPLACE PROCEDURE mes.get_part_sequence(IN input_sequence text, OUT next_sequence text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    last_sequence TEXT;
    middle_number INTEGER;
BEGIN

    -- Get the latest sequence safely
    SELECT number
    INTO last_sequence
    FROM mes.part
    WHERE number LIKE input_sequence || '%'
    ORDER BY number DESC
    LIMIT 1;

    IF last_sequence IS NOT NULL THEN
        -- Extract and increment the middle number
        middle_number := (substring(last_sequence from '-(\d+)-')::INTEGER + 1);
        -- Construct the new sequence with the incremented middle number (five digits) and '01' at the end
        next_sequence := input_sequence || '-' || LPAD(middle_number::TEXT, 5, '0') || '-01';
    ELSE
        -- If no sequence found, start with the input sequence followed by '-00001-01'
        next_sequence := input_sequence || '-00001-01';
    END IF;
END;
$$;

ALTER PROCEDURE mes.get_part_sequence(text, text) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.get_part_sequence(text, text) TO spacelinxuser;
