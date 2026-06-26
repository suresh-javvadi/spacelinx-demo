-- ===== procedures/01_application_delete_user_role.sql =====
CREATE OR REPLACE PROCEDURE application.delete_user_role(IN target_user_id uuid, IN target_app_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Soft delete user roles for the specified application
    UPDATE application.user_role
    SET is_active = false,
        deleted_at = NOW(),
        deleted_by = user_email
    WHERE user_id = target_user_id
      AND role_id IN (
          SELECT id
          FROM application.role
          WHERE app_id = target_app_id
      )
      AND is_active = true;

    -- Check if the user still has any active roles across all applications
    IF NOT EXISTS (
        SELECT 1
        FROM application.user_role ur
        WHERE ur.user_id = target_user_id
          AND ur.is_active = true
    ) THEN
        -- Soft delete the user if no active roles remain
        UPDATE application.user
        SET is_active = false,
            deleted_at = NOW(),
            deleted_by = user_email
        WHERE id = target_user_id
          AND is_active = true;

        RAISE NOTICE 'User % soft-deleted as no active roles remain', target_user_id;
    ELSE
        RAISE NOTICE 'User % still has active roles in other applications and was not deleted', target_user_id;
    END IF;
END;
$$;


-- ===== procedures/02_application_get_user_roles.sql =====
CREATE OR REPLACE PROCEDURE application.get_user_roles(IN useremail character varying, IN appname character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if user exists and is active
    IF NOT EXISTS (
        SELECT 1
        FROM application.user u
        JOIN application.user_role ur ON u.id = ur.user_id
        JOIN application.role r ON ur.role_id = r.id
        JOIN application.app a ON r.app_id = a.id
        WHERE u.email = useremail
          AND a.app_name = appname
          AND u.is_active = TRUE
          AND a.is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'User not found or inactive';
    END IF;
 
    -- Display user roles using RAISE NOTICE for debugging/logging
    RAISE NOTICE 'User Roles: %', (
        SELECT json_agg(json_build_object(
            'user_id', u.id, 
            'first_name', u.first_name, 
            'last_name', u.last_name, 
            'email', u.email, 
            'role_id', ur.role_id, 
            'role_name', r.role_name
        ))
        FROM application.user u
        JOIN application.user_role ur ON u.id = ur.user_id
        JOIN application.role r ON ur.role_id = r.id
        JOIN application.app a ON r.app_id = a.id
        WHERE u.email = useremail
          AND a.app_name = appname
          AND u.is_active = TRUE
    );
 
END;
$$;


-- ===== procedures/03_application_set_default_role.sql =====
CREATE OR REPLACE PROCEDURE application.set_default_role(IN p_user_id uuid, IN p_role_id uuid, IN p_user_email text)
    LANGUAGE plpgsql
    AS $$
BEGIN
-- Sets the specified role as default (TRUE) and updates other roles to FALSE
  UPDATE application.user_role
  SET is_default = (role_id = p_role_id),
      updated_at = NOW(),
      updated_by = p_user_email
  WHERE user_id = p_user_id;
END;
$$;


-- ===== procedures/04_mes_release_eco.sql =====
CREATE OR REPLACE PROCEDURE mes.release_eco(IN eco_entity_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    eco_record RECORD;
    eco_part_record RECORD;
    part_record RECORD;
    previous_part RECORD;
BEGIN
    -- Fetch the ECO record
    SELECT * INTO eco_record
    FROM mes.eco
    WHERE id = eco_entity_id;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'ECO record not found';
    END IF;
 
    -- Process each ECO part
    FOR eco_part_record IN 
        SELECT * FROM mes.eco_part WHERE eco_id = eco_entity_id
    LOOP
        -- Fetch the corresponding part
        SELECT * INTO part_record
        FROM mes.part
        WHERE id = eco_part_record.part_id;
 
        -- If ECO part status is 'Obsolete', mark the part as Obsolete
        IF eco_part_record.status = 'Obsolete' THEN
            UPDATE mes.part
            SET status = 'Obsolete',
                eco_id = eco_entity_id,
                updated_at = NOW(), 
                updated_by = user_email 
            WHERE id = part_record.id;
 
        ELSE
            -- Get the previous version of the part
           SELECT * INTO previous_part
	        FROM mes.part
	        WHERE part_number_suffix = part_record.part_number_suffix
	           AND version = TO_CHAR(CAST(part_record.version AS INTEGER) - 1, 'FM00')
	        LIMIT 1;
 
            -- If a previous version exists, archive it
            IF FOUND THEN
                UPDATE mes.part
                SET status = 'Archived',
                    updated_at = NOW(),
                    updated_by = user_email
                WHERE id = previous_part.id;
            END IF;
 
            -- Set the current version to 'Release'
            UPDATE mes.part
            SET status = 'Release',
                eco_id = eco_entity_id,
                updated_at = NOW(),
                updated_by = user_email
            WHERE id = part_record.id;
 
        END IF;
    END LOOP;
 
    -- Set ECO status to Released
    UPDATE mes.eco
    SET status = 'Released',
        updated_at = NOW(),
        updated_by = user_email
    WHERE id = eco_entity_id;
 
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Internal server error: %', SQLERRM;
END;
$$;


-- ===== procedures/05_mes_approve_eco.sql =====
CREATE OR REPLACE PROCEDURE mes.approve_eco(IN eco_entity_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    approver RECORD;
    eco_record RECORD;
    all_approved BOOLEAN;
BEGIN
    -- Fetch the ECO record
    SELECT * INTO eco_record
    FROM mes.eco
    WHERE id = eco_entity_id AND deleted_by IS NULL;

    IF eco_record IS NULL THEN
        RAISE EXCEPTION 'ECO record not found';
    END IF;

    IF eco_record.status != 'Submitted' THEN
        RAISE EXCEPTION 'ECO must be in Submitted status to Approve';
    END IF;

    -- Update the approver's status
    SELECT * INTO approver
    FROM application.approvals
    WHERE entity_type = 'Eco'
      AND entity_id = eco_entity_id
      AND approver_id = (
          SELECT id FROM application.users WHERE LOWER(email) = LOWER(user_email)
      )
      AND deleted_by IS NULL;

    IF approver IS NULL THEN
        RAISE EXCEPTION 'Approver not found';
    END IF;

    UPDATE application.approvals
    SET status = 'Approved',
        comment = approver.comment,
        acted_at = NOW(),
        updated_by = user_email,
        updated_at = NOW()
    WHERE id = approver.id;

    -- Check if all approvals are approved
    SELECT COUNT(*) = 0 INTO all_approved
    FROM application.approvals
    WHERE entity_type = 'Eco'
      AND entity_id = eco_entity_id
      AND deleted_by IS NULL
      AND status != 'Approved';

    IF all_approved THEN
        BEGIN
            -- Start transaction
            UPDATE mes.eco
            SET status = 'Approved',
                approved_date = NOW(),
                approved_by = 'System',
                updated_at = NOW(),
                updated_by = user_email
            WHERE id = eco_entity_id;

            -- Call release procedure
            CALL mes.release_eco(eco_entity_id, user_email);

            -- Insert into eco_log
            INSERT INTO mes.eco_log (
                eco_id, action, action_by, action_at,
                is_active, created_by, created_at
            )
            VALUES (
                eco_entity_id, 'Approved', user_email, NOW(),
                TRUE, user_email, NOW()
            );
        EXCEPTION
            WHEN OTHERS THEN
                RAISE EXCEPTION 'Error during ECO approval process: %', SQLERRM;
        END;
    END IF;
END;
$$;


-- ===== procedures/06_mes_clone_ebom.sql =====
CREATE OR REPLACE PROCEDURE mes.clone_ebom(IN original_part_id uuid, IN new_part_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insert all levels of BOM from original part to new part
    WITH RECURSIVE bom_tree AS (
        SELECT part_id, child_part_id, quantity
		FROM mes.ebom
        WHERE part_id = original_part_id

        UNION ALL

        SELECT bt.child_part_id AS part_id, e.child_part_id, e.quantity
        FROM mes.ebom e
        INNER JOIN bom_tree bt ON e.part_id = bt.child_part_id
    )
    INSERT INTO mes.ebom (part_id, child_part_id, quantity, created_by, created_at)
    SELECT new_part_id, child_part_id, quantity, user_email, NOW()
    FROM bom_tree
    ON CONFLICT (part_id, child_part_id, deleted_at) DO NOTHING;
END;
$$;


-- ===== procedures/07_mes_clone_guide.sql =====
CREATE OR REPLACE PROCEDURE mes.clone_guide(IN original_guide_id uuid, IN new_part_id uuid, IN user_email text, OUT new_guide_id uuid, OUT new_guide_number text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    original_guide RECORD;
    new_part RECORD;
    original_step RECORD;
    new_step_id UUID;
    ebom_record RECORD;
    part_weight NUMERIC;
BEGIN
    -- Get the original guide details
    SELECT * INTO original_guide FROM mes.guide WHERE id = original_guide_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guide does not exist';
    END IF;
 
    -- Get the part details
    SELECT * INTO new_part FROM mes.part WHERE id = new_part_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Part does not exist';
    END IF;
 
    -- Insert the new guide
    INSERT INTO mes.guide (name, platform_id, part_id, guide_type_id, clone_from_id, calculated_weight, status, created_by, created_at)
    VALUES ('Copy of ' || original_guide.name, original_guide.platform_id, new_part.id, original_guide.guide_type_id,
        original_guide_id, original_guide.calculated_weight, 'Draft', user_email, NOW())
    RETURNING id INTO new_guide_id;
 
    SELECT number INTO new_guide_number FROM mes.guide WHERE id = new_guide_id;
 
    -- Copy steps
    FOR original_step IN SELECT * FROM mes.guide_step WHERE guide_id = original_guide_id
    LOOP
        INSERT INTO mes.guide_step (guide_id, image_id, video_id, sequence, title, is_active, created_by, created_at)
        VALUES (new_guide_id, original_step.image_id, original_step.video_id, original_step.sequence, original_step.title, original_step.is_active, user_email, NOW())
        RETURNING id INTO new_step_id;
 
        -- Copy tasks for each step
        INSERT INTO mes.guide_step_task (guide_step_id, guide_id, name, description, type, sequence, taskdetails, ismandatory, is_active, created_by, created_at)
        SELECT new_step_id, new_guide_id, name, description, type, sequence, taskdetails, ismandatory, TRUE, user_email, NOW()
        FROM mes.guide_step_task
        WHERE guide_step_id = original_step.id;
 
        -- Copy equipment for each step
        INSERT INTO mes.guide_step_equipment (guide_step_id, guide_id, equipment_type, part_id, tool_id, machine_id, quantity, is_active, created_by, created_at)
        SELECT new_step_id, new_guide_id, equipment_type, part_id, tool_id, machine_id, quantity, TRUE, user_email, NOW()
        FROM mes.guide_step_equipment
        WHERE guide_step_id = original_step.id;
    END LOOP;
 
    -- BOM cloning removed and handled in a separate procedure
    /*
    -- Copy EBOM from the original guide and insert into the new part's EBOM
    FOR guide_ebom_record IN
        SELECT * FROM mes.guide_ebom WHERE guide_id = original_guide_id
    LOOP
        -- Insert into mes.ebom with ON CONFLICT to avoid duplicates
        INSERT INTO mes.ebom (part_id, child_part_id, quantity, created_by, created_at)
        VALUES (new_part_id, guide_ebom_record.child_part_id, guide_ebom_record.quantity, user_email, NOW())
        ON CONFLICT (part_id, child_part_id) DO NOTHING;
    END LOOP;
    */
 
    -- Copy EBOM from the original guide and insert into the new guide's MBOM
    FOR ebom_record IN
        SELECT * FROM mes.ebom WHERE part_id = new_part_id
    LOOP
        -- Get the weight from the part table
        SELECT weight INTO part_weight FROM mes.part WHERE id = ebom_record.child_part_id;
 
        -- Insert into guide_mbom
        INSERT INTO mes.guide_mbom (guide_id, part_id, quantity, weight, created_at, created_by, is_active)
        VALUES (new_guide_id, ebom_record.child_part_id, ebom_record.quantity, part_weight, NOW(), user_email, TRUE);
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
$$;


-- ===== procedures/08_mes_consume_inventory_for_kit.sql =====
CREATE OR REPLACE PROCEDURE mes.consume_inventory_for_kit(IN kit_part_id uuid, IN multiplier integer, IN user_email text, IN work_order_id uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    component RECORD;
    total_quantity INTEGER;
    previous_qty_reserved INTEGER;
BEGIN
    FOR component IN
        SELECT e.child_part_id, e.quantity
        FROM mes.ebom e
        WHERE e.part_id = kit_part_id AND e.quantity > 0
    LOOP
        total_quantity := component.quantity * multiplier;
 
        SELECT qty_reserved
        INTO previous_qty_reserved
        FROM sc.inventory_part
        WHERE part_id = component.child_part_id;
 
        UPDATE sc.inventory_part
        SET qty_reserved = qty_reserved - total_quantity,
            qty_onhand = qty_onhand - total_quantity,
            consumed_quantity = consumed_quantity + total_quantity,
            updated_at = NOW(),
            updated_by = user_email
        WHERE part_id = component.child_part_id;
 
        INSERT INTO sc.inventory_transaction (
            part_id,
            transaction_type,
            previous_quantity,
            current_quantity,
            transacted_quantity,
            reference_type,
            reference_id,
            transaction_date,
            notes,
            created_by
        )
        VALUES (
            component.child_part_id,
            'Consumed',
            previous_qty_reserved,
            previous_qty_reserved - total_quantity,
            total_quantity,
            'WorkOrder',
            work_order_id,
            CURRENT_TIMESTAMP,
            'Kit consumed on work order completion',
            user_email
        );
    END LOOP;
END;
$$;


-- ===== procedures/09_mes_reorder_guide_steps.sql =====
CREATE OR REPLACE PROCEDURE mes.reorder_guide_steps(IN guide_step_id uuid, IN new_sequence integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    var_guide_id UUID;
    old_sequence INT;
BEGIN
    -- Get the current guide_id and sequence for the guide_step_id
    SELECT guide_id, sequence INTO var_guide_id, old_sequence
    FROM mes.guide_step
    WHERE id = guide_step_id;

    IF old_sequence < new_sequence THEN
        -- Decrease sequence numbers to create space if moving a step up
        UPDATE mes.guide_step
        SET sequence = sequence - 1
        WHERE guide_id = var_guide_id AND sequence > old_sequence AND sequence <= new_sequence;

        -- Move the old step to the new sequence position
        UPDATE mes.guide_step
        SET sequence = new_sequence
        WHERE id = guide_step_id;

    ELSIF old_sequence > new_sequence THEN
        -- Increase sequence numbers to create space if moving a step down
        UPDATE mes.guide_step
        SET sequence = sequence + 1
        WHERE guide_id = var_guide_id AND sequence < old_sequence AND sequence >= new_sequence;

        -- Move the old step to the new sequence position
        UPDATE mes.guide_step
        SET sequence = new_sequence
        WHERE id = guide_step_id;
    END IF;
END;
$$;


-- ===== procedures/10_mes_copy_guide_step.sql =====
CREATE OR REPLACE PROCEDURE mes.copy_guide_step(IN original_step_id uuid, IN user_email text, OUT new_step_id uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    original_step RECORD;
    new_sequence INTEGER;
BEGIN
    -- Get the original step details
    SELECT * INTO original_step FROM mes.guide_step WHERE id = original_step_id;
 
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Step does not exist';
    END IF;
 
    -- Calculate the new sequence
    new_sequence := original_step.sequence + 1;
 
    -- Insert the new step
    INSERT INTO mes.guide_step (guide_id, image_id, video_id, sequence, title, is_active, created_by, created_at)
    VALUES (original_step.guide_id, original_step.image_id, original_step.video_id, 100000, 'Copy of ' || original_step.title, TRUE, user_email, NOW())
    RETURNING id INTO new_step_id;
 
    -- Copy tasks
    INSERT INTO mes.guide_step_task (guide_step_id, guide_id, name, description, type, taskdetails, sequence, ismandatory, is_active, created_by, created_at)
    SELECT new_step_id, original_step.guide_id, name, description, type, taskdetails, sequence, ismandatory, TRUE, user_email, NOW()
    FROM mes.guide_step_task
    WHERE guide_step_id = original_step_id;
 
    -- Copy equipment
    INSERT INTO mes.guide_step_equipment (quantity, guide_step_id, guide_id, equipment_type, part_id, tool_id, machine_id, is_active, created_by, created_at)
    SELECT quantity, new_step_id, original_step.guide_id, equipment_type, part_id, tool_id, machine_id, TRUE, user_email, NOW()
    FROM mes.guide_step_equipment
    WHERE guide_step_id = original_step_id;
 
    -- Reorder the steps
    CALL mes.reorder_guide_steps(new_step_id, new_sequence);
 
    -- Update the guide status to 'Draft'
    UPDATE mes.guide
    SET status = 'Draft'
    WHERE id = original_step.guide_id;
 
END;
$$;


-- ===== procedures/11_mes_create_draft_guide.sql =====
CREATE OR REPLACE PROCEDURE mes.create_draft_guide(IN original_guide_id uuid, IN user_email text, OUT new_guide_id uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    original_guide RECORD;
    original_step RECORD;
    new_step_id UUID;
    new_version_number INT;
    existing_draft_count INT;
    ebom_record RECORD;
    part_weight NUMERIC;
BEGIN
    -- Get the original guide details
    SELECT * INTO original_guide FROM mes.guide WHERE id = original_guide_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guide does not exist';
    END IF;

    -- Check for existing draft versions
    SELECT COUNT(*)
    INTO existing_draft_count
    FROM mes.guide
    WHERE number = original_guide.number
      AND status = 'Draft';

    IF existing_draft_count > 0 THEN
        RAISE EXCEPTION 'A draft version for this guide already exists.';
    END IF;

    -- Determine the new version number
    SELECT COALESCE(MAX(version), 0) + 1 
    INTO new_version_number
    FROM mes.guide 
    WHERE number = original_guide.number; 

    -- Insert the new guide
    INSERT INTO mes.guide (name, platform_id, part_id, number, version, guide_type_id, clone_from_id, status, created_by, created_at)
    VALUES (original_guide.name, original_guide.platform_id, original_guide.part_id, original_guide.number, new_version_number, original_guide.guide_type_id,
           original_guide_id, 'Draft', user_email, NOW())
    RETURNING id INTO new_guide_id;

    -- Copy steps
    FOR original_step IN SELECT * FROM mes.guide_step WHERE guide_id = original_guide_id
    LOOP
        INSERT INTO mes.guide_step (guide_id, image_id, video_id, sequence, title, is_active, created_by, created_at)
        VALUES (new_guide_id, original_step.image_id, original_step.video_id, original_step.sequence, original_step.title, original_step.is_active, user_email, original_step.created_at)
        RETURNING id INTO new_step_id;

        -- Copy tasks for each step
        INSERT INTO mes.guide_step_task (guide_step_id, guide_id, name, description, type, taskdetails, sequence, ismandatory, is_active, created_by, created_at)
        SELECT new_step_id, new_guide_id, name, description, type, taskdetails, sequence, ismandatory, is_active, user_email, created_at
        FROM mes.guide_step_task
        WHERE guide_step_id = original_step.id;

        -- Copy equipment for each step
        INSERT INTO mes.guide_step_equipment (guide_step_id, guide_id, equipment_type, part_id, tool_id, machine_id, quantity, is_active, created_by, created_at)
        SELECT new_step_id, new_guide_id, equipment_type, part_id, tool_id, machine_id, quantity, is_active, user_email, created_at
        FROM mes.guide_step_equipment
        WHERE guide_step_id = original_step.id;
    END LOOP;

    -- Generate guide MBOM
    FOR ebom_record IN
        SELECT * FROM mes.ebom WHERE part_id = (SELECT part_id FROM mes.guide WHERE id = new_guide_id)
    LOOP
        -- Get the weight from the part table
        SELECT weight INTO part_weight FROM mes.part WHERE id = ebom_record.child_part_id;

        -- Insert into guide_mbom
        INSERT INTO mes.guide_mbom (guide_id, part_id, quantity, weight, created_at, created_by, is_active)
        VALUES (new_guide_id, ebom_record.child_part_id, 0, part_weight, NOW(), user_email, TRUE);
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
$$;


-- ===== procedures/12_mes_create_guide_ebom.sql =====
CREATE OR REPLACE PROCEDURE mes.create_guide_ebom(IN guide_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    guide RECORD;
BEGIN
    -- Fetch the published guide by ID
    SELECT id, part_id INTO guide
    FROM mes.guide
    WHERE id = guide_id AND status = 'Published';

    -- If the guide exists and is published
    IF guide.id IS NOT NULL THEN
        -- Insert related ebom records directly into guide_ebom table
        INSERT INTO mes.guide_ebom (guide_id, part_id, child_part_id, quantity, is_active, created_at, created_by)
        SELECT guide.id, record.part_id, record.child_part_id, record.quantity, TRUE, NOW(), user_email
        FROM mes.ebom record
        WHERE record.part_id = guide.part_id;
    ELSE
        RAISE EXCEPTION 'Guide with ID % is either not published or does not exist.', guide_id;
    END IF;
END;
$$;


-- ===== procedures/13_mes_create_guide_mbom.sql =====
CREATE OR REPLACE PROCEDURE mes.create_guide_mbom(IN guide_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    record RECORD;
    guide RECORD;
    part_weight NUMERIC;
BEGIN
    -- Fetch the guide
    PERFORM * FROM mes.guide WHERE id = guide_id;

    -- Fetch the related ebom records
    FOR record IN
        SELECT * FROM mes.ebom WHERE part_id = (SELECT part_id FROM mes.guide WHERE id = guide_id)
    LOOP
        -- Get the weight from the part table
        SELECT weight INTO part_weight FROM mes.part WHERE id = record.child_part_id;

        -- Insert into guide_mbom
        INSERT INTO mes.guide_mbom (guide_id, part_id, quantity, weight, created_at, created_by, is_active)
        VALUES (guide_id, record.child_part_id, 0, part_weight, NOW(), user_email, TRUE);
    END LOOP;
END;
$$;


-- ===== procedures/14_mes_create_material_kit_and_kits.sql =====
CREATE OR REPLACE PROCEDURE mes.create_material_kit_and_kits(IN name text, IN part_id uuid, IN location_id uuid, IN image_id uuid, IN quantity integer, IN user_email text, OUT new_material_kit_id uuid)
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


-- ===== procedures/15_mes_create_work_package_and_work_orders.sql =====
CREATE OR REPLACE PROCEDURE mes.create_work_package_and_work_orders(IN p_name text, IN p_part_id uuid, IN p_guide_id uuid, IN p_product_id uuid, IN p_technician_id uuid, IN p_manager_id uuid, IN p_start_date timestamp with time zone, IN p_end_date timestamp with time zone, IN p_quantity integer, IN p_user_email text, OUT new_work_package_id uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_work_package_number TEXT;
    new_work_order_id UUID;
    new_work_order_step_id UUID;
    current_guide_step_id UUID;
    current_image_id UUID;
    next_sequence_number INT := 1;
    index INT;
BEGIN
    -- Create Work Package
    INSERT INTO mes.work_package (
        name, part_id, guide_id, product_id, 
        technician_id, manager_id, start_date, 
        end_date, quantity, created_at, created_by
    )
    VALUES (
        p_name, p_part_id, p_guide_id, p_product_id,
        p_technician_id, p_manager_id, p_start_date,
        p_end_date, p_quantity, NOW(), p_user_email
    )
    RETURNING id, number INTO new_work_package_id, new_work_package_number;

    -- Create Work Orders
    FOR index IN 1..p_quantity LOOP
        -- Create Work Order
        INSERT INTO mes.work_order (
            name, number, part_id, guide_id, product_id,
            technician_id, manager_id, start_date, end_date,
            work_package_id, status, created_at, created_by
        )
        VALUES (
            p_name || '-' || LPAD(next_sequence_number::TEXT, 3, '0'),
            new_work_package_number || '-' || LPAD(next_sequence_number::TEXT, 3, '0'),
            p_part_id, p_guide_id, p_product_id,
            p_technician_id, p_manager_id, p_start_date, p_end_date,
            new_work_package_id, 'Pending', NOW(), p_user_email
        )
        RETURNING id INTO new_work_order_id;

        -- Only create steps and tasks if guide_id is provided
        IF p_guide_id IS NOT NULL THEN
            FOR current_guide_step_id, current_image_id IN
                SELECT id, image_id 
                FROM mes.guide_step
                WHERE guide_id = p_guide_id
                ORDER BY sequence
            LOOP
                -- Create Work Order Step
                INSERT INTO mes.work_order_step (
                    work_order_id, guide_step_id,
                    technician_id, manager_id, image_id, created_at, created_by 
                )
                VALUES (
                    new_work_order_id, current_guide_step_id,
                    p_technician_id, p_manager_id, current_image_id, NOW(), p_user_email
                )
                RETURNING id INTO new_work_order_step_id;

                -- Create Work Order Tasks
                INSERT INTO mes.work_order_task (
                    work_order_id, work_order_step_id,
                    guide_step_task_id, status, created_at, created_by
                )
                SELECT 
                    new_work_order_id, 
                    new_work_order_step_id,
                    id, 
                    'Pending', 
                    NOW(), 
                    p_user_email
                FROM mes.guide_step_task
                WHERE guide_step_id = current_guide_step_id;
            END LOOP;
        END IF;

        next_sequence_number := next_sequence_number + 1;
    END LOOP;
END;
$$;


-- ===== procedures/16_mes_discard_eco.sql =====
CREATE OR REPLACE PROCEDURE mes.discard_eco(IN eco_entity_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    eco_part_record RECORD;
    remaining_eco_parts INT;
    remaining_parts INT;
BEGIN
    -- Loop through each ECO part associated with the provided ECO ID
    FOR eco_part_record IN 
        SELECT * FROM mes.eco_part WHERE eco_id = eco_entity_id
    LOOP
	   -- Delete the ECO part entry first
         -- DELETE FROM mes.eco_part WHERE eco_id = eco_entity_id AND part_id = eco_part_record.part_id;
       -- Check if the part status is 'Draft'
       -- IF (SELECT status FROM mes.part WHERE id = eco_part_record.part_id) = 'Draft' THEN
            -- Delete related EBOM records
            -- DELETE FROM mes.ebom WHERE part_id = eco_part_record.part_id;
            -- Delete the part itself
            -- DELETE FROM mes.part WHERE id = eco_part_record.part_id;     			
       -- END IF;
	   UPDATE mes.part
        SET eco_id = NULL
        WHERE id = eco_part_record.part_id;
    END LOOP;
        UPDATE mes.eco
        SET status = 'Discarded',
            updated_at = COALESCE(updated_at, NOW()),
            updated_by = user_email
        WHERE id = eco_entity_id;
	   	UPDATE application.approval
	    SET deleted_at = NOW(),
	        deleted_by = 'System'
	    WHERE entity_id = eco_entity_id AND deleted_by IS NULL;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in discard_eco: %', SQLERRM;
END;
$$;


-- ===== procedures/17_mes_generate_part_number.sql =====
CREATE OR REPLACE FUNCTION mes.generate_part_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    part_number_prefix_local TEXT;
    last_suffix TEXT;
    next_sequence INT;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.part_number_suffix IS NULL)
       OR (TG_OP = 'UPDATE' AND NEW.part_type_id IS DISTINCT FROM OLD.part_type_id) THEN
 
        -- Get the prefix from PartType
    SELECT part_number_prefix INTO part_number_prefix_local FROM mes.part_type WHERE id = NEW.part_type_id;
 
        IF part_number_prefix_local IS NULL THEN
            RAISE EXCEPTION 'No part_number_prefix found for part_type_id: %', NEW.part_type_id;
        END IF;
 
        -- Lock to prevent race conditions
        LOCK TABLE mes.part IN SHARE ROW EXCLUSIVE MODE;
 
        -- Get last used suffix globally for that prefix
        SELECT part_number_suffix
        INTO last_suffix
        FROM mes.part
        WHERE part_number_suffix LIKE part_number_prefix_local || '-%'
        ORDER BY (regexp_match(part_number_suffix, '-(\d+)$'))[1]::INT DESC
        LIMIT 1;
 
        -- Generate next sequence
        IF last_suffix IS NOT NULL THEN
            next_sequence := COALESCE((substring(last_suffix FROM '-(\d+)$'))::INT, 0) + 1;
        ELSE
            next_sequence := 1;
        END IF;
 
        -- Assign the new suffix
        NEW.part_number_suffix := part_number_prefix_local || '-' || LPAD(next_sequence::TEXT, 5, '0');
    END IF;
 
    RETURN NEW;
END;
$_$;


-- ===== procedures/18_mes_get_part_sequence.sql =====
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


-- ===== procedures/19_mes_guide_mbom_refresh.sql =====
CREATE OR REPLACE PROCEDURE mes.guide_mbom_refresh()
    LANGUAGE plpgsql
    AS $$
BEGIN
    WITH new_data AS (
        -- 1. First, prepare all the new values
        SELECT
            gm.guide_id,
            gm.part_id,
            p.weight AS part_weight,
            -- Use a LEFT JOIN to the aggregated data to ensure we keep all rows from guide_mbom
            COALESCE(gse_agg.total_quantity, 0) AS new_quantity
        FROM
            mes.guide_mbom gm
        INNER JOIN
            mes.part p ON gm.part_id = p.id
        LEFT JOIN (
            SELECT
                gse.guide_id,
                gse.part_id,
                SUM(gse.quantity) AS total_quantity
            FROM
                mes.guide_step_equipment gse
            GROUP BY
                gse.guide_id,
                gse.part_id
        ) AS gse_agg ON gm.guide_id = gse_agg.guide_id AND gm.part_id = gse_agg.part_id
    )
    -- 2. Then, update the target table from the prepared data
    UPDATE mes.guide_mbom gm
    SET
        quantity = nd.new_quantity,
        weight = nd.new_quantity * nd.part_weight -- Calculate weight using the new quantity
    FROM
        new_data nd
    WHERE
        -- Connect the target table (gm) to the source data (nd) here
        gm.guide_id = nd.guide_id
        AND gm.part_id = nd.part_id;
END;
$$;


-- ===== procedures/20_mes_import_ebom.sql =====
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


-- ===== procedures/21_mes_import_locations.sql =====
CREATE OR REPLACE PROCEDURE mes.import_locations(IN records jsonb[], IN user_email text, OUT results jsonb)
    LANGUAGE plpgsql
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


-- ===== procedures/22_mes_import_machines.sql =====
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


-- ===== procedures/23_mes_import_news.sql =====
CREATE OR REPLACE PROCEDURE mes.import_news(IN records jsonb[], IN user_email text, OUT results jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
    news_item jsonb;
    news_name TEXT;
    news_type_name TEXT;
    news_type_id UUID;
    news_hyperlink TEXT;
    news_origin TEXT;
	news_url TEXT;
    valid BOOLEAN;
    local_error_message TEXT;
    result jsonb;
    index INT;
BEGIN
    -- Initialize the results as an empty JSON array
    results := '[]'::jsonb;

    -- Loop through the array of news items
    FOR index IN 1 .. array_length(records, 1) LOOP
        news_item := records[index];
        valid := TRUE;
        local_error_message := NULL;

        news_name := news_item->>'Name';
        news_type_name := news_item->>'Type';
        news_hyperlink := news_item->>'Hyperlink';
        news_origin := news_item->>'Origin';
		news_url := COALESCE(news_item->>'Image URL', '');

        -- Validate news_name and news_hyperlink (both are required)
        IF news_name IS NULL OR news_name = '' THEN
            local_error_message := 'News name is required';
            valid := FALSE;
        END IF;

        IF news_hyperlink IS NULL OR news_hyperlink = '' THEN
            local_error_message := 'Hyperlink is required';
            valid := FALSE;
        END IF;

        -- Validate and/or create news_type (based on news_type_name)
        IF news_type_name IS NULL OR news_type_name = '' THEN
            local_error_message := 'News type is required';
            valid := FALSE;
        ELSE
            -- Try to find the news type by name
            SELECT id INTO news_type_id FROM mes.news_type WHERE name = news_type_name;

            -- If the news type doesn't exist, create a new one
            IF news_type_id IS NULL THEN
                INSERT INTO mes.news_type (name, created_by, created_at)
                VALUES (news_type_name, user_email, NOW()) RETURNING id INTO news_type_id;
            END IF;
        END IF;

        -- If everything is valid, insert the news into the table
        IF valid THEN
            INSERT INTO mes.news (title, news_type_id, hyperlink, origin, image, created_by, created_at)
            VALUES (news_name, news_type_id, news_hyperlink, news_origin, news_url, user_email, NOW());
			
            -- Record validation failure in the results
            result := jsonb_build_object('row_number', index, 'error_message', local_error_message);
        END IF;

        -- Append the result to the results array
        results := results || jsonb_build_array(result);
    END LOOP;
END;
$$;


-- ===== procedures/24_mes_import_parts.sql =====
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


-- ===== procedures/25_mes_import_tools.sql =====
CREATE OR REPLACE PROCEDURE mes.import_tools(IN tools jsonb[], IN user_email text, OUT results jsonb)
    LANGUAGE plpgsql
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


-- ===== procedures/26_mes_is_eco_valid_for_submit.sql =====
CREATE OR REPLACE PROCEDURE mes.is_eco_valid_for_submit(IN p_ecoid uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_errors TEXT := '';
    v_part_docs_missing TEXT;
    v_child_docs_missing TEXT;
    v_unreleased_bom TEXT;
    v_archived_bom TEXT;
    v_obsolete_bom TEXT;
    v_eco_docs_count INT;
BEGIN
    -- 4) Check ECO has at least one document
    SELECT COUNT(*) 
      INTO v_eco_docs_count
      FROM common.document d
     WHERE d.entity_id = p_ecoid
       AND d.deleted_at IS NULL;
    IF v_eco_docs_count = 0 THEN
        v_errors := v_errors || 'ECO has no documents. | ';
    END IF;

    -- 1) Effected parts should have documents
    SELECT string_agg('PartID:'|| ep.part_id::text, '; ')
      INTO v_part_docs_missing
      FROM mes.eco_part ep
      JOIN mes.part p ON p.id = ep.part_id
      LEFT JOIN common.document d ON d.entity_id = ep.part_id AND d.deleted_at IS NULL
     WHERE ep.eco_id = p_ecoid
       AND ep.is_active = true
       AND ep.deleted_at IS NULL
       AND p.is_active = true
       AND p.deleted_at IS NULL
       AND d.id IS NULL;
    IF v_part_docs_missing IS NOT NULL THEN
        v_errors := v_errors || 'Effected parts missing docs: '||v_part_docs_missing||' | ';
    END IF;

    -- 2) If effected parts have child parts, they should all have documents
    SELECT string_agg('ChildPartID:'|| c.id::text, '; ')
      INTO v_child_docs_missing
      FROM mes.eco_part ep
      JOIN mes.ebom b ON b.part_id = ep.part_id
                     AND b.is_active = true       
                     AND b.deleted_at IS NULL      
      JOIN mes.part c ON c.id = b.child_part_id
      LEFT JOIN common.document d ON d.entity_id = c.id AND d.deleted_at IS NULL
     WHERE ep.eco_id = p_ecoid
       AND ep.is_active = true
       AND ep.deleted_at IS NULL
       AND c.is_active = true
       AND c.deleted_at IS NULL
       AND d.id IS NULL;
    IF v_child_docs_missing IS NOT NULL THEN
        v_errors := v_errors || 'Child parts missing docs: '||v_child_docs_missing||' | ';
    END IF;

    -- 3) Effected BOM parts status should be 'Release'; if not, they must be included in effected parts
    SELECT string_agg('PartID:'|| b.child_part_id::text||',Status:'||c.status, '; ')
      INTO v_unreleased_bom
      FROM mes.eco_part ep
      JOIN mes.ebom b ON b.part_id = ep.part_id
                     AND b.is_active = true       
                     AND b.deleted_at IS NULL   
      JOIN mes.part c ON c.id = b.child_part_id
     WHERE ep.eco_id = p_ecoid
       AND ep.is_active = true
       AND ep.deleted_at IS NULL
       AND c.status NOT IN ('Release', 'Archived', 'Obsolete')
       AND c.is_active = true
       AND c.deleted_at IS NULL
       AND NOT EXISTS (
           SELECT 1 
             FROM mes.eco_part ep2
            WHERE ep2.eco_id = p_ecoid
              AND ep2.part_id = c.id
              AND ep2.is_active = true
              AND ep2.deleted_at IS NULL
       );
    IF v_unreleased_bom IS NOT NULL THEN
        v_errors := v_errors || 'Unreleased BOM parts not in ECO: '||v_unreleased_bom||' | ';
    END IF;

    -- 5) BOM child parts must not be in Archived status
    SELECT string_agg('EbomID:'|| b.id::text ||',PartID:'|| b.child_part_id::text, '; ')
      INTO v_archived_bom
      FROM mes.eco_part ep
      JOIN mes.ebom b ON b.part_id = ep.part_id
                     AND b.is_active = true
                     AND b.deleted_at IS NULL
      JOIN mes.part c ON c.id = b.child_part_id
     WHERE ep.eco_id = p_ecoid
       AND ep.is_active = true
       AND ep.deleted_at IS NULL
       AND c.status = 'Archived'
       AND c.is_active = true
       AND c.deleted_at IS NULL;
    IF v_archived_bom IS NOT NULL THEN
        v_errors := v_errors || 'Archived BOM parts in ECO: '||v_archived_bom||' | ';
    END IF;

    -- 6) BOM child parts must not be in Obsolete status
    SELECT string_agg('EbomID:'|| b.id::text ||',PartID:'|| b.child_part_id::text, '; ')
      INTO v_obsolete_bom
      FROM mes.eco_part ep
      JOIN mes.ebom b ON b.part_id = ep.part_id
                     AND b.is_active = true
                     AND b.deleted_at IS NULL
      JOIN mes.part c ON c.id = b.child_part_id
     WHERE ep.eco_id = p_ecoid
       AND ep.is_active = true
       AND ep.deleted_at IS NULL
       AND c.status = 'Obsolete'
       AND c.is_active = true
       AND c.deleted_at IS NULL;
    IF v_obsolete_bom IS NOT NULL THEN
        v_errors := v_errors || 'Obsolete BOM parts in ECO: '||v_obsolete_bom||' | ';
    END IF;

    -- Raise exception if any rule failed
    IF v_errors <> '' THEN
        RAISE EXCEPTION '%', v_errors;
    ELSE
        RAISE NOTICE 'ECO % is valid for submission.', p_ecoid;
    END IF;
END;
$$;


-- ===== procedures/27_mes_reorder_guide_step_tasks.sql =====
CREATE OR REPLACE PROCEDURE mes.reorder_guide_step_tasks(IN guide_step_task_id uuid, IN new_sequence integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    var_guide_step_id UUID;
    old_sequence INT;
BEGIN
    -- Get the current guide_step_id and sequence for the guide_step_task_id
    SELECT guide_step_id, sequence INTO var_guide_step_id, old_sequence
    FROM mes.guide_step_task
    WHERE id = guide_step_task_id;

    IF old_sequence < new_sequence THEN
        -- Decrease sequence numbers to create space if moving a task up
        UPDATE mes.guide_step_task
        SET sequence = sequence - 1
        WHERE guide_step_id = var_guide_step_id AND sequence > old_sequence AND sequence <= new_sequence;

        -- Move the old task to the new sequence position
        UPDATE mes.guide_step_task
        SET sequence = new_sequence
        WHERE id = guide_step_task_id;

    ELSIF old_sequence > new_sequence THEN
        -- Increase sequence numbers to create space if moving a task down
        UPDATE mes.guide_step_task
        SET sequence = sequence + 1
        WHERE guide_step_id = var_guide_step_id AND sequence < old_sequence AND sequence >= new_sequence;

        -- Move the old task to the new sequence position
        UPDATE mes.guide_step_task
        SET sequence = new_sequence
        WHERE id = guide_step_task_id;
    END IF;
END;
$$;


-- ===== procedures/28_mes_reorder_guide_steps_after_deletion.sql =====
CREATE OR REPLACE PROCEDURE mes.reorder_guide_steps_after_deletion(IN guide_id_var uuid, IN deleted_sequence integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Decrease sequence numbers for all steps that come after the deleted step
    UPDATE mes.guide_step
    SET sequence = sequence - 1
    WHERE guide_id = guide_id_var AND sequence > deleted_sequence;
END;
$$;


-- ===== procedures/29_mes_reserve_inventory_for_kit.sql =====
CREATE OR REPLACE PROCEDURE mes.reserve_inventory_for_kit(IN kit_part_id uuid, IN multiplier integer, IN user_email text, IN work_order_id uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    component RECORD;
    total_quantity INTEGER;
    previous_qty_reserved INTEGER;

BEGIN
    FOR component IN
        SELECT e.child_part_id, e.quantity
        FROM mes.ebom e
        WHERE e.part_id = kit_part_id AND e.quantity > 0
    LOOP
        total_quantity := component.quantity * multiplier;

        SELECT qty_reserved
        INTO previous_qty_reserved
        FROM sc.inventory_part
        WHERE part_id = component.child_part_id;
 
        UPDATE sc.inventory_part
        SET qty_reserved = qty_reserved + total_quantity,
            updated_at = NOW(),
            updated_by = user_email
        WHERE part_id = component.child_part_id;

		INSERT INTO sc.inventory_transaction (
            part_id,
            from_location_id,
            transaction_type,
            previous_quantity,
            current_quantity,
            transacted_quantity,
            reference_type,
            reference_id,
            transaction_date,
            notes,
            created_by
        )
        VALUES (
            component.child_part_id,
            NULL,
            'Reserved',
            previous_qty_reserved,
            previous_qty_reserved + total_quantity,
            total_quantity,
            'WorkOrder',
            work_order_id,
            CURRENT_TIMESTAMP,
            'Reserved for kit assignment',
            user_email
        );
    END LOOP;
END;
$$;


-- ===== procedures/30_mes_reset_work_order.sql =====
CREATE OR REPLACE PROCEDURE mes.reset_work_order(IN workorder_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$DECLARE
    guide_step RECORD;
    guide_task RECORD;
    work_order_step_id UUID;
BEGIN
    -- Check if the work order exists
    IF NOT EXISTS (SELECT 1 FROM mes.work_order wo WHERE wo.id = workorder_id) THEN
        RAISE EXCEPTION 'Work order not found';
    END IF;

    -- Delete tasks
    DELETE FROM mes.work_order_task wot 
    WHERE wot.work_order_id = workorder_id;

    -- Delete steps
    DELETE FROM mes.work_order_step wos 
    WHERE wos.work_order_id = workorder_id;
 
    -- Update execution time to 0 and set status to 'Pending'
    UPDATE mes.work_order
    SET execution_time = INTERVAL '0',
        status = 'Pending'
    WHERE id = workorder_id;
 
    -- Insert new steps from guide steps
    FOR guide_step IN
        SELECT gs.id, gs.image_id
        FROM mes.guide_step gs
        WHERE gs.guide_id = (SELECT wo.guide_id FROM mes.work_order wo WHERE wo.id = workorder_id)
    LOOP
        -- Insert into work_order_step and return the ID
        INSERT INTO mes.work_order_step (work_order_id, guide_step_id, captured_time, execution_time, image_id, manager_id, technician_id, is_active, created_by, created_at, comment)
        VALUES (workorder_id, guide_step.id, INTERVAL '0', INTERVAL '0', guide_step.image_id, NULL, NULL, TRUE, user_email, NOW(), NULL)
        RETURNING id INTO work_order_step_id;

        -- Insert tasks for each guide step
        FOR guide_task IN
            SELECT id
            FROM mes.guide_step_task
            WHERE guide_step_id = guide_step.id
        LOOP
            INSERT INTO mes.work_order_task (work_order_id, guide_step_task_id, work_order_step_id, status, created_at, created_by)
            VALUES (workorder_id, guide_task.id, work_order_step_id, 'Pending', NOW(), user_email);
        END LOOP;
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        -- Rollback transaction
        RAISE;
END;$$;


-- ===== procedures/31_mes_reset_work_order_step.sql =====
CREATE OR REPLACE PROCEDURE mes.reset_work_order_step(IN workorderstepid uuid, IN p_user_email text)
    LANGUAGE plpgsql
    AS $$DECLARE
    workorder_id UUID;
    guidestep_id UUID;
    total_execution_time INTERVAL := INTERVAL '0';
    guide_task RECORD;
BEGIN
    -- Check if the work order step exists
    IF NOT EXISTS (SELECT 1 FROM mes.work_order_step wo WHERE wo.id = workorderstepid) THEN
        RAISE EXCEPTION 'Work order step not found';
    END IF;
    -- Retrieve workorder_id and guide_step_id from the work order step
    SELECT wos.work_order_id, wos.guide_step_id
    INTO workorder_id, guidestep_id
    FROM mes.work_order_step wos
    WHERE wos.id = workorderstepid;
 
    -- Delete tasks associated with the work order step
    DELETE FROM mes.work_order_task wot
    WHERE wot.work_order_id = workorder_id
    AND wot.guide_step_task_id IN (
        SELECT gst.id FROM mes.guide_step_task gst
        WHERE gst.guide_step_id = guidestep_id
    );
 
    -- Set the captured time of the work order step to 0
    UPDATE mes.work_order_step wos
    SET captured_time = INTERVAL '0',
        status = 'Pending'
    WHERE wos.id = workorderstepid;
 
    -- Recalculate the total execution time for all steps in the work order
    SELECT SUM(wos.captured_time)
    INTO total_execution_time
    FROM mes.work_order_step wos
    WHERE wos.work_order_id = workorder_id;
 
    -- Update the work order with the new total execution time
    UPDATE mes.work_order wo
    SET execution_time = total_execution_time,
        status = 'Pending'
    WHERE wo.id = workorder_id;
 
    -- Create tasks for the guide step
    FOR guide_task IN
        SELECT id
        FROM mes.guide_step_task
        WHERE guide_step_id = guidestep_id
    LOOP
        -- Insert WorkOrderTask for each GuideTask
        INSERT INTO mes.work_order_task (work_order_id, guide_step_task_id, work_order_step_id, status, created_at, created_by)
        VALUES (workorder_id, guide_task.id, workorderstepid, 'Pending', NOW(), p_user_email);
    END LOOP;
 
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback transaction and re-raise the exception
        RAISE;
END;$$;


-- ===== procedures/32_mes_revert_inventory_for_kit.sql =====
CREATE OR REPLACE PROCEDURE mes.revert_inventory_for_kit(IN kit_part_id uuid, IN multiplier integer, IN user_email text, IN work_order_id uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    component RECORD;
    total_quantity INTEGER;
    previous_qty_reserved INTEGER;
BEGIN
    FOR component IN
        SELECT e.child_part_id, e.quantity
        FROM mes.ebom e
        WHERE e.part_id = kit_part_id AND e.quantity > 0
    LOOP
        total_quantity := component.quantity * multiplier;
        SELECT qty_reserved
        INTO previous_qty_reserved
        FROM sc.inventory_part
        WHERE part_id = component.child_part_id;
 
        UPDATE sc.inventory_part
        SET qty_reserved = qty_reserved - total_quantity,
            updated_at = NOW(),
            updated_by = user_email
        WHERE part_id = component.child_part_id;

        INSERT INTO sc.inventory_transaction (
            part_id,
            to_location_id,
            transaction_type,
            previous_quantity,
            current_quantity,
            transacted_quantity,
            reference_type,
            reference_id,
            transaction_date,
            notes,
            created_by
        )
        VALUES (
            component.child_part_id,
            NULL,
            'Returned',
            previous_qty_reserved,
            previous_qty_reserved - total_quantity,
            total_quantity,
            'WorkOrder',
            work_order_id,
            CURRENT_TIMESTAMP,
            'Kit unassigned, inventory returned',
            user_email
        );
    END LOOP;
END;
$$;


-- ===== procedures/33_mes_update_has_bom_flag.sql =====
CREATE OR REPLACE FUNCTION mes.update_has_bom_flag() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    ebom_count INT;
    current_has_bom BOOLEAN;
BEGIN
    -- Get the current flag
    SELECT has_bom INTO current_has_bom
    FROM mes.part
    WHERE id = COALESCE(NEW.part_id, OLD.part_id);
 
    -- Get number of active child parts
    SELECT COUNT(*) INTO ebom_count
    FROM mes.ebom
    WHERE part_id = COALESCE(NEW.part_id, OLD.part_id)
      AND deleted_by IS NULL;
 
    --CASE 1: If has_bom = false and ebomCount > 0 → set to true
    IF (NOT current_has_bom AND ebom_count > 0) THEN
        UPDATE mes.part
        SET has_bom = TRUE
        WHERE id = COALESCE(NEW.part_id, OLD.part_id);
 
    --CASE 2: If has_bom = true and ebomCount = 0 → set to false
    ELSIF (current_has_bom AND ebom_count = 0) THEN
        UPDATE mes.part
        SET has_bom = FALSE
        WHERE id = COALESCE(NEW.part_id, OLD.part_id);
    END IF;
 
    RETURN NULL;
END;
$$;


-- ===== procedures/34_mes_update_status_to_approved.sql =====
CREATE OR REPLACE FUNCTION mes.update_status_to_approved(eco_entity_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    eco_record RECORD;
    eco_part RECORD;
    latest_part RECORD;
    part RECORD;
BEGIN
    -- Fetch the ECO record
    SELECT * INTO eco_record
    FROM ecos
    WHERE id = eco_entity_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ECO record not found';
    END IF;

    -- Update ECO status to Approved
    UPDATE ecos
    SET status = 'Approved'
    WHERE id = eco_entity_id;

    -- Start transaction
    BEGIN
        -- Fetch ECO parts
        FOR eco_part IN
            SELECT *
            FROM eco_parts
            WHERE eco_id = eco_entity_id
        LOOP
            -- Group parts by PartId and order by Version and PartNumberSuffix
            FOR part IN
                SELECT *
                FROM eco_parts
                WHERE part_id = eco_part.part_id
                ORDER BY version DESC, part_number_suffix DESC
            LOOP
                -- Update the latest part to Released
                IF part = eco_part THEN
                    UPDATE eco_parts
                    SET status = 'Released'
                    WHERE id = part.id;
                ELSE
                    -- Update previous parts to Obsolete
                    UPDATE eco_parts
                    SET status = 'Obsolete'
                    WHERE id = part.id;
                END IF;
            END LOOP;
        END LOOP;

        -- Update ECO status to Completed
        UPDATE ecos
        SET status = 'Completed'
        WHERE id = eco_entity_id;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE EXCEPTION 'Internal server error: %', SQLERRM;
    END;
END;
$$;


-- ===== procedures/35_mes_validate_part_deletion.sql =====
CREATE OR REPLACE PROCEDURE mes.validate_part_deletion(IN input_part_id uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_part_id UUID := input_part_id;
    errors TEXT[] := ARRAY[]::TEXT[];  -- Accumulate error messages here
BEGIN
    -- Check references in EbomChildParts
    IF EXISTS (SELECT 1 FROM mes.ebom e WHERE e.part_id = v_part_id OR e.child_part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in EbomChildParts');
    END IF;

    -- Check references in EbomParts
    IF EXISTS (SELECT 1 FROM mes.ebom e WHERE e.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in EbomParts');
    END IF;

    -- Check references in EcoParts
    IF EXISTS (SELECT 1 FROM mes.eco_part ep WHERE ep.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in EcoParts');
    END IF;

    -- Check references in GrnLineItems
    IF EXISTS (SELECT 1 FROM sc.grn_line_item gli WHERE gli.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in GrnLineItems');
    END IF;

    -- Check references in GuideEbomChildParts
    IF EXISTS (SELECT 1 FROM mes.guide_ebom ge WHERE ge.part_id = v_part_id OR ge.child_part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in GuideEbomChildParts');
    END IF;

    -- Check references in GuideEbomParts
    IF EXISTS (SELECT 1 FROM mes.guide_ebom ge WHERE ge.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in GuideEbomParts');
    END IF;

    -- Check references in GuideMboms
    IF EXISTS (SELECT 1 FROM mes.guide_mbom gm WHERE gm.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in GuideMboms');
    END IF;

    -- Check references in GuideStepEquipments
    IF EXISTS (SELECT 1 FROM mes.guide_step_equipment gse WHERE gse.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in GuideStepEquipments');
    END IF;

    -- Check references in Guides
    IF EXISTS (SELECT 1 FROM mes.guide g WHERE g.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in Guides');
    END IF;

    -- Check references in InventoryParts
    IF EXISTS (SELECT 1 FROM sc.inventory_part ip WHERE ip.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in InventoryParts');
    END IF;

    -- Check references in InventoryStocks
    IF EXISTS (SELECT 1 FROM sc.inventory_stock ist WHERE ist.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in InventoryStocks');
    END IF;

    -- Check references in InventoryTransactions
    IF EXISTS (SELECT 1 FROM sc.inventory_transaction it WHERE it.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in InventoryTransactions');
    END IF;

    -- Check references in KitBomComments
    IF EXISTS (SELECT 1 FROM mes.kit_bom_comment kbc WHERE kbc.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in KitBomComments');
    END IF;

    -- Check references in KitSerials
    IF EXISTS (SELECT 1 FROM mes.kit_serial ks WHERE ks.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in KitSerials');
    END IF;

    -- Check references in Kits
    IF EXISTS (SELECT 1 FROM mes.kit k WHERE k.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in Kits');
    END IF;

    -- Check references in MaterialKits
    IF EXISTS (SELECT 1 FROM mes.material_kit mk WHERE mk.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in MaterialKits');
    END IF;

    -- Check references in PoLineItems
    IF EXISTS (SELECT 1 FROM sc.po_line_item pli WHERE pli.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in PoLineItems');
    END IF;

    -- Check references in Products via ECO
    IF EXISTS (
        SELECT 1 FROM mes.eco e
        WHERE e.id IN (
            SELECT ep.eco_id FROM mes.eco_part ep WHERE ep.part_id = v_part_id
        )
    ) THEN
        errors := array_append(errors, 'Found in Products');
    END IF;

    -- Check references in RequisitionLineItems
    IF EXISTS (SELECT 1 FROM sc.requisition_line_item rli WHERE rli.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in RequisitionLineItems');
    END IF;

    -- Check references in CompanyParts
    IF EXISTS (SELECT 1 FROM sc.company_part cp WHERE cp.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in CompanyParts');
    END IF;

    -- Check references in WorkPackages
    IF EXISTS (SELECT 1 FROM mes.work_package wp WHERE wp.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in WorkPackages');
    END IF;

    -- Check references in WorkOrders
    IF EXISTS (SELECT 1 FROM mes.work_order wo WHERE wo.part_id = v_part_id) THEN
        errors := array_append(errors, 'Found in WorkOrders');
    END IF;

    -- Final validation and error reporting
    IF array_length(errors, 1) > 0 THEN
        RAISE EXCEPTION 'Cannot delete part due to referenced dependencies: %', array_to_string(errors, ', ');
    ELSE
        RAISE NOTICE 'Part % is safe to delete. No references found.', v_part_id;
    END IF;
END;
$$;


-- ===== procedures/36_mes_validate_record.sql =====
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


-- ===== procedures/37_pm_create_default_board_columns.sql =====
CREATE OR REPLACE FUNCTION pm.create_default_board_columns(p_project_id uuid, p_created_by character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO pm.board_column (project_id, name, position, color, maps_to_status, is_default, created_by)
    VALUES
        (p_project_id, 'To Do', 0, '#9e9e9e', 'To Do', TRUE, p_created_by),
        (p_project_id, 'In Progress', 1, '#2196f3', 'In Progress', FALSE, p_created_by),
        (p_project_id, 'Review', 2, '#ff9800', 'Logged', FALSE, p_created_by),
        (p_project_id, 'Done', 3, '#4caf50', 'Completed', FALSE, p_created_by);
END;
$$;


-- ===== procedures/38_sc_generate_tender_number.sql =====
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


-- ===== procedures/39_mes_part_number_trigger.sql =====
-- CREATE OR REPLACE so this repeatable procedure file is re-appliable on every deploy
-- (the pipeline re-runs all procedures each time). Requires PostgreSQL 14+ (target is 16).
CREATE OR REPLACE TRIGGER part_number_trigger BEFORE INSERT OR UPDATE OF part_type_id ON mes.part FOR EACH ROW EXECUTE FUNCTION mes.generate_part_number();

-- ===== procedures/40_mes_trg_update_has_bom_flag.sql =====
-- CREATE OR REPLACE so this repeatable procedure file is re-appliable on every deploy
-- (the pipeline re-runs all procedures each time). Requires PostgreSQL 14+ (target is 16).
CREATE OR REPLACE TRIGGER trg_update_has_bom_flag AFTER INSERT OR DELETE OR UPDATE ON mes.ebom FOR EACH ROW EXECUTE FUNCTION mes.update_has_bom_flag();

