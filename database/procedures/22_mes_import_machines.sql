CREATE OR REPLACE PROCEDURE mes.import_machines(IN records jsonb[], IN user_email text, OUT results jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
    machine jsonb;
    machine_number TEXT;
    machine_name TEXT;
    machine_type_name TEXT;
    machine_type_id UUID;
    valid BOOLEAN;
    local_error_message TEXT;
    result jsonb;
    index INT;
BEGIN
    -- Initialize the results as an empty JSON array
    results := '[]'::jsonb;

    -- Loop through the array of machines
    FOR index IN 1 .. array_length(records, 1) LOOP
        machine := records[index];
        valid := TRUE;
        local_error_message := NULL;

        machine_number := machine->>'Number';
        machine_name := machine->>'Name';
        machine_type_name := machine->>'Type';

        -- Validate machine_number and machine_name (both are required)
        IF machine_number IS NULL OR machine_number = '' THEN
            local_error_message := 'Machine number is required';
            valid := FALSE;
        END IF;

        IF machine_name IS NULL OR machine_name = '' THEN
            local_error_message := 'Machine name is required';
            valid := FALSE;
        END IF;

        -- Validate and/or create machine_type (based on machine_type_name)
        IF machine_type_name IS NULL OR machine_type_name = '' THEN
            local_error_message := 'Machine type is required';
            valid := FALSE;
        ELSE
            -- Try to find the machine type by name
            SELECT id INTO machine_type_id FROM mes.machine_type WHERE name = machine_type_name;

            -- If the machine type doesn't exist, create a new one
            IF machine_type_id IS NULL THEN
                INSERT INTO mes.machine_type (name, created_by, created_at)
                VALUES (machine_type_name, user_email, NOW()) RETURNING id INTO machine_type_id;
            END IF;
        END IF;

        -- Check if machine number already exists
        IF EXISTS (SELECT 1 FROM mes.machine WHERE number = machine_number) THEN
            local_error_message := 'Machine number already exists';
            valid := FALSE;
        END IF;

        -- If everything is valid, insert the machine into the table
        IF valid THEN
            INSERT INTO mes.machine (number, name, machine_type_id, created_by, created_at)
            VALUES (machine_number, machine_name, machine_type_id, user_email, NOW());

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

ALTER PROCEDURE mes.import_machines(jsonb[], text, jsonb) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.import_machines(jsonb[], text, jsonb) TO spacelinxuser;
