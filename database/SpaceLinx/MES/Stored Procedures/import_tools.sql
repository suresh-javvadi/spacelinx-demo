CREATE OR REPLACE PROCEDURE mes.import_tools(
    IN tools jsonb[],
    IN user_email text,
    OUT results jsonb)
LANGUAGE 'plpgsql'
AS $$
DECLARE
    tool jsonb;
    tool_number TEXT;
    tool_name TEXT;
    tool_type_name TEXT;
    tool_type_id UUID;
    valid BOOLEAN;
    local_error_message TEXT;
    result jsonb;
    index INT;
BEGIN
    -- Initialize the results as an empty JSON array
    results := '[]'::jsonb;

    -- Loop through the array of tools
    FOR index IN 1 .. array_length(tools, 1) LOOP
        tool := tools[index];
        valid := TRUE;
        local_error_message := NULL;

        tool_number := tool->>'Number';
        tool_name := tool->>'Name';
        tool_type_name := tool->>'ToolType';

        -- Validate tool_number and tool_name (both are required)
        IF tool_number IS NULL OR tool_number = '' THEN
            local_error_message := 'Tool number is required';
            valid := FALSE;
        END IF;

        IF tool_name IS NULL OR tool_name = '' THEN
            local_error_message := 'Tool name is required';
            valid := FALSE;
        END IF;

        -- Validate and/or create tool_type (based on tool_type_name)
        IF tool_type_name IS NULL OR tool_type_name = '' THEN
            local_error_message := 'Tool type is required';
            valid := FALSE;
        ELSE
            -- Try to find the tool type by name
            SELECT id INTO tool_type_id FROM mes.tool_type WHERE name = tool_type_name;
            
            -- If the tool type doesn't exist, create a new one
            IF tool_type_id IS NULL THEN
                INSERT INTO mes.tool_type (name, created_by, created_at)
                VALUES (tool_type_name, user_email, NOW()) RETURNING id INTO tool_type_id;
            END IF;
        END IF;

        -- Check if tool number already exists
        IF EXISTS (SELECT 1 FROM mes.tool WHERE number = tool_number) THEN
            local_error_message := 'Tool number already exists';
            valid := FALSE;
        END IF;

        -- If everything is valid, insert the tool into the table
        IF valid THEN
            INSERT INTO mes.tool (number, name, tool_type_id, created_by, created_at)
            VALUES (tool_number, tool_name, tool_type_id, user_email, NOW());

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
