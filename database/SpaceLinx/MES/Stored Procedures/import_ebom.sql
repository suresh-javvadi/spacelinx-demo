CREATE OR REPLACE PROCEDURE mes.import_ebom(
	IN records jsonb[],
	IN user_email text,
	OUT results jsonb)
LANGUAGE 'plpgsql'
AS $$
DECLARE
    ebom_item jsonb;
    part_name TEXT;
    part_number TEXT;
    child_part_name TEXT;
    child_part_number TEXT;
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

    -- Loop through the array of EBOM items
    FOR index IN 1 .. array_length(records, 1) LOOP
        ebom_item := records[index];
        valid := TRUE;
        local_error_message := NULL;

        part_name := ebom_item->>'Part Name';
        part_number := ebom_item->>'Part Number';
        child_part_name := ebom_item->>'Child Part Name';
        child_part_number := ebom_item->>'Child Part Number';
        quantity := (ebom_item->>'Quantity')::INT;

        -- Validate part_name and child_part_name (both are required)
        IF part_name IS NULL OR part_name = '' THEN
            local_error_message := 'Part name is required';
            valid := FALSE;
        END IF;

        IF child_part_name IS NULL OR child_part_name = '' THEN
            local_error_message := 'Child part name is required';
            valid := FALSE;
        END IF;

        -- Get the ebom_part_id by part_number, throw error if not found
        IF valid THEN
            SELECT p.id INTO ebom_part_id FROM mes.part p WHERE p.number = part_number;
            IF ebom_part_id IS NULL THEN
                local_error_message := 'Part "' || part_name || '" does not exist';
                valid := FALSE;
            END IF;
        END IF;

        -- Get the ebom_child_part_id by child_part_number, throw error if not found
        IF valid THEN
            SELECT cp.id INTO ebom_child_part_id FROM mes.part cp WHERE cp.number = child_part_number;
            IF ebom_child_part_id IS NULL THEN
                local_error_message := 'Child part "' || child_part_name || '" does not exist';
                valid := FALSE;
            END IF;
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
                INSERT INTO mes.ebom (part_id, child_part_id, quantity, created_by, created_at)
                VALUES (ebom_part_id, ebom_child_part_id, quantity, user_email, NOW());
            END IF;
        END IF;

        -- Record the result
        result := jsonb_build_object('row_number', index, 'error_message', local_error_message);
        results := results || jsonb_build_array(result);
    END LOOP;
END;
$$;

