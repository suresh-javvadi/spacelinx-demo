CREATE OR REPLACE PROCEDURE mes.import_locations(
	IN records jsonb[],
	IN user_email text,
	OUT results jsonb)
LANGUAGE 'plpgsql'
AS $$
DECLARE
    location jsonb;
    location_number TEXT;
    location_name TEXT;
    valid BOOLEAN;
    local_error_message TEXT;
    result jsonb;
    index INT;
BEGIN
    -- Initialize the results as an empty JSON array
    results := '[]'::jsonb;

    -- Loop through the array of locations
    FOR index IN 1 .. array_length(records, 1) LOOP
        location := records[index];
        valid := TRUE;
        local_error_message := NULL;

        location_number := location->>'Number';
        location_name := location->>'Name';

        -- Validate location_number and location_name (both are required)
        IF location_number IS NULL OR location_number = '' THEN
            local_error_message := 'Location number is required';
            valid := FALSE;
        END IF;

        IF location_name IS NULL OR location_name = '' THEN
            local_error_message := 'Location name is required';
            valid := FALSE;
        END IF;

        -- Check if location number already exists
        IF EXISTS (SELECT 1 FROM mes.location WHERE number = location_number) THEN
            local_error_message := 'Location number already exists';
            valid := FALSE;
        END IF;

        -- If everything is valid, insert the location into the table
        IF valid THEN
            INSERT INTO mes.location (number, name, created_by, created_at)
            VALUES (location_number, location_name, user_email, NOW());

            -- Record success in the results
            result := jsonb_build_object('row_number', index, 'status', 'success');
        ELSE
            -- Record validation failure in the results
            result := jsonb_build_object('row_number', index, 'error_message', local_error_message);
        END IF;

        -- Append the result to the results array
        results := results || jsonb_build_array(result);
    END LOOP;
END;
$$;