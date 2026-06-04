CREATE OR REPLACE PROCEDURE mes.import_ebom(IN records jsonb[], IN user_email text, OUT results jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
    ebom_item jsonb;
    part_name TEXT;
    part_number_value TEXT;
    child_part_name TEXT;
    child_part_number_value TEXT;
    ebom_part_id UUID;
    ebom_child_part_id UUID;
    quantity INT;
    valid BOOLEAN;
    local_error_message TEXT;
    result jsonb;
    index INT;
BEGIN
    -- Initialize the results as an empty JSON array
    results := '[]'::jsonb;

    -- Validate input array
    IF records IS NULL OR array_length(records, 1) IS NULL THEN
        RAISE EXCEPTION 'No records provided';
    END IF;

    -- Loop through the array of EBOM items
    FOR index IN 1 .. array_length(records, 1) LOOP
        ebom_item := records[index];
        valid := TRUE;
        local_error_message := NULL;

        part_name := TRIM(ebom_item->>'Part Name');
        part_number_value := TRIM(ebom_item->>'Part Number');
        child_part_name := TRIM(ebom_item->>'Child Part Name');
        child_part_number_value := TRIM(ebom_item->>'Child Part Number');
        quantity := NULLIF(TRIM(ebom_item->>'Quantity'), '')::INT;

        -- Validate required fields
        IF part_name IS NULL OR part_name = '' THEN
            local_error_message := 'Part name is required';
            valid := FALSE;
        END IF;

        IF child_part_name IS NULL OR child_part_name = '' THEN
            local_error_message := 'Child part name is required';
            valid := FALSE;
        END IF;

        IF part_number_value IS NULL OR part_number_value = '' THEN
            local_error_message := 'Parent Part Number is required';
            valid := FALSE;
        END IF;

        IF child_part_number_value IS NULL OR child_part_number_value = '' THEN
            local_error_message := 'Child Part Number is required';
            valid := FALSE;
        END IF;

        IF quantity IS NULL OR quantity <= 0 THEN
            local_error_message := 'Quantity must be a positive integer';
            valid := FALSE;
        END IF;

        -- Validate parent part
        IF valid THEN
            SELECT p.id INTO ebom_part_id FROM mes.part p WHERE p.part_number = part_number_value AND p.deleted_at IS NULL;

            IF ebom_part_id IS NULL THEN
                local_error_message := 'Part "' || part_name || '" does not exist';
                valid := FALSE;
            END IF;
        END IF;

        -- Validate child part
        IF valid THEN
            SELECT cp.id INTO ebom_child_part_id FROM mes.part cp WHERE cp.part_number = child_part_number_value AND cp.deleted_at IS NULL;
            IF ebom_child_part_id IS NULL THEN
                local_error_message := 'Child part "' || child_part_name || '" does not exist';
                valid := FALSE;
            END IF;
        END IF;

        -- Prevent parent=child
        IF valid AND ebom_part_id = ebom_child_part_id THEN
            local_error_message := 'Parent and Child Part cannot be the same (' || part_number_value || ')';
            valid := FALSE;
        END IF;

        -- If both ebom_part_id and ebom_child_part_id are valid, check for existing EBOM entry
        IF valid THEN
            IF EXISTS (
                SELECT 1 FROM mes.ebom e 
                WHERE e.part_id = ebom_part_id AND e.child_part_id = ebom_child_part_id
            ) THEN
                local_error_message := 'Duplicate entry for part "' || part_name || '" and child part "' || child_part_name || '"';
                valid := FALSE;
            ELSE
                BEGIN
                    INSERT INTO mes.ebom (part_id, child_part_id, quantity, created_by, created_at)
                    VALUES (ebom_part_id, ebom_child_part_id, quantity, user_email, NOW());
                EXCEPTION WHEN OTHERS THEN
                    valid := FALSE;
                    local_error_message := 'Failed to insert EBOM for "' || part_name || '" → "' || child_part_name || '": ' || SQLERRM;
                END;
            END IF;
        END IF;

        -- Build result record
        IF valid THEN
            result := jsonb_build_object(
                'row_number', index,
                'status', 'success',
                'parent_part_number', part_number_value,
                'child_part_number', child_part_number_value
            );
        ELSE
            result := jsonb_build_object(
                'row_number', index,
                'status', 'error',
                'parent_part_number', part_number_value,
                'child_part_number', child_part_number_value,
                'error_message', local_error_message
            );
        END IF;

        -- Append to results array
        results := results || jsonb_build_array(result);
    END LOOP;
END;
$$;

ALTER PROCEDURE mes.import_ebom(jsonb[], text, jsonb) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.import_ebom(jsonb[], text, jsonb) TO spacelinxuser;
