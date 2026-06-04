CREATE OR REPLACE PROCEDURE mes.import_parts(IN records jsonb[], IN user_email text, OUT results jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
    part jsonb;
    part_name TEXT;
    part_description TEXT;
    part_type_name TEXT;
    part_type_id UUID;
    unit_of_measure_name TEXT;
    unit_of_measure_id UUID;
    make_buy TEXT;
    make_buy_value INT;
    unit_price_value DECIMAL(18,2);
    unit_price_text TEXT;
    manufacturing_part_number_value TEXT;
    manufacturer_name_value TEXT;
    trl_value INT;
    trl_text TEXT;
    space_qualified_value BOOLEAN;
    reference_number_value VARCHAR(255);
    item_type_value VARCHAR(255);
    is_serial_number_required BOOLEAN;
    weight DOUBLE PRECISION;
    weight_text TEXT;
    valid BOOLEAN;
    local_error_message TEXT;
    result jsonb;
    index INT;
    generated_part_number TEXT;
BEGIN
    -- Initialize the results as an empty JSON array
    results := '[]'::jsonb;

    -- Loop through the array of parts
    FOR index IN 1 .. array_length(records, 1) LOOP
        part := records[index];
        valid := TRUE;
        local_error_message := NULL;
        is_serial_number_required := TRUE; -- Reset default for each iteration

        -- Extract values from JSON based on template columns
        part_name := part->>'Name';
        part_description := part->>'Description';
        part_type_name := part->>'Type';
        unit_of_measure_name := part->>'Unit of Measure';
        make_buy := part->>'Make Or Buy';
        manufacturing_part_number_value := part->>'Manufacturing Part Number';
        manufacturer_name_value := part->>'Manufacturer Name';
        reference_number_value := part->>'Reference Number';
        item_type_value := part->>'Item Type';

        -- Extract and validate weight (required, defaults to 0 if empty)
        weight_text := TRIM(COALESCE(part->>'Weight', ''));
        IF weight_text = '' THEN
            weight := 0; -- Default value when empty
        ELSE
            BEGIN
                weight := weight_text::DOUBLE PRECISION;
            EXCEPTION WHEN others THEN
                valid := FALSE;
                local_error_message := 'Invalid value for Weight: "' || weight_text || '"';
            END;
        END IF;

        -- Extract and validate unit price (optional, NULL if empty)
        unit_price_text := TRIM(COALESCE(part->>'Unit Price', ''));
        IF unit_price_text = '' THEN
            unit_price_value := NULL; -- Empty becomes NULL
        ELSE
            BEGIN
                unit_price_value := unit_price_text::DECIMAL(18,2);
            EXCEPTION WHEN others THEN
                valid := FALSE;
                local_error_message := 'Invalid value for Unit Price: "' || unit_price_text || '"';
            END;
        END IF;

        -- Extract and validate TRL (Technology Readiness Level: 1-12, required if provided)
        trl_text := TRIM(COALESCE(part->>'TRL', ''));
        IF trl_text = '' THEN
            trl_value := NULL; -- Empty is allowed, set to NULL
        ELSE
            BEGIN
                trl_value := trl_text::INT;
                IF trl_value < 1 OR trl_value > 12 THEN
                    valid := FALSE;
                    local_error_message := 'TRL must be between 1 and 12, got: ' || trl_value::TEXT;
                END IF;
            EXCEPTION WHEN others THEN
                valid := FALSE;
                local_error_message := 'Invalid value for TRL: "' || trl_text || '"';
            END;
        END IF;

        -- Extract and validate Space Qualified
        IF part ? 'Space Qualified' THEN
            CASE LOWER(TRIM(COALESCE(part->>'Space Qualified', '')))
                WHEN 'true', 'yes', '1', 't', 'y' THEN
                    space_qualified_value := TRUE;
                WHEN 'false', 'no', '0', 'f', 'n', '' THEN
                    space_qualified_value := FALSE;
                ELSE
                    space_qualified_value := NULL;
            END CASE;
        ELSE
            space_qualified_value := NULL;
        END IF;

        -- Set serial number requirement
        IF part ? 'Is Serial Number Required' THEN
            CASE LOWER(TRIM(COALESCE(part->>'Is Serial Number Required', '')))
                WHEN 'no', 'false', '0', 'n', 'f' THEN
                    is_serial_number_required := FALSE;
                ELSE
                    is_serial_number_required := TRUE;
            END CASE;
        END IF;

        -- Validate part name (required)
        IF part_name IS NULL OR TRIM(part_name) = '' THEN
            local_error_message := 'Part name is required';
            valid := FALSE;
        END IF;

        -- Validate and get/create part_type_id
        IF valid THEN
            IF part_type_name IS NULL OR TRIM(part_type_name) = '' THEN
                local_error_message := 'Part type is required';
                valid := FALSE;
            ELSE
                SELECT id INTO part_type_id 
                FROM mes.part_type 
                WHERE name = TRIM(part_type_name)
                    AND deleted_at IS NULL;
                
                IF part_type_id IS NULL THEN
                    INSERT INTO mes.part_type (name, created_by, created_at) 
                    VALUES (TRIM(part_type_name), user_email, NOW()) 
                    RETURNING id INTO part_type_id;
                END IF;
            END IF;
        END IF;

        -- Validate and get/create unit_of_measure_id if provided
        IF valid AND unit_of_measure_name IS NOT NULL AND TRIM(unit_of_measure_name) != '' THEN
            SELECT id INTO unit_of_measure_id 
            FROM mes.unit_of_measure 
            WHERE name = TRIM(unit_of_measure_name)
                AND deleted_at IS NULL;
            
            IF unit_of_measure_id IS NULL THEN
                INSERT INTO mes.unit_of_measure (name, created_by, created_at)
                VALUES (TRIM(unit_of_measure_name), user_email, NOW()) 
                RETURNING id INTO unit_of_measure_id;
            END IF;
        ELSE
            unit_of_measure_id := NULL;
        END IF;

        -- Validate make_buy (required)
        IF valid THEN
            IF make_buy IS NULL OR TRIM(make_buy) = '' THEN
                local_error_message := 'Make Or Buy is required';
                valid := FALSE;
            ELSIF LOWER(TRIM(make_buy)) = 'make' THEN
                make_buy_value := 0;
            ELSIF LOWER(TRIM(make_buy)) = 'buy' THEN
                make_buy_value := 1;
            ELSE
                local_error_message := 'Invalid value for Make Or Buy. Must be "Make" or "Buy"';
                valid := FALSE;
            END IF;
        END IF;

        -- Check manufacturer details constraint
        -- Constraint: If make_buy = 1 (BUY), then either:
        --   a) item_type is 'Goods' or 'Services', OR
        --   b) BOTH manufacturing_part_number AND manufacturer_name are provided and non-empty
        -- If make_buy = 0 (MAKE), no restriction
        IF valid AND make_buy_value = 1 THEN
            -- For BUY items, check if item_type is Goods or Services
            IF TRIM(COALESCE(item_type_value, '')) NOT IN ('Goods', 'Services') THEN
                -- item_type is NOT Goods/Services, so manufacturing details are REQUIRED
                IF (manufacturing_part_number_value IS NULL 
                    OR TRIM(manufacturing_part_number_value) = ''
                    OR manufacturer_name_value IS NULL 
                    OR TRIM(manufacturer_name_value) = '') THEN
                    
                    valid := FALSE;
                    local_error_message := 'For "Buy" items with Item Type other than Goods/Services: ' ||
                                           'both Manufacturing Part Number and Manufacturer Name are required and non-empty';
                END IF;
            END IF;
        END IF;

        -- Check for duplicate manufacturing_part_number if provided
        IF valid AND manufacturing_part_number_value IS NOT NULL AND TRIM(manufacturing_part_number_value) != '' THEN
            IF EXISTS (
                SELECT 1 FROM mes.part 
                WHERE manufacturing_part_number = TRIM(manufacturing_part_number_value)
                    AND deleted_at IS NULL
            ) THEN
                valid := FALSE;
                local_error_message := 'Manufacturing part number "' || TRIM(manufacturing_part_number_value) || '" already exists';
            END IF;
        END IF;

        -- Insert if valid (trigger will auto-generate part_number_suffix)
        IF valid THEN
            BEGIN
                INSERT INTO mes.part (
                    part_type_id,
                    version,
                    name,
                    description,
                    unit_of_measure_id,
                    make_buy,
                    status,
                    unit_price,
                    manufacturing_part_number,
                    manufacturer_name,
                    trl,
                    space_qualified,
                    reference_number,
                    item_type,
                    is_serial_number_required,
                    weight,
                    created_by,
                    created_at
                )
                VALUES (
                    part_type_id,
                    '01', -- version inlined
                    TRIM(part_name),
                    NULLIF(TRIM(part_description), ''),
                    unit_of_measure_id,
                    make_buy_value,
                    'Draft', -- status inlined
                    unit_price_value, -- NULL if empty
                    NULLIF(TRIM(manufacturing_part_number_value), ''),
                    NULLIF(TRIM(manufacturer_name_value), ''),
                    trl_value,
                    space_qualified_value,
                    NULLIF(TRIM(reference_number_value), ''),
                    NULLIF(TRIM(item_type_value), ''),
                    is_serial_number_required,
                    weight, -- 0 if empty
                    user_email,
                    NOW()
                )
                RETURNING part_number INTO generated_part_number;

                result := jsonb_build_object(
                    'row_number', index, 
                    'status', 'success', 
                    'generated_part_number', generated_part_number,
                    'part_name', TRIM(part_name)
                );
            EXCEPTION WHEN OTHERS THEN
                valid := FALSE;
                local_error_message := 'Failed to insert part: ' || SQLERRM;
            END;
        END IF;

        -- Record error if invalid
        IF NOT valid THEN
            result := jsonb_build_object(
                'row_number', index, 
                'status', 'error',
                'error_message', local_error_message,
                'part_name', TRIM(part_name)
            );
        END IF;

        results := results || jsonb_build_array(result);
    END LOOP;
END;
$$;

ALTER PROCEDURE mes.import_parts(jsonb[], text, jsonb) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.import_parts(jsonb[], text, jsonb) TO spacelinxuser;
