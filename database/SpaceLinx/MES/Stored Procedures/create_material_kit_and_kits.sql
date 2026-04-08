CREATE OR REPLACE PROCEDURE mes.create_material_kit_and_kits(
    name TEXT,
    part_id UUID,
    location_id UUID,
    image_id UUID,
    quantity INT,
    user_email TEXT,
    OUT new_material_kit_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    material_kit mes.material_kit;
    i INT;
    next_sequence_number INT;
BEGIN
    -- Insert the new Material Kit and get the ID and number
    INSERT INTO mes.material_kit (name, part_id, location_id, image_id, quantity, created_at, created_by)
    VALUES (name, part_id, location_id, image_id, quantity, NOW(), user_email)
    RETURNING id, number INTO new_material_kit_id, material_kit.number;

    -- Calculate the next sequence number for kits (starting from 1) 
    SELECT COALESCE(MAX(CAST(substring(number::TEXT, length(material_kit.number::TEXT) + 2) AS INTEGER)), 0) + 1
    INTO next_sequence_number
    FROM mes.kit
    WHERE mes.kit.material_kit_id = new_material_kit_id;

    -- Create Kits based on the quantity
    FOR i IN 1..quantity LOOP
        INSERT INTO mes.kit (name, number, part_id, location_id, material_kit_id, status, created_at, created_by)
        VALUES (name, material_kit.number || '-' || lpad(next_sequence_number::TEXT, 3, '0'), part_id,
            location_id, new_material_kit_id, 'Pending', NOW(), user_email);

        next_sequence_number := next_sequence_number + 1;
    END LOOP;
END;
$$;