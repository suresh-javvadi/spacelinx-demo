CREATE OR REPLACE PROCEDURE mes.validate_record(IN record jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
    part_number TEXT;
BEGIN
    part_number := record->>'PartNumber';

    CREATE TEMP TABLE IF NOT EXISTS validation_results (
        row_number INT,
        error_message TEXT
    );

    IF EXISTS (SELECT 1 FROM mes.part WHERE part_number = part_number) THEN
        INSERT INTO validation_results VALUES ((record->>'RowNumber')::INT, 'Part number already exists');
    ELSE
        -- Add other validation checks here
        INSERT INTO validation_results VALUES ((record->>'RowNumber')::INT, NULL);
    END IF;
END;
$$;

ALTER PROCEDURE mes.validate_record(jsonb) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.validate_record(jsonb) TO spacelinxuser;
