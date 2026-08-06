--
-- PostgreSQL database dump
--

\restrict UjUO0IHgQPNu7meYfcqWDWl1ljNZBP44FCFdYCgTXgkSQxWt0aDzxMeNGXPGbqv

-- Dumped from database version 16.12
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: application; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA application;


--
-- Name: common; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA common;


--
-- Name: mes; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA mes;


--
-- Name: pm; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pm;


--
-- Name: sc; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA sc;


--
-- Name: delete_user_role(uuid, uuid, text); Type: PROCEDURE; Schema: application; Owner: -
--

CREATE PROCEDURE application.delete_user_role(IN target_user_id uuid, IN target_app_id uuid, IN user_email text)
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


--
-- Name: generate_alphanumeric_sequence(character varying, bigint); Type: FUNCTION; Schema: application; Owner: -
--

CREATE FUNCTION application.generate_alphanumeric_sequence(prefix character varying, seq_num bigint) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN prefix || TO_CHAR(seq_num, 'FM00000000');
END;
$$;


--
-- Name: get_user_roles(character varying, character varying); Type: PROCEDURE; Schema: application; Owner: -
--

CREATE PROCEDURE application.get_user_roles(IN useremail character varying, IN appname character varying)
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


--
-- Name: set_default_role(uuid, uuid, text); Type: PROCEDURE; Schema: application; Owner: -
--

CREATE PROCEDURE application.set_default_role(IN p_user_id uuid, IN p_role_id uuid, IN p_user_email text)
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


--
-- Name: approve_eco(uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.approve_eco(IN eco_entity_id uuid, IN user_email text)
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


--
-- Name: clone_ebom(uuid, uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.clone_ebom(IN original_part_id uuid, IN new_part_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Clone the original part's DIRECT children onto the new part (single level).
    -- Child parts are shared/existing and keep their own BOMs, so descendants must
    -- NOT be re-parented under the new part — a recursive copy flattens the
    -- hierarchy (every grandchild becomes a direct child of the new part).
    -- Soft-deleting a part does not cascade to its ebom link rows, so join mes.part
    -- on child_part_id and require deleted_by IS NULL to avoid cloning soft-deleted
    -- parts (mirrors the guard in PartService.ClonePartWithNewVersion).
    INSERT INTO mes.ebom (part_id, child_part_id, quantity, created_by, created_at)
    SELECT new_part_id, e.child_part_id, e.quantity, user_email, NOW()
    FROM mes.ebom e
    INNER JOIN mes.part cp ON cp.id = e.child_part_id AND cp.deleted_by IS NULL
    WHERE e.part_id = original_part_id
      AND e.deleted_by IS NULL
    ON CONFLICT (part_id, child_part_id, deleted_at) DO NOTHING;
END;
$$;


--
-- Name: clone_guide(uuid, uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.clone_guide(IN original_guide_id uuid, IN new_part_id uuid, IN user_email text, OUT new_guide_id uuid, OUT new_guide_number text)
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


--
-- Name: consume_inventory_for_kit(uuid, integer, text, uuid); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.consume_inventory_for_kit(IN kit_part_id uuid, IN multiplier integer, IN user_email text, IN work_order_id uuid)
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


--
-- Name: copy_guide_step(uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.copy_guide_step(IN original_step_id uuid, IN user_email text, OUT new_step_id uuid)
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


--
-- Name: create_draft_guide(uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.create_draft_guide(IN original_guide_id uuid, IN user_email text, OUT new_guide_id uuid)
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


--
-- Name: create_guide_ebom(uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.create_guide_ebom(IN guide_id uuid, IN user_email text)
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


--
-- Name: create_guide_mbom(uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.create_guide_mbom(IN guide_id uuid, IN user_email text)
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


--
-- Name: create_material_kit_and_kits(text, uuid, uuid, uuid, integer, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.create_material_kit_and_kits(IN name text, IN part_id uuid, IN location_id uuid, IN image_id uuid, IN quantity integer, IN user_email text, OUT new_material_kit_id uuid)
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


--
-- Name: create_work_package_and_work_orders(text, uuid, uuid, uuid, uuid, uuid, timestamp with time zone, timestamp with time zone, integer, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.create_work_package_and_work_orders(IN p_name text, IN p_part_id uuid, IN p_guide_id uuid, IN p_product_id uuid, IN p_technician_id uuid, IN p_manager_id uuid, IN p_start_date timestamp with time zone, IN p_end_date timestamp with time zone, IN p_quantity integer, IN p_user_email text, OUT new_work_package_id uuid)
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


--
-- Name: discard_eco(uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.discard_eco(IN eco_entity_id uuid, IN user_email text)
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


--
-- Name: generate_eco_number(); Type: FUNCTION; Schema: mes; Owner: -
--

CREATE FUNCTION mes.generate_eco_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_code INT;
    new_code VARCHAR(50);
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 5) AS INT)), 0) INTO max_code
    FROM mes.eco;
 
    new_code := 'ECO-' || LPAD((max_code + 1)::TEXT, 8, '0');
 
    RETURN new_code;
END;
$$;


--
-- Name: generate_part_number(); Type: FUNCTION; Schema: mes; Owner: -
--

CREATE FUNCTION mes.generate_part_number() RETURNS trigger
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


--
-- Name: get_part_sequence(text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.get_part_sequence(IN input_sequence text, OUT next_sequence text)
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


--
-- Name: guide_mbom_refresh(); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.guide_mbom_refresh()
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


--
-- Name: import_ebom(jsonb[], text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.import_ebom(IN records jsonb[], IN user_email text, OUT results jsonb)
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


--
-- Name: import_locations(jsonb[], text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.import_locations(IN records jsonb[], IN user_email text, OUT results jsonb)
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


--
-- Name: import_machines(jsonb[], text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.import_machines(IN records jsonb[], IN user_email text, OUT results jsonb)
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


--
-- Name: import_news(jsonb[], text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.import_news(IN records jsonb[], IN user_email text, OUT results jsonb)
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


--
-- Name: import_parts(jsonb[], text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.import_parts(IN records jsonb[], IN user_email text, OUT results jsonb)
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


--
-- Name: import_tools(jsonb[], text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.import_tools(IN tools jsonb[], IN user_email text, OUT results jsonb)
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


--
-- Name: is_eco_valid_for_submit(uuid); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.is_eco_valid_for_submit(IN p_ecoid uuid)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_errors TEXT := '';
    v_part_docs_missing TEXT;
    v_child_docs_missing TEXT;
    v_unreleased_bom TEXT;
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
       AND c.status <> 'Release'
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

    -- Raise exception if any rule failed
    IF v_errors <> '' THEN
        RAISE EXCEPTION '%', v_errors;
    ELSE
        RAISE NOTICE 'ECO % is valid for submission.', p_ecoid;
    END IF;
END;
$$;


--
-- Name: release_eco(uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.release_eco(IN eco_entity_id uuid, IN user_email text)
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


--
-- Name: reorder_guide_step_tasks(uuid, integer); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.reorder_guide_step_tasks(IN guide_step_task_id uuid, IN new_sequence integer)
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


--
-- Name: reorder_guide_steps(uuid, integer); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.reorder_guide_steps(IN guide_step_id uuid, IN new_sequence integer)
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


--
-- Name: reorder_guide_steps_after_deletion(uuid, integer); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.reorder_guide_steps_after_deletion(IN guide_id_var uuid, IN deleted_sequence integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Decrease sequence numbers for all steps that come after the deleted step
    UPDATE mes.guide_step
    SET sequence = sequence - 1
    WHERE guide_id = guide_id_var AND sequence > deleted_sequence;
END;
$$;


--
-- Name: reserve_inventory_for_kit(uuid, integer, text, uuid); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.reserve_inventory_for_kit(IN kit_part_id uuid, IN multiplier integer, IN user_email text, IN work_order_id uuid)
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


--
-- Name: reset_work_order(uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.reset_work_order(IN workorder_id uuid, IN user_email text)
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


--
-- Name: reset_work_order_step(uuid, text); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.reset_work_order_step(IN workorderstepid uuid, IN p_user_email text)
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


--
-- Name: revert_inventory_for_kit(uuid, integer, text, uuid); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.revert_inventory_for_kit(IN kit_part_id uuid, IN multiplier integer, IN user_email text, IN work_order_id uuid)
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


--
-- Name: update_has_bom_flag(); Type: FUNCTION; Schema: mes; Owner: -
--

CREATE FUNCTION mes.update_has_bom_flag() RETURNS trigger
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


--
-- Name: update_status_to_approved(uuid); Type: FUNCTION; Schema: mes; Owner: -
--

CREATE FUNCTION mes.update_status_to_approved(eco_entity_id uuid) RETURNS void
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


--
-- Name: validate_part_deletion(uuid); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.validate_part_deletion(IN input_part_id uuid)
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


--
-- Name: validate_record(jsonb); Type: PROCEDURE; Schema: mes; Owner: -
--

CREATE PROCEDURE mes.validate_record(IN record jsonb)
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


--
-- Name: create_default_board_columns(uuid, character varying); Type: FUNCTION; Schema: pm; Owner: -
--

CREATE FUNCTION pm.create_default_board_columns(p_project_id uuid, p_created_by character varying) RETURNS void
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


--
-- Name: FUNCTION create_default_board_columns(p_project_id uuid, p_created_by character varying); Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON FUNCTION pm.create_default_board_columns(p_project_id uuid, p_created_by character varying) IS 'Creates default Kanban columns for a new project';


--
-- Name: generate_program_code(); Type: FUNCTION; Schema: pm; Owner: -
--

CREATE FUNCTION pm.generate_program_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('pm.program_code_seq');

    -- Return the formatted program_code as 'PRG-000001', 'PRG-000002', etc.
    RETURN 'PRG-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_project_code(); Type: FUNCTION; Schema: pm; Owner: -
--

CREATE FUNCTION pm.generate_project_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('pm.project_code_seq');

    -- Return the formatted project_code as 'PGJ-000001', 'PGJ-000002', etc.
    RETURN 'PRJ-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_task_code(); Type: FUNCTION; Schema: pm; Owner: -
--

CREATE FUNCTION pm.generate_task_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('pm.task_code_seq');
    -- Return the formatted task_code as 'TSK-000001', 'TSK-000002', etc.
    RETURN 'TSK-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_company_code(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_company_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.company_code_seq');
    
    -- Return formatted program number
    RETURN 'COM-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_customer_code(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_customer_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.customer_code_seq');
    
    -- Return formatted program number
    RETURN 'CUS-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_grn_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_grn_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
    current_year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
BEGIN
    -- Get the next value from the sequence
    next_val := nextval('sc.grn_seq');
 
    -- Return the formatted GRN number as 'GRN-2025-0001', 'GRN-2025-0002', etc.
    RETURN 'GRN-' || current_year || '-' || LPAD(next_val::TEXT, 4, '0');
END;
$$;


--
-- Name: generate_partner_code(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_partner_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.partner_code_seq');
    
    -- Return formatted program number
    RETURN 'P-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_purchase_order_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_purchase_order_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('sc.purchase_order_seq');

    -- Return the formatted purchase order number as 'PO-000001', 'PO-000002', etc.
    RETURN 'PO-' || LPAD(next_val::TEXT, 6, '0');

END;
$$;


--
-- Name: generate_req_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_req_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
    current_year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
BEGIN
    -- Get next value from the requisition sequence
    next_val := nextval('sc.req_seq');

    -- Return formatted requisition number like 'REQ-2025-0001'
    RETURN 'REQ-' || current_year || '-' || LPAD(next_val::TEXT, 4, '0');
END;
$$;


--
-- Name: generate_scrap_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_scrap_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    next_val := nextval('sc.scrap_number_seq');
    RETURN 'SCR-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_stock_movement_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_stock_movement_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INTEGER;
    prefix TEXT := 'SM-';
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(movement_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_val
    FROM sc.stock_movement
    WHERE movement_number LIKE 'SM-%';
    RETURN prefix || LPAD(next_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_tender_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_tender_number() RETURNS character varying
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


--
-- Name: generate_vendor_code(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_vendor_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.vendor_code_seq');
    
    -- Return formatted program number
    RETURN 'VEN-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_vendor_return_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_vendor_return_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    next_val := nextval('sc.vendor_return_number_seq');

    RETURN 'VRN-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.app (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_number integer NOT NULL,
    app_name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: app_app_number_seq; Type: SEQUENCE; Schema: application; Owner: -
--

CREATE SEQUENCE application.app_app_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: app_app_number_seq; Type: SEQUENCE OWNED BY; Schema: application; Owner: -
--

ALTER SEQUENCE application.app_app_number_seq OWNED BY application.app.app_number;


--
-- Name: bulk_upload; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.bulk_upload (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_name character varying(255) DEFAULT 'All'::character varying NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    requested_by character varying(255) NOT NULL,
    requested_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type character varying(255) NOT NULL,
    error json,
    status character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    failed_count integer,
    success_count integer,
    total_count integer,
    url character varying(500),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: customer; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.customer (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    tax_number character varying(255),
    category character varying(255),
    customer_address_id uuid,
    image_url character varying(500),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: employee_department; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.employee_department (
    sno integer,
    employee_id character varying(50) NOT NULL,
    employee_name character varying(255) NOT NULL,
    designation character varying(255),
    department character varying(255),
    email_id character varying(255),
    user_id uuid,
    department_id uuid
);


--
-- Name: feature_bit; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.feature_bit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    feature_name character varying(255) NOT NULL,
    application_name character varying(255) DEFAULT 'All'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: issue; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.issue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_name character varying(255),
    issue_type character varying(100) NOT NULL,
    priority character varying(50),
    summary text NOT NULL,
    description text,
    product_id uuid,
    guide_id uuid,
    work_order_id uuid,
    jira_id character varying(255),
    devops_id character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: option_set; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.option_set (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    application_name character varying(255) DEFAULT 'All'::character varying NOT NULL,
    description text,
    "values" json NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    display_name character varying(255) NOT NULL,
    columns json,
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: organization; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(255),
    description text,
    image_url character varying(500),
    tax_number character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: organization_address; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.organization_address (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    address_id uuid NOT NULL,
    address_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: permission; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.permission (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    category_name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: role; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.role (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_number integer NOT NULL,
    role_name character varying(255) NOT NULL,
    role_description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    app_id uuid NOT NULL,
    system_defined boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: role_filter; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.role_filter (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    entity character varying(100) NOT NULL,
    key character varying(100) NOT NULL,
    operator character varying(20) NOT NULL,
    value text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: role_permission; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.role_permission (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission character varying(255) NOT NULL,
    enable boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: role_role_number_seq; Type: SEQUENCE; Schema: application; Owner: -
--

CREATE SEQUENCE application.role_role_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_role_number_seq; Type: SEQUENCE OWNED BY; Schema: application; Owner: -
--

ALTER SEQUENCE application.role_role_number_seq OWNED BY application.role.role_number;


--
-- Name: staff; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255),
    email character varying(255) NOT NULL,
    phone character varying(255),
    organization_id uuid NOT NULL,
    manager_id uuid,
    staff_number character varying(50),
    job_title character varying(255),
    employment_start_date date,
    employment_end_date date,
    image_url character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: user; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_number integer NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255),
    email character varying(255) NOT NULL,
    phone character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    department character varying(255),
    image_url text,
    job_title character varying(255),
    department_id uuid
);


--
-- Name: user_role; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.user_role (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    is_default boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: user_user_number_seq; Type: SEQUENCE; Schema: application; Owner: -
--

CREATE SEQUENCE application.user_user_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_user_number_seq; Type: SEQUENCE OWNED BY; Schema: application; Owner: -
--

ALTER SEQUENCE application.user_user_number_seq OWNED BY application."user".user_number;


--
-- Name: additional_recipient_configuration; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.additional_recipient_configuration (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_code character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    recipient_name character varying(255),
    recipient_type character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255),
    updated_at timestamp without time zone,
    updated_by character varying(255),
    deleted_at timestamp without time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE additional_recipient_configuration; Type: COMMENT; Schema: common; Owner: -
--

COMMENT ON TABLE common.additional_recipient_configuration IS 'Global notification recipients configured per email template type';


--
-- Name: COLUMN additional_recipient_configuration.template_code; Type: COMMENT; Schema: common; Owner: -
--

COMMENT ON COLUMN common.additional_recipient_configuration.template_code IS 'Email template code (e.g., REQUISITION_SUBMITTED, PO_APPROVED)';


--
-- Name: COLUMN additional_recipient_configuration.email; Type: COMMENT; Schema: common; Owner: -
--

COMMENT ON COLUMN common.additional_recipient_configuration.email IS 'Recipient email address';


--
-- Name: COLUMN additional_recipient_configuration.recipient_name; Type: COMMENT; Schema: common; Owner: -
--

COMMENT ON COLUMN common.additional_recipient_configuration.recipient_name IS 'Display name for the recipient';


--
-- Name: COLUMN additional_recipient_configuration.recipient_type; Type: COMMENT; Schema: common; Owner: -
--

COMMENT ON COLUMN common.additional_recipient_configuration.recipient_type IS 'Type of recipient (e.g., CC, Watcher, Stakeholder)';


--
-- Name: address; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.address (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    postal_code character varying(20),
    country_id uuid NOT NULL,
    phone_number character varying(20),
    latitude numeric(9,6),
    longitude numeric(9,6),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: approval; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.approval (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id uuid NOT NULL,
    stage_number integer NOT NULL,
    approver_id uuid NOT NULL,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    acted_at timestamp with time zone,
    comment text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT approval_stage_number_check CHECK ((stage_number >= 1)),
    CONSTRAINT approval_status_check CHECK (((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Cancelled'::character varying)::text, ('Removed'::character varying)::text])))
);


--
-- Name: approval_configuration; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.approval_configuration (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(100) NOT NULL,
    number_of_levels integer DEFAULT 1 NOT NULL,
    description text,
    require_sequential_approval boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_number_of_levels_positive CHECK ((number_of_levels > 0))
);


--
-- Name: approval_log; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.approval_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    action_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action_by character varying(255) NOT NULL,
    stage_number integer,
    notes text,
    previous_status character varying(50),
    new_status character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_stage_number_positive CHECK (((stage_number IS NULL) OR (stage_number > 0)))
);


--
-- Name: approval_notification_recipient; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.approval_notification_recipient (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    recipient_user_id uuid NOT NULL,
    recipient_type character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_recipient_type CHECK (((recipient_type IS NULL) OR ((recipient_type)::text = ANY (ARRAY[('CC'::character varying)::text, ('Watcher'::character varying)::text, ('Stakeholder'::character varying)::text]))))
);


--
-- Name: bank_account; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.bank_account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bank_name character varying(255) NOT NULL,
    branch_name character varying(255) NOT NULL,
    account_number character varying(100) NOT NULL,
    swift_code character varying(20),
    currency_id uuid,
    ifsc_code character varying(20),
    address_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: contact; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.contact (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone_number character varying(20),
    alternate_phone character varying(20),
    job_title character varying(100),
    notes text,
    is_primary boolean DEFAULT false,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    company_id uuid,
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: country; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.country (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    iso2_code character varying(2) NOT NULL,
    iso3_code character varying(3) NOT NULL,
    numeric_code integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: currency; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.currency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(3) NOT NULL,
    name character varying(100) NOT NULL,
    symbol character varying(10),
    country character varying(100),
    minor_unit integer DEFAULT 2,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: department; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.department (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by character varying(255),
    updated_at timestamp without time zone,
    deleted_by character varying(255),
    deleted_at timestamp without time zone,
    parent_department_id uuid,
    head_of_department_user_id uuid
);


--
-- Name: document; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.document (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_type character varying(100) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    file_name character varying(255),
    file_extension character varying(50),
    file_size bigint,
    file_path character varying(500),
    file_relative_path character varying(500) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    document_storage_type character varying(20) NOT NULL,
    metadata jsonb,
    tags text[],
    external_url text,
    mime_type character varying(100),
    description text,
    title character varying(255),
    CONSTRAINT chk_document_storage_type CHECK (((document_storage_type)::text = ANY (ARRAY[('uploaded'::character varying)::text, ('external_url'::character varying)::text])))
);


--
-- Name: document_with_users_vw; Type: VIEW; Schema: common; Owner: -
--

CREATE VIEW common.document_with_users_vw AS
 SELECT d.id,
    d.title,
    d.description,
    d.document_type,
    d.entity_type,
    d.entity_id,
    d.file_name,
    d.file_extension,
    d.file_size,
    d.file_path,
    d.file_relative_path,
    d.mime_type,
    d.document_storage_type,
    d.external_url,
    d.tags,
    d.metadata,
    d.is_active,
    d.created_at,
    d.created_by,
    TRIM(BOTH FROM (((COALESCE(cu.first_name, ''::character varying))::text || ' '::text) || (COALESCE(cu.last_name, ''::character varying))::text)) AS created_by_full_name
   FROM (common.document d
     LEFT JOIN application."user" cu ON ((lower((cu.email)::text) = lower((d.created_by)::text))))
  WHERE (d.deleted_at IS NULL);


--
-- Name: fcm_token; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.fcm_token (
    id uuid DEFAULT gen_random_uuid(),
    email character varying(255) NOT NULL,
    device_id character varying(255) NOT NULL,
    device_token character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: image; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.image (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    file_name character varying(255) NOT NULL,
    file_extension character varying(50),
    file_size integer NOT NULL,
    file_path character varying(255) NOT NULL,
    file_relative_path character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    entity_id uuid,
    entity_type character varying(100),
    image_type character varying(100),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: video; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.video (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    file_name character varying(255) NOT NULL,
    file_relative_path character varying(255) NOT NULL,
    file_extension character varying(50) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_size integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    entity_id uuid,
    entity_type character varying(100),
    video_type character varying(100),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: assembly_location; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.assembly_location (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: ebom; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.ebom (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_id uuid NOT NULL,
    child_part_id uuid NOT NULL,
    quantity integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    assembly_location_id uuid
);


--
-- Name: eco; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.eco (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    reason_for_change text NOT NULL,
    description text,
    change_type character varying(255) NOT NULL,
    impact_analysis text,
    priority character varying(255) DEFAULT 'Low'::character varying NOT NULL,
    requestor character varying(255) NOT NULL,
    planned_implementation_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    approved_by character varying(255),
    approved_date timestamp with time zone,
    status character varying(255) DEFAULT 'Draft'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    number character varying(50) DEFAULT mes.generate_eco_number() NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    approver character varying(255),
    CONSTRAINT eco_status_check CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Discarded'::character varying)::text, ('Rejected'::character varying)::text, ('Released'::character varying)::text])))
);


--
-- Name: eco_log; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.eco_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    eco_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    action_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action_by character varying(255) NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: eco_part; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.eco_part (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    eco_id uuid NOT NULL,
    part_id uuid NOT NULL,
    status character varying(255) NOT NULL,
    description text,
    old_version character varying(255) NOT NULL,
    new_version character varying(255),
    effective_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    previous_status character varying(255) NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT eco_part_status_check CHECK (((status)::text = ANY (ARRAY[('Obsolete'::character varying)::text, ('Release'::character varying)::text])))
);


--
-- Name: eco_with_users_vw; Type: VIEW; Schema: mes; Owner: -
--

CREATE VIEW mes.eco_with_users_vw AS
 SELECT eco.id,
    eco.number,
    eco.name,
    eco.reason_for_change,
    eco.description,
    eco.change_type,
    eco.impact_analysis,
    eco.priority,
    eco.requestor,
    eco.approver,
    eco.planned_implementation_date,
    eco.approved_by,
    eco.approved_date,
    eco.status,
    eco.is_active,
    eco.created_at,
    eco.created_by,
    eco.updated_at,
    eco.updated_by,
    req_user.id AS requestor_id,
    (((req_user.first_name)::text || ' '::text) || (req_user.last_name)::text) AS requestor_full_name,
    req_user.email AS requestor_email,
    json_agg(json_build_object('approval_id', appr.id, 'approver_id', appr.approver_id, 'status', appr.status, 'comment', appr.comment, 'full_name', (((appr_user.first_name)::text || ' '::text) || (appr_user.last_name)::text), 'email', appr_user.email)) FILTER (WHERE (appr.id IS NOT NULL)) AS approvers
   FROM (((mes.eco eco
     LEFT JOIN application."user" req_user ON ((((eco.requestor)::text = (req_user.email)::text) AND (req_user.deleted_by IS NULL))))
     LEFT JOIN common.approval appr ON (((appr.entity_id = eco.id) AND (appr.deleted_by IS NULL))))
     LEFT JOIN application."user" appr_user ON (((appr.approver_id = appr_user.id) AND (appr_user.deleted_by IS NULL))))
  WHERE (eco.deleted_by IS NULL)
  GROUP BY eco.id, eco.number, eco.name, eco.reason_for_change, eco.description, eco.change_type, eco.impact_analysis, eco.priority, eco.requestor, eco.approver, eco.planned_implementation_date, eco.approved_by, eco.approved_date, eco.status, eco.is_active, eco.created_at, eco.created_by, eco.updated_at, eco.updated_by, req_user.id, req_user.first_name, req_user.last_name, req_user.email;


--
-- Name: email_log; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.email_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_code character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id uuid,
    recipient_email character varying(255) NOT NULL,
    subject character varying(500) NOT NULL,
    body text NOT NULL,
    status character varying(50) DEFAULT 'Pending'::character varying NOT NULL,
    sent_at timestamp without time zone,
    error_message text,
    retry_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255) NOT NULL,
    updated_at timestamp without time zone,
    updated_by character varying(255),
    deleted_at timestamp without time zone,
    deleted_by character varying(255)
);


--
-- Name: email_template; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.email_template (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    subject character varying(500) NOT NULL,
    body text NOT NULL,
    description text,
    is_html boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255) NOT NULL,
    updated_at timestamp without time zone,
    updated_by character varying(255),
    deleted_at timestamp without time zone,
    deleted_by character varying(255)
);


--
-- Name: guide; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    sequence integer NOT NULL,
    number character varying(255) NOT NULL,
    platform_id uuid,
    part_id uuid NOT NULL,
    guide_type_id uuid NOT NULL,
    clone_from_id uuid,
    version integer DEFAULT 1 NOT NULL,
    status character varying(255) DEFAULT 'Draft'::character varying NOT NULL,
    check_out_by character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    calculated_weight double precision DEFAULT 0 NOT NULL,
    category character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_check_out_history; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_check_out_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guide_id uuid NOT NULL,
    is_checked_out boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_ebom; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_ebom (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guide_id uuid NOT NULL,
    part_id uuid NOT NULL,
    child_part_id uuid NOT NULL,
    quantity integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_mbom; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_mbom (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guide_id uuid NOT NULL,
    part_id uuid NOT NULL,
    quantity integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    weight double precision DEFAULT 0 NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_step_equipment; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_step_equipment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_type character varying(255) NOT NULL,
    part_id uuid,
    tool_id uuid,
    machine_id uuid,
    quantity integer NOT NULL,
    guide_step_id uuid NOT NULL,
    guide_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: part; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.part (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255),
    name character varying(255) NOT NULL,
    part_type_id uuid NOT NULL,
    unit_of_measure_id uuid,
    make_buy integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_serial_number_required boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    weight double precision DEFAULT 0 NOT NULL,
    part_number_suffix character varying(255) NOT NULL,
    version character(2) DEFAULT '01'::bpchar NOT NULL,
    eco_id uuid,
    status character varying(20) DEFAULT 'Draft'::character varying,
    unit_price numeric(18,4),
    manufacturing_part_number text,
    part_number character varying(255) GENERATED ALWAYS AS ((((part_number_suffix)::text || '-'::text) || (version)::text)) STORED NOT NULL,
    description text,
    item_type character varying(255),
    reference_number character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    has_bom boolean DEFAULT false NOT NULL,
    manufacturer_name character varying(255),
    space_qualified boolean,
    trl integer,
    material character varying(255),
    hsn_code character varying(50),
    country_of_origin_id uuid,
    short_description text,
    grade character varying(100),
    subsystem_id uuid,
    package character varying(100),
    qualification character varying(100),
    radiation_tolerance character varying(100),
    specification text,
    temp_coefficient character varying(50),
    temp_range character varying(50),
    CONSTRAINT chk_manufacturer_details_required CHECK ((((make_buy = 1) AND (((item_type)::text = ANY (ARRAY[('Goods'::character varying)::text, ('Services'::character varying)::text])) OR ((manufacturing_part_number IS NOT NULL) AND (TRIM(BOTH FROM manufacturing_part_number) <> ''::text) AND (manufacturer_name IS NOT NULL) AND (TRIM(BOTH FROM manufacturer_name) <> ''::text)))) OR (make_buy = 0))),
    CONSTRAINT part_status_check CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Release'::character varying)::text, ('Obsolete'::character varying)::text, ('Archived'::character varying)::text]))),
    CONSTRAINT part_version_check CHECK ((version ~ '^[0-9]{2}$'::text))
);


--
-- Name: guide_mbom_vw; Type: VIEW; Schema: mes; Owner: -
--

CREATE VIEW mes.guide_mbom_vw AS
 SELECT g.id AS guide_id,
    g.part_id AS guide_part_id,
    gp.part_number AS guide_part_number,
    gp.name AS guide_part_name,
    gp.part_number_suffix AS guide_part_number_suffix,
    e.id AS ebom_id,
    e.child_part_id AS ebom_part_id,
    ep.part_number,
    ep.name,
    ep.part_number_suffix,
    ep.is_serial_number_required,
    e.quantity AS quantity_e,
    gse.part_id AS gse_part_id,
    gm.weight AS guide_mbom_weight,
    COALESCE(sum(gse.quantity), (0)::bigint) AS quantity_m,
    cp.weight AS child_part_weight
   FROM ((((((mes.guide g
     LEFT JOIN mes.part gp ON (((g.part_id = gp.id) AND (gp.deleted_by IS NULL))))
     LEFT JOIN mes.ebom e ON (((g.part_id = e.part_id) AND (e.deleted_by IS NULL))))
     LEFT JOIN mes.part ep ON (((e.child_part_id = ep.id) AND (ep.deleted_by IS NULL))))
     LEFT JOIN mes.guide_step_equipment gse ON (((g.id = gse.guide_id) AND (e.child_part_id = gse.part_id) AND (gse.deleted_by IS NULL))))
     LEFT JOIN mes.guide_mbom gm ON (((g.id = gm.guide_id) AND (gm.part_id = e.child_part_id) AND (gm.deleted_by IS NULL))))
     LEFT JOIN mes.part cp ON (((e.child_part_id = cp.id) AND (cp.deleted_by IS NULL))))
  WHERE (g.deleted_by IS NULL)
  GROUP BY g.id, g.part_id, gp.part_number, gp.name, gp.part_number_suffix, e.id, e.child_part_id, ep.part_number, ep.name, ep.part_number_suffix, ep.is_serial_number_required, gse.part_id, e.quantity, gm.weight, cp.weight
 HAVING ((gse.part_id IS NOT NULL) OR (e.child_part_id IS NOT NULL));


--
-- Name: guide_mbom_details; Type: VIEW; Schema: mes; Owner: -
--

CREATE VIEW mes.guide_mbom_details AS
 SELECT g.id AS guideid,
    ge.child_part_id AS partid,
    COALESCE(gmv.quantity_m, (ge.quantity)::bigint) AS quantity
   FROM ((mes.guide g
     JOIN mes.guide_ebom ge ON (((g.part_id = ge.part_id) AND (ge.deleted_by IS NULL))))
     LEFT JOIN mes.guide_mbom_vw gmv ON (((g.id = gmv.guide_id) AND (gmv.ebom_part_id = ge.child_part_id))))
  WHERE (((g.status)::text = 'Published'::text) AND (g.deleted_by IS NULL))
UNION
 SELECT g.id AS guideid,
    e.child_part_id AS partid,
    COALESCE(gmv.quantity_m, (e.quantity)::bigint) AS quantity
   FROM ((mes.guide g
     JOIN mes.ebom e ON (((g.part_id = e.part_id) AND (e.deleted_by IS NULL))))
     LEFT JOIN mes.guide_mbom_vw gmv ON (((g.id = gmv.guide_id) AND (gmv.ebom_part_id = e.child_part_id))))
  WHERE (((g.status)::text = 'Draft'::text) AND (g.deleted_by IS NULL));


--
-- Name: guide_sequence_seq; Type: SEQUENCE; Schema: mes; Owner: -
--

CREATE SEQUENCE mes.guide_sequence_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: guide_sequence_seq; Type: SEQUENCE OWNED BY; Schema: mes; Owner: -
--

ALTER SEQUENCE mes.guide_sequence_seq OWNED BY mes.guide.sequence;


--
-- Name: guide_step; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_step (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    guide_id uuid NOT NULL,
    image_id uuid,
    video_id uuid,
    sequence integer NOT NULL,
    comment text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_step_task; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_step_task (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(450) NOT NULL,
    type character varying(50) NOT NULL,
    taskdetails json,
    description text,
    ismandatory integer NOT NULL,
    guide_step_id uuid NOT NULL,
    guide_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    sequence integer NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_type; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: kit; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.kit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255) NOT NULL,
    part_id uuid NOT NULL,
    location_id uuid,
    material_kit_id uuid,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: kit_bom_comment; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.kit_bom_comment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kit_id uuid NOT NULL,
    part_id uuid NOT NULL,
    comments character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: kit_serial; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.kit_serial (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kit_id uuid NOT NULL,
    part_id uuid NOT NULL,
    serialno character varying(255),
    status character varying(255) DEFAULT 'Unconsumed'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: location; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.location (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: machine; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.machine (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    machine_type_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: machine_type; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.machine_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: material_kit; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.material_kit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    sequence integer NOT NULL,
    number character varying(255) NOT NULL,
    part_id uuid NOT NULL,
    location_id uuid NOT NULL,
    image_id uuid,
    quantity integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: material_kit_sequence_seq; Type: SEQUENCE; Schema: mes; Owner: -
--

CREATE SEQUENCE mes.material_kit_sequence_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: material_kit_sequence_seq; Type: SEQUENCE OWNED BY; Schema: mes; Owner: -
--

ALTER SEQUENCE mes.material_kit_sequence_seq OWNED BY mes.material_kit.sequence;


--
-- Name: news; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.news (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    news_type_id uuid NOT NULL,
    hyperlink character varying(255) NOT NULL,
    origin character varying(255) NOT NULL,
    image character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: news_type; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.news_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: part_duplicate_analysis; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.part_duplicate_analysis (
    manufacturing_part_number text,
    total_count integer,
    xd_linx_part_number text,
    part_number text
);


--
-- Name: part_level; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.part_level (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    sort_order integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255) NOT NULL,
    updated_at timestamp without time zone,
    updated_by character varying(255),
    deleted_at timestamp without time zone,
    deleted_by character varying(255)
);


--
-- Name: part_type; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.part_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    category character varying(255),
    part_number_prefix character varying(3),
    category_type character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    is_visible_in_ui boolean DEFAULT true NOT NULL,
    part_type_category_id uuid,
    department character varying(255),
    part_level_id uuid
);


--
-- Name: part_type_category; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.part_type_category (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: parts_not_associated_with_guides; Type: VIEW; Schema: mes; Owner: -
--

CREATE VIEW mes.parts_not_associated_with_guides AS
 SELECT id,
    part_number,
    name,
    description,
    part_type_id,
    unit_of_measure_id,
    make_buy,
    is_active,
    is_serial_number_required,
    status,
    reference_number,
    short_description,
    created_at,
    created_by,
    updated_at,
    updated_by
   FROM mes.part p
  WHERE ((deleted_by IS NULL) AND ((status)::text = ANY (ARRAY[('Release'::character varying)::text, ('Draft'::character varying)::text])) AND (id IN ( SELECT DISTINCT eb.part_id
           FROM mes.ebom eb
          WHERE ((eb.deleted_by IS NULL) AND (NOT (EXISTS ( SELECT 1
                   FROM mes.guide g
                  WHERE ((g.part_id = eb.part_id) AND (g.deleted_by IS NULL)))))))));


--
-- Name: platform; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.platform (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(1000) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: product; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.product (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    sequence integer NOT NULL,
    number character varying(255) NOT NULL,
    platform_id uuid,
    part_id uuid NOT NULL,
    image_id uuid,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: product_sequence_seq; Type: SEQUENCE; Schema: mes; Owner: -
--

CREATE SEQUENCE mes.product_sequence_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_sequence_seq; Type: SEQUENCE OWNED BY; Schema: mes; Owner: -
--

ALTER SEQUENCE mes.product_sequence_seq OWNED BY mes.product.sequence;


--
-- Name: subsystem; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.subsystem (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255) NOT NULL,
    updated_at timestamp without time zone,
    updated_by character varying(255),
    deleted_at timestamp without time zone,
    deleted_by character varying(255)
);


--
-- Name: temp_parttype_import; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.temp_parttype_import (
    part_type_name text,
    part_type_number text,
    status_to text
);


--
-- Name: tool; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.tool (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    tool_type_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: tool_type; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.tool_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: unit_of_measure; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.unit_of_measure (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: work_order; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.work_order (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    work_package_id uuid,
    kit_id uuid,
    technician_id uuid,
    manager_id uuid,
    guide_id uuid,
    part_id uuid NOT NULL,
    product_id uuid,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    actual_start_date timestamp with time zone,
    actual_end_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    execution_time interval,
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: work_order_step; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.work_order_step (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    guide_step_id uuid NOT NULL,
    technician_id uuid,
    manager_id uuid,
    status character varying(50) DEFAULT 'Pending'::character varying NOT NULL,
    execution_time interval,
    captured_time interval,
    image_id uuid,
    comment character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: work_order_task; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.work_order_task (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    guide_step_task_id uuid NOT NULL,
    task_response json,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    work_order_step_id uuid NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: work_package; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.work_package (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sequence integer NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255) NOT NULL,
    quantity integer NOT NULL,
    technician_id uuid,
    manager_id uuid,
    guide_id uuid,
    part_id uuid NOT NULL,
    product_id uuid,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    actual_start_date timestamp with time zone,
    actual_end_date timestamp with time zone,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: work_package_sequence_seq; Type: SEQUENCE; Schema: mes; Owner: -
--

CREATE SEQUENCE mes.work_package_sequence_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_package_sequence_seq; Type: SEQUENCE OWNED BY; Schema: mes; Owner: -
--

ALTER SEQUENCE mes.work_package_sequence_seq OWNED BY mes.work_package.sequence;


--
-- Name: workorderguidestepsview; Type: VIEW; Schema: mes; Owner: -
--

CREATE VIEW mes.workorderguidestepsview AS
 SELECT wo.id AS workorderid,
    gs.sequence AS guidestepsequence,
    gs.title AS guidestepname,
    count(DISTINCT wost.id) AS numberofworkordertasks,
    count(DISTINCT gst.id) AS numberofguidesteptasks,
    wos.captured_time AS capturedtime,
    wos.status AS workorderstepstatus
   FROM ((((mes.work_order wo
     JOIN mes.guide_step gs ON (((wo.guide_id = gs.guide_id) AND (gs.deleted_by IS NULL))))
     LEFT JOIN mes.work_order_step wos ON (((wo.id = wos.work_order_id) AND (gs.id = wos.guide_step_id) AND (wos.deleted_by IS NULL))))
     LEFT JOIN mes.guide_step_task gst ON (((gs.id = gst.guide_step_id) AND (gst.deleted_by IS NULL))))
     LEFT JOIN mes.work_order_task wost ON (((wo.id = wost.work_order_id) AND (wost.guide_step_task_id = gst.id) AND (wost.deleted_by IS NULL))))
  GROUP BY wo.id, gs.sequence, gs.title, wos.captured_time, wos.id, wos.status
  ORDER BY wo.id, gs.sequence;


--
-- Name: board_column; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.board_column (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "position" integer DEFAULT 0 NOT NULL,
    color character varying(50) DEFAULT '#1976d2'::character varying,
    wip_limit integer,
    is_default boolean DEFAULT false,
    maps_to_status character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE board_column; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.board_column IS 'Kanban board columns for each project';


--
-- Name: COLUMN board_column."position"; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.board_column."position" IS 'Order position of column from left to right';


--
-- Name: COLUMN board_column.color; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.board_column.color IS 'Column header color (hex code)';


--
-- Name: COLUMN board_column.wip_limit; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.board_column.wip_limit IS 'Work-in-progress limit for the column (null = no limit)';


--
-- Name: COLUMN board_column.is_default; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.board_column.is_default IS 'Whether this is the default column for new tasks';


--
-- Name: COLUMN board_column.maps_to_status; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.board_column.maps_to_status IS 'Task status that this column maps to (e.g., To Do, In Progress)';


--
-- Name: dashboard_widget; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.dashboard_widget (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    widget_type character varying(50) NOT NULL,
    title character varying(100),
    position_x integer DEFAULT 0 NOT NULL,
    position_y integer DEFAULT 0 NOT NULL,
    width integer DEFAULT 4 NOT NULL,
    height integer DEFAULT 2 NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    project_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT dashboard_widget_widget_type_check CHECK (((widget_type)::text = ANY (ARRAY[('TaskSummary'::character varying)::text, ('ProjectProgress'::character varying)::text, ('OverdueTasks'::character varying)::text, ('MyTasks'::character varying)::text, ('TeamWorkload'::character varying)::text, ('RecentActivity'::character varying)::text, ('TimeLoggedChart'::character varying)::text, ('MilestoneTracker'::character varying)::text, ('PriorityBreakdown'::character varying)::text, ('StatusDistribution'::character varying)::text])))
);


--
-- Name: TABLE dashboard_widget; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.dashboard_widget IS 'User-configurable dashboard widgets for project management';


--
-- Name: COLUMN dashboard_widget.user_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.user_id IS 'Reference to the user who owns this widget configuration';


--
-- Name: COLUMN dashboard_widget.widget_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.widget_type IS 'Type of widget to render';


--
-- Name: COLUMN dashboard_widget.title; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.title IS 'Custom title for the widget (optional)';


--
-- Name: COLUMN dashboard_widget.position_x; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.position_x IS 'Grid X position (react-grid-layout)';


--
-- Name: COLUMN dashboard_widget.position_y; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.position_y IS 'Grid Y position (react-grid-layout)';


--
-- Name: COLUMN dashboard_widget.width; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.width IS 'Widget width in grid units';


--
-- Name: COLUMN dashboard_widget.height; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.height IS 'Widget height in grid units';


--
-- Name: COLUMN dashboard_widget.settings; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.settings IS 'Widget-specific settings as JSON (filters, display options, etc.)';


--
-- Name: COLUMN dashboard_widget.project_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.project_id IS 'Optional: Filter widget data to specific project';


--
-- Name: milestone; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.milestone (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    project_id uuid,
    target_date timestamp with time zone,
    status character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: program; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.program (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    program_code character varying(255) DEFAULT pm.generate_program_code() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    customer_id uuid,
    program_manager_id uuid,
    supply_chain_manager_id uuid,
    buyer_id uuid,
    status character varying(255),
    goals text,
    budget numeric(18,4),
    actual_spend numeric(18,4),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: program_code_seq; Type: SEQUENCE; Schema: pm; Owner: -
--

CREATE SEQUENCE pm.program_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.project (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_code character varying(255) DEFAULT pm.generate_project_code() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    program_id uuid,
    project_manager_id uuid,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    status character varying(255),
    budget numeric(18,4),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: sub_project; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.sub_project (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sub_project_code character varying(255) DEFAULT pm.generate_project_code() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    project_id uuid NOT NULL,
    program_id uuid,
    project_manager_id uuid,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    status character varying(255),
    budget numeric(18,4),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: project_code_seq; Type: SEQUENCE; Schema: pm; Owner: -
--

CREATE SEQUENCE pm.project_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: resource_allocation; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.resource_allocation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    task_id uuid,
    start_date date NOT NULL,
    end_date date NOT NULL,
    allocated_hours_per_day numeric(4,2) DEFAULT 8.0 NOT NULL,
    allocation_percent integer DEFAULT 100 NOT NULL,
    allocation_type character varying(50) DEFAULT 'Project'::character varying NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    user_id uuid NOT NULL,
    CONSTRAINT chk_date_range CHECK ((end_date >= start_date)),
    CONSTRAINT resource_allocation_allocated_hours_per_day_check CHECK (((allocated_hours_per_day > (0)::numeric) AND (allocated_hours_per_day <= (24)::numeric))),
    CONSTRAINT resource_allocation_allocation_percent_check CHECK (((allocation_percent > 0) AND (allocation_percent <= 100))),
    CONSTRAINT resource_allocation_allocation_type_check CHECK (((allocation_type)::text = ANY (ARRAY[('Project'::character varying)::text, ('Task'::character varying)::text, ('Overhead'::character varying)::text, ('Leave'::character varying)::text, ('Training'::character varying)::text])))
);


--
-- Name: TABLE resource_allocation; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.resource_allocation IS 'Resource allocation tracking for capacity planning';


--
-- Name: COLUMN resource_allocation.project_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.project_id IS 'Project the resource is allocated to';


--
-- Name: COLUMN resource_allocation.task_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.task_id IS 'Optional: Specific task within the project';


--
-- Name: COLUMN resource_allocation.start_date; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.start_date IS 'Start date of allocation period';


--
-- Name: COLUMN resource_allocation.end_date; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.end_date IS 'End date of allocation period';


--
-- Name: COLUMN resource_allocation.allocated_hours_per_day; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.allocated_hours_per_day IS 'Hours per day allocated to this work';


--
-- Name: COLUMN resource_allocation.allocation_percent; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.allocation_percent IS 'Percentage of daily capacity (100% = full time)';


--
-- Name: COLUMN resource_allocation.allocation_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.allocation_type IS 'Type of allocation (Project, Task, Overhead, Leave, Training)';


--
-- Name: COLUMN resource_allocation.user_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.user_id IS 'User being allocated to the resource';


--
-- Name: task; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.task (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    project_id uuid,
    assigned_to_id uuid,
    status character varying(255) NOT NULL,
    due_date timestamp with time zone,
    priority character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    milestone_id uuid,
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    actual_hours numeric(8,2),
    board_column_id uuid,
    estimated_hours numeric(8,2),
    parent_task_id uuid,
    progress_percent integer DEFAULT 0,
    sort_order integer DEFAULT 0,
    start_date timestamp with time zone,
    task_code character varying(50) DEFAULT pm.generate_task_code(),
    task_type character varying(50) DEFAULT 'Task'::character varying,
    CONSTRAINT chk_progress_percent CHECK (((progress_percent >= 0) AND (progress_percent <= 100))),
    CONSTRAINT chk_task_type CHECK (((task_type)::text = ANY (ARRAY[('Task'::character varying)::text, ('Milestone'::character varying)::text, ('SubTask'::character varying)::text]))),
    CONSTRAINT task_priority_check CHECK (((priority)::text = ANY (ARRAY[('High'::character varying)::text, ('Medium'::character varying)::text, ('Low'::character varying)::text]))),
    CONSTRAINT task_status_check CHECK (((status)::text = ANY ('{Completed,"In Progress","To Do",Logged,Review}'::text[])))
);


--
-- Name: COLUMN task.actual_hours; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.actual_hours IS 'Actual hours logged against task';


--
-- Name: COLUMN task.board_column_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.board_column_id IS 'FK to pm.board_column for Kanban boards';


--
-- Name: COLUMN task.estimated_hours; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.estimated_hours IS 'Estimated hours to complete task';


--
-- Name: COLUMN task.parent_task_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.parent_task_id IS 'Self-referential FK for subtask hierarchy';


--
-- Name: COLUMN task.progress_percent; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.progress_percent IS 'Completion percentage (0-100)';


--
-- Name: COLUMN task.sort_order; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.sort_order IS 'Sort order within parent or project';


--
-- Name: COLUMN task.start_date; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.start_date IS 'Task start date for Gantt chart';


--
-- Name: COLUMN task.task_code; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.task_code IS 'Auto-generated unique task code (TSK-XXXXXX)';


--
-- Name: COLUMN task.task_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.task_type IS 'Task, Milestone, or SubTask';


--
-- Name: task_assignee; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.task_assignee (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    assignee_role character varying(50) DEFAULT 'Primary'::character varying NOT NULL,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    user_id uuid NOT NULL,
    CONSTRAINT task_assignee_assignee_role_check CHECK (((assignee_role)::text = ANY (ARRAY[('Primary'::character varying)::text, ('Secondary'::character varying)::text, ('Reviewer'::character varying)::text, ('Watcher'::character varying)::text])))
);


--
-- Name: TABLE task_assignee; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.task_assignee IS 'Multiple assignees per task with different roles';


--
-- Name: COLUMN task_assignee.assignee_role; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_assignee.assignee_role IS 'Primary=main assignee, Secondary=helper, Reviewer=approval, Watcher=notifications only';


--
-- Name: COLUMN task_assignee.assigned_at; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_assignee.assigned_at IS 'When the user member was assigned to this task';


--
-- Name: time_entry; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.time_entry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    entry_date date NOT NULL,
    hours_worked numeric(5,2) NOT NULL,
    description text,
    billable boolean DEFAULT true,
    work_type character varying(50) DEFAULT 'Development'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255),
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    user_id uuid NOT NULL,
    CONSTRAINT time_entry_hours_worked_check CHECK (((hours_worked > (0)::numeric) AND (hours_worked <= (24)::numeric)))
);


--
-- Name: TABLE time_entry; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.time_entry IS 'Time entries logged against tasks';


--
-- Name: COLUMN time_entry.task_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.task_id IS 'Reference to the task this time was logged against';


--
-- Name: COLUMN time_entry.entry_date; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.entry_date IS 'Date the work was performed';


--
-- Name: COLUMN time_entry.hours_worked; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.hours_worked IS 'Number of hours worked (max 24)';


--
-- Name: COLUMN time_entry.billable; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.billable IS 'Whether this time is billable to the client';


--
-- Name: COLUMN time_entry.work_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.work_type IS 'Type of work performed (Development, Design, Testing, etc.)';


--
-- Name: COLUMN time_entry.user_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.user_id IS 'User member who logged the time';


--
-- Name: resource_workload_vw; Type: VIEW; Schema: pm; Owner: -
--

CREATE VIEW pm.resource_workload_vw AS
 SELECT id AS user_id,
    first_name,
    last_name,
    email,
    image_url,
    department,
    job_title,
    ( SELECT COALESCE(json_agg(json_build_object('id', ra.id, 'projectId', ra.project_id, 'projectName', p.name, 'taskId', ra.task_id, 'taskName', t.name, 'startDate', ra.start_date, 'endDate', ra.end_date, 'allocatedHoursPerDay', ra.allocated_hours_per_day, 'allocationPercent', ra.allocation_percent, 'allocationType', ra.allocation_type)), '[]'::json) AS "coalesce"
           FROM ((pm.resource_allocation ra
             LEFT JOIN pm.project p ON ((ra.project_id = p.id)))
             LEFT JOIN pm.task t ON ((ra.task_id = t.id)))
          WHERE ((ra.user_id = s.id) AND (ra.deleted_at IS NULL) AND (ra.end_date >= CURRENT_DATE))) AS current_allocations,
    ( SELECT COALESCE(sum(ra.allocation_percent), (0)::bigint) AS "coalesce"
           FROM pm.resource_allocation ra
          WHERE ((ra.user_id = s.id) AND (ra.deleted_at IS NULL) AND (CURRENT_DATE >= ra.start_date) AND (CURRENT_DATE <= ra.end_date))) AS today_allocation_percent,
    ( SELECT count(*) AS count
           FROM pm.task t
          WHERE ((t.assigned_to_id = s.id) AND (t.deleted_at IS NULL) AND ((t.status)::text <> 'Completed'::text))) AS active_tasks_count,
    ( SELECT count(*) AS count
           FROM pm.task_assignee ta
          WHERE ((ta.user_id = s.id) AND (ta.deleted_at IS NULL) AND ((ta.assignee_role)::text = 'Primary'::text) AND (EXISTS ( SELECT 1
                   FROM pm.task t
                  WHERE ((t.id = ta.task_id) AND (t.deleted_at IS NULL) AND ((t.status)::text <> 'Completed'::text)))))) AS primary_assignments_count,
    ( SELECT COALESCE(sum(te.hours_worked), (0)::numeric) AS "coalesce"
           FROM pm.time_entry te
          WHERE ((te.user_id = s.id) AND (te.deleted_at IS NULL) AND (te.entry_date >= date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone)))) AS hours_logged_this_week,
    ( SELECT COALESCE(sum(te.hours_worked), (0)::numeric) AS "coalesce"
           FROM pm.time_entry te
          WHERE ((te.user_id = s.id) AND (te.deleted_at IS NULL) AND (te.entry_date >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)))) AS hours_logged_this_month,
    ( SELECT count(*) AS count
           FROM pm.task t
          WHERE ((t.assigned_to_id = s.id) AND (t.deleted_at IS NULL) AND ((t.status)::text <> ALL (ARRAY[('Completed'::character varying)::text, ('Logged'::character varying)::text])) AND (t.due_date < CURRENT_DATE))) AS overdue_tasks_count
   FROM application."user" s
  WHERE ((deleted_at IS NULL) AND (is_active = true));


--
-- Name: VIEW resource_workload_vw; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON VIEW pm.resource_workload_vw IS 'Aggregated resource workload view for capacity planning';


--
-- Name: task_activity; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.task_activity (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    activity_type character varying(50) NOT NULL,
    field_changed character varying(100),
    old_value text,
    new_value text,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    CONSTRAINT task_activity_activity_type_check CHECK (((activity_type)::text = ANY (ARRAY[('Created'::character varying)::text, ('Updated'::character varying)::text, ('Deleted'::character varying)::text, ('Restored'::character varying)::text, ('StatusChanged'::character varying)::text, ('PriorityChanged'::character varying)::text, ('AssigneeAdded'::character varying)::text, ('AssigneeRemoved'::character varying)::text, ('DueDateChanged'::character varying)::text, ('StartDateChanged'::character varying)::text, ('ProgressChanged'::character varying)::text, ('CommentAdded'::character varying)::text, ('CommentEdited'::character varying)::text, ('CommentDeleted'::character varying)::text, ('DependencyAdded'::character varying)::text, ('DependencyRemoved'::character varying)::text, ('SubtaskAdded'::character varying)::text, ('SubtaskRemoved'::character varying)::text, ('AttachmentAdded'::character varying)::text, ('AttachmentRemoved'::character varying)::text, ('Moved'::character varying)::text, ('TimeLogged'::character varying)::text])))
);


--
-- Name: TABLE task_activity; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.task_activity IS 'Activity log for task changes - read-only audit trail';


--
-- Name: COLUMN task_activity.activity_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_activity.activity_type IS 'Type of activity that occurred';


--
-- Name: COLUMN task_activity.field_changed; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_activity.field_changed IS 'Name of field that was changed (for Updates)';


--
-- Name: COLUMN task_activity.old_value; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_activity.old_value IS 'Previous value (for tracking changes)';


--
-- Name: COLUMN task_activity.new_value; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_activity.new_value IS 'New value (for tracking changes)';


--
-- Name: COLUMN task_activity.description; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_activity.description IS 'Human-readable description of the activity';


--
-- Name: task_code_seq; Type: SEQUENCE; Schema: pm; Owner: -
--

CREATE SEQUENCE pm.task_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: task_comment; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.task_comment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    parent_comment_id uuid,
    content text NOT NULL,
    mentions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE task_comment; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.task_comment IS 'Comments and discussions on tasks';


--
-- Name: COLUMN task_comment.parent_comment_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_comment.parent_comment_id IS 'Self-referential FK for threaded replies';


--
-- Name: COLUMN task_comment.content; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_comment.content IS 'Comment text content (may include markdown)';


--
-- Name: COLUMN task_comment.mentions; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_comment.mentions IS 'JSON array of user IDs mentioned with @, e.g., ["uuid1", "uuid2"]';


--
-- Name: task_dependency; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.task_dependency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    predecessor_task_id uuid NOT NULL,
    successor_task_id uuid NOT NULL,
    dependency_type character varying(10) DEFAULT 'FS'::character varying NOT NULL,
    lag_days integer DEFAULT 0,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_no_self_dependency CHECK ((predecessor_task_id <> successor_task_id)),
    CONSTRAINT task_dependency_dependency_type_check CHECK (((dependency_type)::text = ANY (ARRAY[('FS'::character varying)::text, ('SS'::character varying)::text, ('FF'::character varying)::text, ('SF'::character varying)::text])))
);


--
-- Name: TABLE task_dependency; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.task_dependency IS 'Task dependencies for Gantt chart scheduling';


--
-- Name: COLUMN task_dependency.dependency_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_dependency.dependency_type IS 'FS=Finish-to-Start, SS=Start-to-Start, FF=Finish-to-Finish, SF=Start-to-Finish';


--
-- Name: COLUMN task_dependency.lag_days; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_dependency.lag_days IS 'Number of days delay between linked tasks (can be negative for lead)';


--
-- Name: task_gantt_vw; Type: VIEW; Schema: pm; Owner: -
--

CREATE VIEW pm.task_gantt_vw AS
 SELECT t.id,
    t.task_code,
    t.name,
    t.description,
    t.project_id,
    t.parent_task_id,
    t.status,
    t.priority,
    t.task_type,
    t.start_date,
    t.due_date,
    t.progress_percent,
    t.estimated_hours,
    t.actual_hours,
    t.sort_order,
    t.assigned_to_id,
    t.is_active,
    t.created_at,
    t.created_by,
    p.name AS project_name,
    p.project_code,
    s.first_name AS assignee_first_name,
    s.last_name AS assignee_last_name,
    s.email AS assignee_email,
    pt.name AS parent_task_name,
    pt.task_code AS parent_task_code,
    ( SELECT COALESCE(json_agg(json_build_object('id', td.id, 'predecessorTaskId', td.predecessor_task_id, 'predecessorTaskName', pred.name, 'predecessorTaskCode', pred.task_code, 'dependencyType', td.dependency_type, 'lagDays', td.lag_days)), '[]'::json) AS "coalesce"
           FROM (pm.task_dependency td
             JOIN pm.task pred ON ((td.predecessor_task_id = pred.id)))
          WHERE ((td.successor_task_id = t.id) AND (td.deleted_at IS NULL))) AS dependencies,
    ( SELECT count(*) AS count
           FROM pm.task st
          WHERE ((st.parent_task_id = t.id) AND (st.deleted_at IS NULL))) AS subtask_count,
    ( SELECT count(*) AS count
           FROM pm.task st
          WHERE ((st.parent_task_id = t.id) AND (st.deleted_at IS NULL) AND ((st.status)::text = 'Completed'::text))) AS completed_subtask_count,
    ( SELECT COALESCE(json_agg(json_build_object('id', ta.id, 'userId', ta.user_id, 'firstName', tas.first_name, 'lastName', tas.last_name, 'role', ta.assignee_role)), '[]'::json) AS "coalesce"
           FROM (pm.task_assignee ta
             JOIN application."user" tas ON ((ta.user_id = tas.id)))
          WHERE ((ta.task_id = t.id) AND (ta.deleted_at IS NULL))) AS assignees
   FROM (((pm.task t
     LEFT JOIN pm.project p ON ((t.project_id = p.id)))
     LEFT JOIN application."user" s ON ((t.assigned_to_id = s.id)))
     LEFT JOIN pm.task pt ON ((t.parent_task_id = pt.id)))
  WHERE (t.deleted_at IS NULL);


--
-- Name: VIEW task_gantt_vw; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON VIEW pm.task_gantt_vw IS 'Aggregated task view for Gantt chart with dependencies and assignees as JSON';


--
-- Name: bin_management; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.bin_management (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    location_id uuid,
    bin_code character varying(225) NOT NULL,
    aisle character varying(255),
    rack character varying(255),
    capacity integer,
    unit_of_measure_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: company; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.company (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_code character varying(50) DEFAULT sc.generate_vendor_code(),
    name character varying(255) NOT NULL,
    contact_name character varying(100),
    phone_number character varying(20),
    alternate_phone character varying(20),
    website text,
    tax_id character varying(50),
    currency_code character(3),
    quality_score integer DEFAULT 0,
    category character varying(100),
    payment_term_id uuid,
    logo_url text,
    notes text,
    total_orders integer DEFAULT 0,
    total_spent double precision DEFAULT 0,
    avg_order_value double precision DEFAULT 0,
    on_time_delivery_rate double precision DEFAULT 0,
    member_since timestamp with time zone,
    last_activity_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    email character varying(255),
    currency_id uuid,
    company_code character varying(50) DEFAULT sc.generate_company_code(),
    customer_code character varying(50) DEFAULT sc.generate_customer_code(),
    department character varying(100),
    is_customer boolean,
    is_partner boolean,
    is_vendor boolean,
    partner_code character varying(50) DEFAULT sc.generate_partner_code(),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    pan_number character varying(10),
    is_msme_certified boolean,
    CONSTRAINT company_pan_check CHECK (((is_vendor = true) OR (pan_number IS NULL))),
    CONSTRAINT company_msme_check CHECK (((is_vendor = true) OR (is_msme_certified IS NULL)))
);


--
-- Name: company_address; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.company_address (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    address_id uuid NOT NULL,
    address_type character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: company_bank_account; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.company_bank_account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    bank_account_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: company_code_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.company_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_contact; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.company_contact (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    contact_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: company_part; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.company_part (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    part_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    currency_id uuid,
    is_preferred boolean DEFAULT false,
    lead_time_days integer,
    manufacturer_part_number character varying(255),
    min_order_quantity integer,
    notes text,
    order_multiple integer,
    unit_price numeric(18,4),
    valid_from date,
    valid_to date,
    vendor_part_number character varying(255)
);


--
-- Name: COLUMN company_part.is_preferred; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.company_part.is_preferred IS 'Preferred vendor for this part';


--
-- Name: COLUMN company_part.lead_time_days; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.company_part.lead_time_days IS 'Expected delivery lead time in days';


--
-- Name: COLUMN company_part.manufacturer_part_number; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.company_part.manufacturer_part_number IS 'Original manufacturer part number';


--
-- Name: COLUMN company_part.min_order_quantity; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.company_part.min_order_quantity IS 'Minimum order quantity required';


--
-- Name: COLUMN company_part.order_multiple; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.company_part.order_multiple IS 'Order must be in multiples of this quantity';


--
-- Name: COLUMN company_part.unit_price; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.company_part.unit_price IS 'Vendor price per unit';


--
-- Name: COLUMN company_part.valid_from; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.company_part.valid_from IS 'Pricing valid from date';


--
-- Name: COLUMN company_part.valid_to; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.company_part.valid_to IS 'Pricing valid until date';


--
-- Name: COLUMN company_part.vendor_part_number; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.company_part.vendor_part_number IS 'Vendor catalog/SKU number';


--
-- Name: company_with_organization_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.company_with_organization_vw AS
 SELECT c.id,
    c.name,
    c.is_active,
    c.created_at,
    c.created_by,
    c.updated_at,
    c.updated_by,
    'Company'::text AS entity_type
   FROM sc.company c
UNION ALL
 SELECT o.id,
    o.name,
    o.is_active,
    o.created_at,
    o.created_by,
    o.updated_at,
    o.updated_by,
    'Organization'::text AS entity_type
   FROM application.organization o
  WHERE (o.deleted_by IS NULL);


--
-- Name: customer_code_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.customer_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_receipt_note; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.goods_receipt_note (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    grn_number character varying(255) DEFAULT sc.generate_grn_number() NOT NULL,
    purchase_order_id uuid,
    received_date date NOT NULL,
    received_by_id uuid,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    vendor_reference_id uuid,
    location_id uuid NOT NULL,
    invoice_number character varying(255),
    status character varying(255) DEFAULT 'In Process'::character varying NOT NULL,
    invoice_date date,
    reference_number character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    vendor_id uuid,
    CONSTRAINT goods_receipt_note_status_check CHECK (((status)::text = ANY (ARRAY[('In Process'::character varying)::text, ('Completed'::character varying)::text, ('Partially Completed'::character varying)::text, ('Rejected'::character varying)::text, ('Quality Checked'::character varying)::text, ('Closed'::character varying)::text])))
);


--
-- Name: grn_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.grn_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    grn_id uuid NOT NULL,
    part_id uuid NOT NULL,
    received_quantity integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    tracking_method character varying(50),
    tracking_id character varying(255),
    manufacturing_date date,
    expiry_date date,
    date_code character varying(100),
    qc_status character varying(50) DEFAULT 'Pending'::character varying,
    qc_date timestamp with time zone,
    checked_by_id uuid,
    remark text,
    disposition character varying(50),
    qc_remark text,
    po_line_item_id uuid,
    hsn_code text,
    CONSTRAINT grn_line_item_disposition_check CHECK (((disposition)::text = ANY (ARRAY[('Accepted'::character varying)::text, ('Return'::character varying)::text, ('Scrap'::character varying)::text, ('Rework'::character varying)::text, ('Quarantine'::character varying)::text]))),
    CONSTRAINT grn_line_item_qc_status_check CHECK (((qc_status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Pass'::character varying)::text, ('Fail'::character varying)::text, ('Accepted'::character varying)::text]))),
    CONSTRAINT grn_line_item_tracking_method_check CHECK (((tracking_method IS NULL) OR ((tracking_method)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text]))))
);


--
-- Name: grn_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.grn_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_order; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.purchase_order (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255) DEFAULT sc.generate_purchase_order_number() NOT NULL,
    company_id uuid NOT NULL,
    project_id uuid,
    buyer_id uuid,
    supply_chain_lead_id uuid,
    requisition_id uuid,
    payment_term_id uuid,
    currency_id uuid,
    order_date date NOT NULL,
    total_amount numeric(18,4) NOT NULL,
    status character varying(255) DEFAULT 'Draft'::character varying NOT NULL,
    revision_history character varying(255),
    billing_address_id uuid NOT NULL,
    delivery_address_id uuid,
    shipping_address_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    delivery_status character varying(255) NOT NULL,
    quotation_reference_id uuid,
    approved_by character varying(255),
    approved_date timestamp with time zone,
    po_terms text,
    rejected_by character varying(255),
    rejected_date timestamp with time zone,
    po_type character varying(255),
    discount numeric(18,4),
    discount_type character varying(50),
    tax_option character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    actual_delivery_date date,
    expected_delivery_date date,
    quotation_reference_number character varying(255),
    round_off numeric(18,4),
    shipment_reference_number character varying(255),
    vendor_billing_address_id uuid,
    vendor_billing_contact_id uuid,
    customer_instructions text,
    delivery_terms text,
    description text,
    terms_and_conditions text,
    department_id uuid,
    CONSTRAINT chk_purchase_order_status CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Issued'::character varying)::text, ('Rejected'::character varying)::text, ('Partially Delivered'::character varying)::text, ('Delivered'::character varying)::text, ('Closed'::character varying)::text, ('Cancelled'::character varying)::text, ('Billed'::character varying)::text, ('Partially Billed'::character varying)::text])))
);


--
-- Name: grn_with_user_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.grn_with_user_vw AS
 SELECT grn.id AS grn_id,
    grn.grn_number,
    grn.purchase_order_id,
    grn.received_date,
    grn.received_by_id,
    grn.location_id,
    (((COALESCE(u.first_name, ''::character varying))::text || ' '::text) || (COALESCE(u.last_name, ''::character varying))::text) AS received_by_full_name,
    lower((u.email)::text) AS received_by_email,
    grn.description,
    grn.reference_number,
    grn.invoice_number,
    grn.invoice_date,
    grn.vendor_reference_id,
    grn.status,
    grn.vendor_id,
    grn.is_active,
    grn.created_at,
    grn.created_by,
    grn.updated_at,
    grn.updated_by,
    po.id AS po_id,
    po.number AS po_number,
    po.company_id,
    po.project_id,
    po.buyer_id,
    po.supply_chain_lead_id,
    po.requisition_id,
    po.payment_term_id,
    po.currency_id,
    po.order_date,
    po.actual_delivery_date AS delivery_date,
    po.expected_delivery_date,
    pt.name AS payment_term_name,
    pt.due_days AS payment_term_due_days,
        CASE
            WHEN (pt.id IS NULL) THEN NULL::date
            WHEN ((pt.name)::text ~~* '%po issued%'::text) THEN po.order_date
            ELSE (po.expected_delivery_date + COALESCE(pt.due_days, 0))
        END AS expected_payment_date,
    po.total_amount,
    po.status AS po_status,
    po.revision_history,
    po.billing_address_id,
    po.delivery_address_id,
    po.shipping_address_id,
    po.delivery_status,
    po.quotation_reference_id,
    po.approved_by,
    po.approved_date,
    loc.number AS location_number,
    loc.name AS location_name,
    vendor.vendor_code,
    vendor.name AS vendor_name
   FROM (((((sc.goods_receipt_note grn
     LEFT JOIN application."user" u ON ((((grn.received_by_id = u.id) OR (lower((grn.created_by)::text) = lower((u.email)::text))) AND (u.deleted_by IS NULL))))
     LEFT JOIN sc.purchase_order po ON ((grn.purchase_order_id = po.id)))
     LEFT JOIN sc.payment_term pt ON ((po.payment_term_id = pt.id)))
     LEFT JOIN mes.location loc ON ((grn.location_id = loc.id)))
     LEFT JOIN sc.company vendor ON ((grn.vendor_id = vendor.id)))
  WHERE (grn.deleted_by IS NULL);


--
-- Name: grns_by_purchase_order_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.grns_by_purchase_order_vw AS
SELECT
    NULL::uuid AS grn_id,
    NULL::character varying(255) AS grn_number,
    NULL::uuid AS purchase_order_id,
    NULL::date AS received_date,
    NULL::uuid AS received_by_id,
    NULL::text AS received_by_full_name,
    NULL::character varying(255) AS received_by_email,
    NULL::uuid AS location_id,
    NULL::character varying(255) AS location_number,
    NULL::character varying(255) AS location_name,
    NULL::text AS description,
    NULL::character varying(255) AS reference_number,
    NULL::character varying(255) AS invoice_number,
    NULL::date AS invoice_date,
    NULL::uuid AS vendor_reference_id,
    NULL::character varying(255) AS status,
    NULL::uuid AS vendor_id,
    NULL::character varying(50) AS vendor_code,
    NULL::character varying(255) AS vendor_name,
    NULL::boolean AS is_active,
    NULL::timestamp with time zone AS created_at,
    NULL::character varying(255) AS created_by,
    NULL::timestamp with time zone AS updated_at,
    NULL::character varying(255) AS updated_by,
    NULL::json AS grn_line_items;


--
-- Name: inventory_part; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.inventory_part (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_id uuid NOT NULL,
    sku_code character varying(20),
    reorder_level integer DEFAULT 0 NOT NULL,
    qty_onhand integer DEFAULT 0 NOT NULL,
    qty_reserved integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    unit_price numeric(18,4),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    consumed_quantity integer DEFAULT 0 NOT NULL,
    qty_issued integer DEFAULT 0 NOT NULL,
    qty_qc_failed integer DEFAULT 0 NOT NULL,
    qty_qc_pending integer DEFAULT 0 NOT NULL,
    qty_scrapped integer DEFAULT 0 NOT NULL,
    bin_id uuid,
    location_id uuid,
    qty_returned integer DEFAULT 0,
    qty_available integer GENERATED ALWAYS AS (((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_failed) - qty_qc_pending)) STORED,
    tracking_type character varying(20),
    hsn_code text
);


--
-- Name: inventory_goods_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.inventory_goods_vw AS
 SELECT ip.id AS inventory_id,
    ip.part_id AS inventory_part_id,
    ip.sku_code,
    ip.reorder_level,
    ip.unit_price AS inventory_unit_price,
    ip.qty_onhand,
    ip.qty_reserved,
    ip.qty_available,
    ip.consumed_quantity,
    ip.is_active AS inventory_is_active,
    ip.created_at AS inventory_created_at,
    ip.created_by AS inventory_created_by,
    ip.updated_at AS inventory_updated_at,
    ip.updated_by AS inventory_updated_by,
    p.id AS part_id,
    p.part_number,
    p.part_type_id,
    p.part_number_suffix,
    p.version,
    p.name AS part_name,
    p.description,
    p.weight,
    p.unit_price AS part_unit_price,
    p.status,
    p.manufacturing_part_number,
    p.is_serial_number_required,
    p.is_active AS part_is_active,
    p.item_type
   FROM (mes.part p
     LEFT JOIN sc.inventory_part ip ON (((ip.part_id = p.id) AND (ip.deleted_by IS NULL))))
  WHERE (((p.item_type)::text = 'Goods'::text) AND (p.deleted_by IS NULL));


--
-- Name: inventory_stock; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.inventory_stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_id uuid NOT NULL,
    location_id uuid,
    bin_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    assigned_user_id uuid,
    department character varying(255),
    project_id uuid,
    qty_consumed integer DEFAULT 0,
    qty_onhand integer DEFAULT 0 NOT NULL,
    qty_qc_failed integer DEFAULT 0,
    qty_qc_pending integer DEFAULT 0,
    qty_reserved integer DEFAULT 0,
    qty_returned integer DEFAULT 0,
    qty_scrapped integer DEFAULT 0,
    tracking_id character varying(100),
    tracking_type character varying(20),
    qty_issued integer DEFAULT 0 NOT NULL,
    unit_price numeric(18,4),
    currency character varying(255) DEFAULT 'INR'::character varying,
    conversion_rate numeric(18,4) DEFAULT 1,
    qty_available numeric(18,4) GENERATED ALWAYS AS ((((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_failed) - qty_qc_pending))::numeric(18,4)) STORED,
    issued_price numeric(18,4) GENERATED ALWAYS AS (((((qty_issued)::numeric * unit_price) * conversion_rate))::numeric(18,4)) STORED,
    reserved_price numeric(18,4) GENERATED ALWAYS AS (((((qty_reserved)::numeric * unit_price) * conversion_rate))::numeric(18,4)) STORED,
    available_price numeric(18,4) GENERATED ALWAYS AS (((((((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_pending) - qty_qc_failed))::numeric * unit_price) * conversion_rate))::numeric(18,4)) STORED,
    total_price numeric(18,4) GENERATED ALWAYS AS (((((((qty_issued)::numeric * unit_price) * conversion_rate) + (((qty_reserved)::numeric * unit_price) * conversion_rate)) + (((((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_pending) - qty_qc_failed))::numeric * unit_price) * conversion_rate)))::numeric(18,4)) STORED,
    opening_qty integer DEFAULT 0 NOT NULL,
    opening_price numeric(18,4) DEFAULT 0,
    hsn_code text,
    opening_date timestamp with time zone
);


--
-- Name: inventory_part_price_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.inventory_part_price_vw AS
 SELECT i.id AS inventory_id,
    i.id AS inventory_part_id,
    i.location_id,
    i.bin_id,
    i.sku_code,
    i.hsn_code,
    i.reorder_level,
    i.unit_price AS inventory_unit_price,
    sum(ins.qty_onhand) AS qty_onhand,
    sum(ins.qty_reserved) AS qty_reserved,
    sum(ins.qty_issued) AS qty_issued,
    sum(ins.qty_qc_pending) AS qty_qc_pending,
    sum(ins.qty_qc_failed) AS qty_qc_failed,
    sum(ins.qty_scrapped) AS qty_scrapped,
    sum(ins.qty_returned) AS qty_returned,
    sum(ins.qty_available) AS qty_available,
    sum(ins.issued_price) AS issued_price,
    sum(ins.reserved_price) AS reserved_price,
    sum(ins.available_price) AS available_price,
    sum(ins.total_price) AS total_price,
    i.consumed_quantity,
    i.is_active AS inventory_is_active,
    i.created_at AS inventory_created_at,
    i.created_by AS inventory_created_by,
    i.updated_at AS inventory_updated_at,
    i.updated_by AS inventory_updated_by,
    p.id AS part_id,
    p.part_number,
    p.part_type_id,
    p.part_number_suffix,
    p.version,
    p.name AS part_name,
    p.description,
    p.weight,
    p.unit_price AS part_unit_price,
    p.status,
    p.manufacturing_part_number,
    p.is_serial_number_required,
    p.is_active AS part_is_active
   FROM ((sc.inventory_part i
     LEFT JOIN mes.part p ON ((i.part_id = p.id)))
     LEFT JOIN sc.inventory_stock ins ON (((ins.part_id = i.part_id) AND (ins.is_active = true))))
  WHERE ((i.deleted_at IS NULL) AND (p.item_type IS NULL))
  GROUP BY i.id, i.location_id, i.bin_id, i.sku_code, i.hsn_code, i.reorder_level, i.unit_price, i.consumed_quantity, i.is_active, i.created_at, i.created_by, i.updated_at, i.updated_by, p.id, p.part_number, p.part_type_id, p.part_number_suffix, p.version, p.name, p.description, p.weight, p.unit_price, p.status, p.manufacturing_part_number, p.is_serial_number_required, p.is_active;


--
-- Name: inventory_part_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.inventory_part_vw AS
 SELECT i.id AS inventory_id,
    i.id AS inventory_part_id,
    i.location_id,
    i.bin_id,
    i.sku_code,
    i.reorder_level,
    i.unit_price AS inventory_unit_price,
    i.qty_onhand,
    i.qty_reserved,
    i.qty_available,
    i.qty_issued,
    i.qty_qc_pending,
    i.qty_qc_failed,
    i.qty_scrapped,
    i.consumed_quantity,
    i.qty_returned,
    i.is_active AS inventory_is_active,
    i.created_at AS inventory_created_at,
    i.created_by AS inventory_created_by,
    i.updated_at AS inventory_updated_at,
    i.updated_by AS inventory_updated_by,
    p.id AS part_id,
    p.part_number,
    p.part_type_id,
    p.part_number_suffix,
    p.version,
    p.name AS part_name,
    p.description,
    p.weight,
    p.unit_price AS part_unit_price,
    p.status,
    p.manufacturing_part_number,
    p.is_serial_number_required,
    p.is_active AS part_is_active
   FROM (sc.inventory_part i
     LEFT JOIN mes.part p ON ((i.part_id = p.id)))
  WHERE (i.deleted_at IS NULL);


--
-- Name: inventory_services_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.inventory_services_vw AS
 SELECT ip.id AS inventory_id,
    ip.part_id AS inventory_part_id,
    ip.sku_code,
    ip.reorder_level,
    ip.unit_price AS inventory_unit_price,
    ip.qty_onhand,
    ip.qty_reserved,
    ip.qty_available,
    ip.consumed_quantity,
    ip.is_active AS inventory_is_active,
    ip.created_at AS inventory_created_at,
    ip.created_by AS inventory_created_by,
    ip.updated_at AS inventory_updated_at,
    ip.updated_by AS inventory_updated_by,
    p.id AS part_id,
    p.part_number,
    p.part_type_id,
    p.part_number_suffix,
    p.version,
    p.name AS part_name,
    p.description,
    p.weight,
    p.unit_price AS part_unit_price,
    p.status,
    p.manufacturing_part_number,
    p.is_serial_number_required,
    p.is_active AS part_is_active,
    p.item_type
   FROM (mes.part p
     LEFT JOIN sc.inventory_part ip ON (((ip.part_id = p.id) AND (ip.deleted_by IS NULL))))
  WHERE (((p.item_type)::text = 'Services'::text) AND (p.deleted_by IS NULL));


--
-- Name: inventory_transaction; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.inventory_transaction (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_id uuid NOT NULL,
    from_location_id uuid,
    transaction_type character varying(255) NOT NULL,
    transacted_quantity integer NOT NULL,
    reference_type character varying(255),
    reference_id uuid,
    transaction_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    to_location_id uuid,
    current_quantity integer,
    previous_quantity integer,
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    tracking_id character varying(255),
    tracking_type character varying(50),
    assigned_user_id uuid,
    department character varying(255),
    project_id uuid,
    CONSTRAINT inventory_transaction_tracking_type_check CHECK (((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text]))),
    CONSTRAINT inventory_transaction_transaction_type_check CHECK (((transaction_type)::text = ANY (ARRAY['Received'::text, 'OnOrder'::text, 'Consumed'::text, 'Adjustment'::text, 'Returned'::text, 'Reserved'::text, 'Defective'::text, 'OnHold'::text, 'Transfer'::text, 'QC Failed'::text, 'Issued'::text])))
);


--
-- Name: inventory_transaction_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.inventory_transaction_vw AS
 SELECT it.id,
    it.part_id,
    p.part_number,
    p.name AS part_name,
    p.part_type_id,
    p.status AS part_status,
    p.item_type,
    it.transaction_type,
    it.current_quantity,
    it.previous_quantity,
    it.transacted_quantity,
    it.reference_type,
    it.reference_id,
    COALESCE(grn.reference_number, po.number) AS reference_number,
    it.transaction_date,
    it.notes,
    it.from_location_id,
    fl.name AS from_location_name,
    fl.number AS from_location_number,
    it.to_location_id,
    tl.name AS to_location_name,
    tl.number AS to_location_number,
    it.created_at,
    it.created_by,
    (((cb.first_name)::text || ' '::text) || (COALESCE(cb.last_name, ''::character varying))::text) AS created_by_full_name,
    it.updated_at,
    it.updated_by
   FROM ((((((sc.inventory_transaction it
     LEFT JOIN mes.part p ON (((it.part_id = p.id) AND (p.deleted_by IS NULL))))
     LEFT JOIN mes.location fl ON ((it.from_location_id = fl.id)))
     LEFT JOIN mes.location tl ON ((it.to_location_id = tl.id)))
     LEFT JOIN sc.goods_receipt_note grn ON ((((it.reference_type)::text = 'GRN'::text) AND (it.reference_id = grn.id) AND (grn.is_active = true) AND (grn.deleted_by IS NULL))))
     LEFT JOIN sc.purchase_order po ON ((((it.reference_type)::text = 'PO'::text) AND (it.reference_id = po.id) AND (po.is_active = true) AND (po.deleted_by IS NULL))))
     LEFT JOIN application."user" cb ON (((it.created_by)::text = (cb.email)::text)))
  WHERE (it.deleted_by IS NULL);


--
-- Name: inventory_stock_ledger_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.inventory_stock_ledger_vw AS
 SELECT it.part_id,
    p.part_number,
    p.name AS part_name,
    it.transaction_date,
    it.transaction_type,
    it.reference_type,
    it.transacted_quantity,
        CASE
            WHEN (((it.reference_type)::text = 'GRN'::text) AND ((it.transaction_type)::text <> 'QC Failed'::text)) THEN 'purchase'::text
            WHEN (((it.reference_type)::text = 'StockMovement'::text) AND ((it.transaction_type)::text = ANY (ARRAY['Issued'::text, 'Consumed'::text]))) THEN 'consumption'::text
            ELSE NULL::text
        END AS movement_type,
        CASE
            WHEN (((it.reference_type)::text = 'GRN'::text) AND ((it.transaction_type)::text <> 'QC Failed'::text)) THEN it.transacted_quantity
            WHEN (((it.reference_type)::text = 'StockMovement'::text) AND ((it.transaction_type)::text = ANY (ARRAY['Issued'::text, 'Consumed'::text]))) THEN (- it.transacted_quantity)
            ELSE 0
        END AS qty_delta
   FROM (sc.inventory_transaction it
     JOIN mes.part p ON (((it.part_id = p.id) AND (p.deleted_by IS NULL))))
  WHERE ((it.deleted_by IS NULL) AND ((it.notes IS NULL) OR (it.notes !~~ '%pending Quality Check%'::text)));


--
-- Name: inventory_stock_report(date, date, uuid, date); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.inventory_stock_report(p_start date, p_end date, p_part_id uuid DEFAULT NULL::uuid, p_anchor date DEFAULT '2026-04-01'::date) RETURNS TABLE(part_no text, part_name text, opening_qty numeric, purchase_qty numeric, consumption_qty numeric, closing_qty numeric, consumption_amount numeric, closing_balance numeric, unit_price numeric, opening_balance numeric)
    LANGUAGE sql STABLE
    AS $$
    WITH seed AS (
        SELECT
            s.part_id,
            COALESCE(SUM(s.opening_qty), 0) AS seed_qty
        FROM sc.inventory_stock s
        WHERE s.deleted_by IS NULL
          AND (p_part_id IS NULL OR s.part_id = p_part_id)
        GROUP BY s.part_id
    ),
    movement AS (
        SELECT
            l.part_id,
            -- Net movement from the anchor up to (excluding) p_start: the carry-in
            -- that turns the frozen seed into this window's opening balance.
            COALESCE(SUM(l.transacted_quantity) FILTER (
                WHERE l.movement_type = 'purchase'
                  AND l.transaction_date >= p_anchor
                  AND l.transaction_date <  p_start
            ), 0) AS prior_purchase,
            COALESCE(SUM(l.transacted_quantity) FILTER (
                WHERE l.movement_type = 'consumption'
                  AND l.transaction_date >= p_anchor
                  AND l.transaction_date <  p_start
            ), 0) AS prior_consumption,
            -- Movement inside the reporting window [p_start, p_end] (end inclusive).
            COALESCE(SUM(l.transacted_quantity) FILTER (
                WHERE l.movement_type = 'purchase'
                  AND l.transaction_date >= p_start
                  AND l.transaction_date <  p_end + INTERVAL '1 day'
            ), 0) AS purchase_qty,
            COALESCE(SUM(l.transacted_quantity) FILTER (
                WHERE l.movement_type = 'consumption'
                  AND l.transaction_date >= p_start
                  AND l.transaction_date <  p_end + INTERVAL '1 day'
            ), 0) AS consumption_qty
        FROM sc.inventory_stock_ledger_vw l
        WHERE (p_part_id IS NULL OR l.part_id = p_part_id)
          AND l.transaction_date < p_end + INTERVAL '1 day'
        GROUP BY l.part_id
    ),
    agg AS (
        SELECT
            COALESCE(s.part_id, m.part_id) AS part_id,
            -- opening = frozen seed + net carry-in from anchor to p_start-1
            COALESCE(s.seed_qty, 0)
                + COALESCE(m.prior_purchase, 0)
                - COALESCE(m.prior_consumption, 0) AS opening_qty,
            COALESCE(m.purchase_qty, 0)    AS purchase_qty,
            COALESCE(m.consumption_qty, 0) AS consumption_qty
        FROM seed s
        FULL OUTER JOIN movement m ON m.part_id = s.part_id
    ),
    priced AS (
        -- ip.* is qualified deliberately: unit_price is also a RETURNS TABLE output
        -- column, so an unqualified `unit_price` here would collide with that
        -- OUT parameter rather than read sc.inventory_part.
        SELECT ip.part_id, MAX(ip.unit_price) AS unit_price
        FROM sc.inventory_part ip
        WHERE ip.is_active = TRUE
          AND ip.deleted_by IS NULL
        GROUP BY ip.part_id
    )
    SELECT
        p.part_number AS part_no,
        p.name        AS part_name,
        a.opening_qty,
        a.purchase_qty,
        a.consumption_qty,
        (a.opening_qty + a.purchase_qty - a.consumption_qty) AS closing_qty,
        ROUND(a.consumption_qty * COALESCE(pr.unit_price, 0), 2) AS consumption_amount,
        ROUND((a.opening_qty + a.purchase_qty - a.consumption_qty)
              * COALESCE(pr.unit_price, 0), 2) AS closing_balance,
        -- Per-part current price (nullable: blank means no price on file, distinct
        -- from a genuine 0). The value columns above coalesce; a raw price does not.
        pr.unit_price AS unit_price,
        -- Opening Balance mirrors Closing Balance / Consumption Amount: qty x price.
        ROUND(a.opening_qty * COALESCE(pr.unit_price, 0), 2) AS opening_balance
    FROM agg a
    JOIN mes.part p ON p.id = a.part_id AND p.deleted_by IS NULL
    LEFT JOIN priced pr ON pr.part_id = a.part_id
    ORDER BY p.part_number;
$$;


--
-- Name: stock_movement; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.stock_movement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    movement_number character varying(255) DEFAULT sc.generate_stock_movement_number() NOT NULL,
    movement_type character varying(50) NOT NULL,
    movement_reason character varying(100),
    movement_date date NOT NULL,
    from_location_id uuid,
    from_bin_id uuid,
    to_location_id uuid,
    to_bin_id uuid,
    performed_by_id uuid,
    work_order_id uuid,
    reference_number character varying(255),
    notes text,
    status character varying(50) DEFAULT 'Completed'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    expected_return_date date,
    project_date date,
    department character varying(255),
    project_id uuid,
    assigned_user_id uuid,
    sub_project_id uuid,
    company_id uuid,
    issue_purpose character varying(255),
    classification character varying(50),
    platform_payload_sdr character varying(100),
    sub_system character varying(100)
);


--
-- Name: TABLE stock_movement; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.stock_movement IS 'Stock movement header for Transfer, Adjustment, and Issue operations';


--
-- Name: COLUMN stock_movement.movement_type; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.stock_movement.movement_type IS 'Transfer, Adjustment, or Issue';


--
-- Name: COLUMN stock_movement.movement_reason; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.stock_movement.movement_reason IS 'Reason code for the movement';


--
-- Name: COLUMN stock_movement.status; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.stock_movement.status IS 'Completed or Cancelled';


--
-- Name: stock_movement_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.stock_movement_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stock_movement_id uuid NOT NULL,
    part_id uuid NOT NULL,
    quantity integer NOT NULL,
    tracking_type character varying(50),
    tracking_id character varying(255),
    reason character varying(255),
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    adjustment_type character varying(50),
    CONSTRAINT stock_movement_line_item_adjustment_type_check CHECK (((adjustment_type)::text = ANY (ARRAY[('Increase'::character varying)::text, ('Decrease'::character varying)::text]))),
    CONSTRAINT stock_movement_line_item_quantity_check CHECK ((quantity > 0))
);


--
-- Name: TABLE stock_movement_line_item; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.stock_movement_line_item IS 'Line items for stock movements, one per part per movement';


--
-- Name: COLUMN stock_movement_line_item.tracking_type; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.stock_movement_line_item.tracking_type IS 'Serial, Batch, or None';


--
-- Name: issue_history_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.issue_history_vw AS
 SELECT smli.id AS stock_movement_line_item_id,
    smli.part_id,
    sm.movement_number,
    sm.movement_date AS issued_date,
    sm.department,
    NULLIF(concat(u.first_name, ' ', u.last_name), ' '::text) AS responsible_person,
    smli.quantity AS issued_quantity,
    b.bin_code AS issued_bin,
    p.name AS project_name,
    sm.movement_type,
    smli.created_by,
    smli.tracking_id
   FROM ((((sc.stock_movement_line_item smli
     JOIN sc.stock_movement sm ON ((smli.stock_movement_id = sm.id)))
     LEFT JOIN application."user" u ON ((sm.performed_by_id = u.id)))
     LEFT JOIN sc.bin_management b ON ((sm.from_bin_id = b.id)))
     LEFT JOIN pm.project p ON ((sm.project_id = p.id)))
  WHERE (((sm.movement_type)::text = 'Issued'::text) AND (sm.deleted_by IS NULL) AND (smli.deleted_by IS NULL));


--
-- Name: item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(225) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    item_type character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: partner_code_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.partner_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_term; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.payment_term (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(100),
    due_days integer NOT NULL,
    discount_days integer,
    discount_percent numeric(5,2),
    payment_terms text,
    payment_term_type character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT payment_term_discount_days_check CHECK ((discount_days >= 0)),
    CONSTRAINT payment_term_discount_percent_check CHECK (((discount_percent >= (0)::numeric) AND (discount_percent <= (100)::numeric))),
    CONSTRAINT payment_term_due_days_check CHECK ((due_days >= 0))
);


--
-- Name: po_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.po_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_id uuid NOT NULL,
    part_id uuid NOT NULL,
    ordered_quantity integer NOT NULL,
    received_quantity integer,
    pending_quantity integer,
    unit_price numeric(18,4),
    total_price numeric(18,4),
    tax numeric(18,4),
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    hsn character varying(255),
    tax_type character varying(50),
    discount numeric(18,4),
    discount_type character varying(50),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    actual_delivery_date date,
    expected_delivery_date date,
    conversion_rate numeric(18,4) DEFAULT 1,
    currency_id uuid,
    unit_price_in_inr numeric(18,4) GENERATED ALWAYS AS ((((unit_price * conversion_rate))::numeric(18,4))) STORED,
    total_amount_in_inr numeric(18,4) GENERATED ALWAYS AS ((((((ordered_quantity)::numeric * unit_price) * conversion_rate))::numeric(18,4))) STORED
);


--
-- Name: po_requisition_mapping; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.po_requisition_mapping (
    req_number character varying(255),
    po_number character varying(255),
    purchase_order_id uuid,
    requisition_id uuid
);


--
-- Name: purchase_history_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.purchase_history_vw AS
 SELECT gli.id AS grn_line_item_id,
    gli.part_id,
    grn.grn_number,
    po.number AS po_number,
    grn.received_date,
    gli.received_quantity,
    c.name AS vendor_name,
    p.name AS project_name,
    NULLIF(concat(u.first_name, ' ', u.last_name), ' '::text) AS received_by,
    gli.tracking_id,
    gli.created_by
   FROM (((((sc.grn_line_item gli
     JOIN sc.goods_receipt_note grn ON ((gli.grn_id = grn.id)))
     LEFT JOIN sc.purchase_order po ON ((grn.purchase_order_id = po.id)))
     LEFT JOIN sc.company c ON ((po.company_id = c.id)))
     LEFT JOIN pm.project p ON ((po.project_id = p.id)))
     LEFT JOIN application."user" u ON ((grn.received_by_id = u.id)))
  WHERE ((grn.deleted_by IS NULL) AND (gli.deleted_by IS NULL));


--
-- Name: purchase_order_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.purchase_order_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: requisition; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.requisition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    req_number character varying(255) DEFAULT sc.generate_req_number() NOT NULL,
    requested_by_id uuid NOT NULL,
    request_date date NOT NULL,
    priority character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'Draft'::character varying NOT NULL,
    total_estimated_amount numeric(18,4),
    approved_by character varying(255),
    approved_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    title character varying(255),
    required_by_date date,
    justification text,
    rejected_by character varying(255),
    rejected_date timestamp with time zone,
    approver_comment text,
    project_id uuid,
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    department_id uuid,
    CONSTRAINT chk_requisition_status CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Processing'::character varying)::text, ('PoCreated'::character varying)::text, ('Closed'::character varying)::text, ('Cancelled'::character varying)::text])))
);


--
-- Name: purchase_orders_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.purchase_orders_vw AS
 SELECT po.id,
    po.number,
    c.name AS vendor_name,
    c.vendor_code,
    c.contact_name AS vendor_contact,
    c.phone_number AS vendor_phone,
    po.order_date,
    po.expected_delivery_date AS delivery_date,
    po.status,
    po.total_amount,
    po.approved_by,
    po.approved_date,
    po.created_by,
    po.created_at,
    po.description,
    po.customer_instructions,
    po.delivery_terms,
    po.terms_and_conditions,
    pt.name AS payment_term,
    pr.project_code,
    pr.name AS project_name,
    bill_addr.city AS billing_city,
    ship_addr.city AS shipping_city,
    req.req_number AS requisition_number,
    po.department_id,
    d.name AS department_name,
    (((u.first_name)::text || ' '::text) || (COALESCE(u.last_name, ''::character varying))::text) AS manager_full_name
   FROM ((((((((sc.purchase_order po
     LEFT JOIN sc.company c ON (((c.id = po.company_id) AND (c.deleted_by IS NULL))))
     LEFT JOIN sc.payment_term pt ON ((pt.id = po.payment_term_id)))
     LEFT JOIN pm.project pr ON ((pr.id = po.project_id)))
     LEFT JOIN common.address bill_addr ON ((bill_addr.id = po.billing_address_id)))
     LEFT JOIN common.address ship_addr ON ((ship_addr.id = po.shipping_address_id)))
     LEFT JOIN sc.requisition req ON (((req.id = po.requisition_id) AND (req.deleted_by IS NULL))))
     LEFT JOIN common.department d ON ((po.department_id = d.id)))
     LEFT JOIN application."user" u ON ((d.head_of_department_user_id = u.id)))
  WHERE ((po.is_active = true) AND (po.deleted_by IS NULL));


--
-- Name: req_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.req_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: requisition_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.requisition_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requisition_id uuid NOT NULL,
    part_id uuid NOT NULL,
    quantity integer NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: requisitions_with_user_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.requisitions_with_user_vw AS
 SELECT r.id,
    r.req_number,
    r.requested_by_id,
    r.title,
    r.project_id,
    r.request_date,
    r.required_by_date,
    r.justification,
    r.priority,
    r.status,
    r.total_estimated_amount,
    r.created_by,
    r.created_at,
    r.approved_by,
    r.approved_date,
    r.rejected_by,
    r.rejected_date,
    r.approver_comment,
    rb.id AS user_id,
    (((rb.first_name)::text || ' '::text) || (COALESCE(rb.last_name, ''::character varying))::text) AS user_full_name,
    rb.email AS user_email,
    po.id AS po_id,
    po.number AS po_number,
    po.status AS po_status,
    dept.id AS department_id,
    dept.name AS department_name,
    (((mgr.first_name)::text || ' '::text) || (COALESCE(mgr.last_name, ''::character varying))::text) AS manager_full_name
   FROM ((((sc.requisition r
     JOIN application."user" rb ON ((rb.id = r.requested_by_id)))
     LEFT JOIN common.department dept ON ((r.department_id = dept.id)))
     LEFT JOIN application."user" mgr ON (((dept.head_of_department_user_id = mgr.id) AND (mgr.deleted_by IS NULL))))
     LEFT JOIN LATERAL ( SELECT purchase_order.id,
            purchase_order.number,
            purchase_order.status
           FROM sc.purchase_order
          WHERE ((purchase_order.requisition_id = r.id) AND (purchase_order.deleted_by IS NULL) AND ((purchase_order.status)::text <> ALL (ARRAY[('Cancelled'::character varying)::text, ('Rejected'::character varying)::text])))
          ORDER BY purchase_order.created_at DESC
         LIMIT 1) po ON (true))
  WHERE (r.deleted_by IS NULL);


--
-- Name: scrap_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.scrap_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scrap_request_id uuid NOT NULL,
    part_id uuid NOT NULL,
    tracking_type character varying(50),
    tracking_id character varying(255),
    scrap_quantity integer NOT NULL,
    reason text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255),
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT scrap_line_item_tracking_type_check CHECK (((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text])))
);


--
-- Name: scrap_number_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.scrap_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scrap_request; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.scrap_request (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scrap_number character varying(255) DEFAULT sc.generate_scrap_number() NOT NULL,
    location_id uuid,
    raised_by_id uuid,
    scrap_date date,
    reason text,
    po_id uuid,
    grn_id uuid,
    wo_id uuid,
    status character varying(50) DEFAULT 'Draft'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255),
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    approved_by character varying(255),
    approved_date timestamp with time zone,
    rejected_by character varying(255),
    rejected_date timestamp with time zone,
    CONSTRAINT scrap_request_status_check CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Disposed'::character varying)::text])))
);


--
-- Name: scrap_request_with_user_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.scrap_request_with_user_vw AS
 SELECT sr.id AS scrap_request_id,
    sr.scrap_number,
    sr.scrap_date,
    sr.reason AS scrap_reason,
    sr.status AS scrap_status,
    sr.is_active,
    sr.created_at,
    sr.created_by,
    sr.updated_at,
    sr.updated_by,
    (((rb.first_name)::text || ' '::text) || (rb.last_name)::text) AS raised_by_full_name,
    rb.email AS raised_by_email,
    loc.id AS location_id,
    loc.number AS location_number,
    loc.name AS location_name,
    po.id AS po_id,
    po.number AS po_number,
    po.order_date AS po_order_date,
    po.status AS po_status,
    grn.id AS grn_id,
    grn.grn_number,
    grn.received_date AS grn_received_date,
    grn.status AS grn_status,
    wo.id AS wo_id,
    wo.number AS work_order_number,
    wo.status AS wo_status,
    sli.id AS line_item_id,
    sli.part_id,
    sli.tracking_type,
    sli.tracking_id,
    sli.scrap_quantity,
    sli.reason AS line_item_reason
   FROM ((((((sc.scrap_request sr
     LEFT JOIN application."user" rb ON ((sr.raised_by_id = rb.id)))
     LEFT JOIN mes.location loc ON ((sr.location_id = loc.id)))
     LEFT JOIN sc.purchase_order po ON ((sr.po_id = po.id)))
     LEFT JOIN sc.goods_receipt_note grn ON ((sr.grn_id = grn.id)))
     LEFT JOIN mes.work_order wo ON ((sr.wo_id = wo.id)))
     LEFT JOIN sc.scrap_line_item sli ON (((sr.id = sli.scrap_request_id) AND (sli.deleted_by IS NULL))))
  WHERE (sr.deleted_by IS NULL);


--
-- Name: stock_movement_with_user_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.stock_movement_with_user_vw AS
 SELECT sm.id AS stock_movement_id,
    sm.movement_number,
    sm.movement_type,
    sm.status,
    sm.movement_reason,
    sm.reference_number,
    sm.notes,
    sm.movement_date,
    sm.expected_return_date,
    sm.project_date,
    sm.from_location_id,
    fl.number AS from_location_number,
    fl.name AS from_location_name,
    sm.to_location_id,
    tl.number AS to_location_number,
    tl.name AS to_location_name,
    sm.from_bin_id,
    fb.bin_code AS from_bin_code,
    fb.aisle AS from_bin_aisle,
    fb.rack AS from_bin_rack,
    sm.to_bin_id,
    tb.bin_code AS to_bin_code,
    tb.aisle AS to_bin_aisle,
    tb.rack AS to_bin_rack,
    sm.work_order_id,
    wo.number AS work_order_number,
    sm.performed_by_id,
    (((u.first_name)::text || ' '::text) || (u.last_name)::text) AS performed_by_full_name,
    u.email AS performed_by_email,
    sm.is_active,
    sm.created_at,
    sm.created_by,
    sm.updated_at,
    sm.updated_by
   FROM ((((((sc.stock_movement sm
     LEFT JOIN application."user" u ON ((sm.performed_by_id = u.id)))
     LEFT JOIN mes.location fl ON ((sm.from_location_id = fl.id)))
     LEFT JOIN mes.location tl ON ((sm.to_location_id = tl.id)))
     LEFT JOIN sc.bin_management fb ON (((sm.from_bin_id = fb.id) AND (fb.deleted_by IS NULL))))
     LEFT JOIN sc.bin_management tb ON (((sm.to_bin_id = tb.id) AND (tb.deleted_by IS NULL))))
     LEFT JOIN mes.work_order wo ON ((sm.work_order_id = wo.id)))
  WHERE (sm.deleted_by IS NULL);


--
-- Name: temp_inventory_import; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.temp_inventory_import (
    "MFG" character varying(255),
    "SUM" integer,
    "SDR" integer,
    "AVI" integer,
    "EPS" integer,
    "Cables" integer,
    "Total" integer,
    "XDL" character varying(255),
    extra text,
    part_id uuid,
    part_number character varying(255)
);


--
-- Name: temp_tracking; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.temp_tracking (
    name text,
    part_number text,
    part_type_name text,
    manufacturing_part_number text,
    tracking_type text,
    tracking_id text
);


--
-- Name: tender; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.tender (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tender_number character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'Draft'::character varying NOT NULL,
    requisition_id uuid,
    project_id uuid,
    publish_date date,
    closing_date date NOT NULL,
    approved_by character varying(255),
    approved_date timestamp with time zone,
    awarded_vendor_id uuid,
    awarded_date timestamp with time zone,
    awarded_by character varying(255),
    buyer_id uuid,
    terms text,
    payment_term_id uuid,
    currency_id uuid,
    rejected_by character varying(255),
    rejected_date timestamp with time zone,
    approver_comment text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255),
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE tender; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.tender IS 'Tender/RFQ management table for procurement';


--
-- Name: COLUMN tender.status; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.tender.status IS 'Draft, Submitted, Published, Closed, Awarded, Cancelled';


--
-- Name: tender_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.tender_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tender_id uuid NOT NULL,
    part_id uuid,
    quantity integer NOT NULL,
    unit_of_measure_id uuid,
    description text,
    specifications text,
    line_number integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255),
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE tender_line_item; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.tender_line_item IS 'Line items/parts requested in a tender';


--
-- Name: tender_quotation; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.tender_quotation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tender_id uuid NOT NULL,
    company_id uuid,
    quotation_number character varying(100),
    quotation_date date NOT NULL,
    valid_until date,
    total_amount numeric(18,4) DEFAULT 0 NOT NULL,
    currency_id uuid,
    lead_time_days integer,
    notes text,
    terms_and_conditions text,
    document_id uuid,
    is_selected boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255),
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE tender_quotation; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.tender_quotation IS 'Vendor quotation responses to tenders';


--
-- Name: COLUMN tender_quotation.is_selected; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.tender_quotation.is_selected IS 'True if this is the winning quotation';


--
-- Name: tender_quotation_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.tender_quotation_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tender_quotation_id uuid NOT NULL,
    tender_line_item_id uuid,
    unit_price numeric(18,4) DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    total_price numeric(18,4) DEFAULT 0 NOT NULL,
    lead_time_days integer,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255),
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE tender_quotation_line_item; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.tender_quotation_line_item IS 'Line item pricing in vendor quotations';


--
-- Name: tender_vendor; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.tender_vendor (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tender_id uuid NOT NULL,
    company_id uuid,
    invited_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    response_deadline date,
    status character varying(50) DEFAULT 'Invited'::character varying NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255),
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE tender_vendor; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.tender_vendor IS 'Vendors invited to respond to a tender';


--
-- Name: COLUMN tender_vendor.status; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.tender_vendor.status IS 'Invited, Responded, NoResponse, Declined';


--
-- Name: vendor_code_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.vendor_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_return_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.vendor_return_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    return_request_id uuid NOT NULL,
    part_id uuid NOT NULL,
    grn_line_item_id uuid,
    tracking_type character varying(50),
    tracking_id character varying(255),
    return_quantity integer,
    reason text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255),
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT vendor_return_line_item_tracking_type_check CHECK (((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text])))
);


--
-- Name: vendor_return_number_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.vendor_return_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_return_request; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.vendor_return_request (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    return_number character varying(255) DEFAULT sc.generate_vendor_return_number() NOT NULL,
    vendor_id uuid NOT NULL,
    po_id uuid,
    grn_id uuid,
    return_date date,
    raised_by_id uuid,
    location_id uuid,
    reason text,
    status character varying(50) DEFAULT 'Draft'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255),
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    wo_id uuid,
    approved_by character varying(255),
    approved_date timestamp with time zone,
    rejected_by character varying(255),
    rejected_date timestamp with time zone,
    CONSTRAINT vendor_return_request_status_check CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Shipped'::character varying)::text, ('Closed'::character varying)::text])))
);


--
-- Name: vendor_return_request_with_user_vw; Type: VIEW; Schema: sc; Owner: -
--

CREATE VIEW sc.vendor_return_request_with_user_vw AS
 SELECT vr.id AS vendor_return_request_id,
    vr.return_number,
    vr.return_date,
    vr.reason AS return_reason,
    vr.status AS return_status,
    vr.is_active,
    vr.created_at,
    vr.created_by,
    vr.updated_at,
    vr.updated_by,
    (((rb.first_name)::text || ' '::text) || (rb.last_name)::text) AS raised_by_full_name,
    rb.email AS raised_by_email,
    vendor.id AS vendor_id,
    vendor.name AS vendor_name,
    loc.id AS location_id,
    loc.number AS location_number,
    loc.name AS location_name,
    po.id AS po_id,
    po.number AS po_number,
    po.order_date AS po_order_date,
    po.status AS po_status,
    grn.id AS grn_id,
    grn.grn_number,
    grn.received_date AS grn_received_date,
    grn.status AS grn_status,
    wo.id AS wo_id,
    wo.number AS work_order_number,
    wo.status AS wo_status,
    vrli.id AS line_item_id,
    vrli.part_id,
    vrli.grn_line_item_id,
    vrli.tracking_type,
    vrli.tracking_id,
    vrli.return_quantity,
    vrli.reason AS line_item_reason
   FROM (((((((sc.vendor_return_request vr
     LEFT JOIN application."user" rb ON ((vr.raised_by_id = rb.id)))
     LEFT JOIN sc.company vendor ON ((vr.vendor_id = vendor.id)))
     LEFT JOIN mes.location loc ON ((vr.location_id = loc.id)))
     LEFT JOIN sc.purchase_order po ON ((vr.po_id = po.id)))
     LEFT JOIN sc.goods_receipt_note grn ON ((vr.grn_id = grn.id)))
     LEFT JOIN mes.work_order wo ON ((vr.wo_id = wo.id)))
     LEFT JOIN sc.vendor_return_line_item vrli ON (((vr.id = vrli.return_request_id) AND (vrli.deleted_by IS NULL))))
  WHERE (vr.deleted_by IS NULL);


--
-- Name: app app_number; Type: DEFAULT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.app ALTER COLUMN app_number SET DEFAULT nextval('application.app_app_number_seq'::regclass);


--
-- Name: role role_number; Type: DEFAULT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role ALTER COLUMN role_number SET DEFAULT nextval('application.role_role_number_seq'::regclass);


--
-- Name: user user_number; Type: DEFAULT; Schema: application; Owner: -
--

ALTER TABLE ONLY application."user" ALTER COLUMN user_number SET DEFAULT nextval('application.user_user_number_seq'::regclass);


--
-- Name: guide sequence; Type: DEFAULT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide ALTER COLUMN sequence SET DEFAULT nextval('mes.guide_sequence_seq'::regclass);


--
-- Name: guide number; Type: DEFAULT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide ALTER COLUMN number SET DEFAULT application.generate_alphanumeric_sequence('GD-'::character varying, currval('mes.guide_sequence_seq'::regclass));


--
-- Name: material_kit sequence; Type: DEFAULT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit ALTER COLUMN sequence SET DEFAULT nextval('mes.material_kit_sequence_seq'::regclass);


--
-- Name: material_kit number; Type: DEFAULT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit ALTER COLUMN number SET DEFAULT application.generate_alphanumeric_sequence('KIT-'::character varying, currval('mes.material_kit_sequence_seq'::regclass));


--
-- Name: product sequence; Type: DEFAULT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product ALTER COLUMN sequence SET DEFAULT nextval('mes.product_sequence_seq'::regclass);


--
-- Name: product number; Type: DEFAULT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product ALTER COLUMN number SET DEFAULT application.generate_alphanumeric_sequence('PD-'::character varying, currval('mes.product_sequence_seq'::regclass));


--
-- Name: work_package sequence; Type: DEFAULT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package ALTER COLUMN sequence SET DEFAULT nextval('mes.work_package_sequence_seq'::regclass);


--
-- Name: work_package number; Type: DEFAULT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package ALTER COLUMN number SET DEFAULT application.generate_alphanumeric_sequence('WO-'::character varying, currval('mes.work_package_sequence_seq'::regclass));


--
-- Name: app app_app_name_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.app
    ADD CONSTRAINT app_app_name_key UNIQUE (app_name);


--
-- Name: app app_app_number_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.app
    ADD CONSTRAINT app_app_number_key UNIQUE (app_number);


--
-- Name: app app_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.app
    ADD CONSTRAINT app_pkey PRIMARY KEY (id);


--
-- Name: bulk_upload bulk_upload_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.bulk_upload
    ADD CONSTRAINT bulk_upload_pkey PRIMARY KEY (id);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: employee_department employee_department_employee_id_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.employee_department
    ADD CONSTRAINT employee_department_employee_id_key UNIQUE (employee_id);


--
-- Name: feature_bit feature_bit_feature_name_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.feature_bit
    ADD CONSTRAINT feature_bit_feature_name_key UNIQUE (feature_name);


--
-- Name: feature_bit feature_bit_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.feature_bit
    ADD CONSTRAINT feature_bit_pkey PRIMARY KEY (id);


--
-- Name: issue issue_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.issue
    ADD CONSTRAINT issue_pkey PRIMARY KEY (id);


--
-- Name: option_set option_set_display_name_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.option_set
    ADD CONSTRAINT option_set_display_name_key UNIQUE (display_name);


--
-- Name: option_set option_set_name_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.option_set
    ADD CONSTRAINT option_set_name_key UNIQUE (name);


--
-- Name: option_set option_set_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.option_set
    ADD CONSTRAINT option_set_pkey PRIMARY KEY (id);


--
-- Name: organization_address organization_address_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.organization_address
    ADD CONSTRAINT organization_address_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: permission permission_name_deleted_at_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.permission
    ADD CONSTRAINT permission_name_deleted_at_key UNIQUE NULLS NOT DISTINCT (name, deleted_at);


--
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);


--
-- Name: role_filter role_filter_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role_filter
    ADD CONSTRAINT role_filter_pkey PRIMARY KEY (id);


--
-- Name: role_permission role_permission_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role_permission
    ADD CONSTRAINT role_permission_pkey PRIMARY KEY (id);


--
-- Name: role_permission role_permission_role_id_permission_deleted_at_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role_permission
    ADD CONSTRAINT role_permission_role_id_permission_deleted_at_key UNIQUE (role_id, permission, deleted_at);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: role role_role_name_app_id_deleted_at_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role
    ADD CONSTRAINT role_role_name_app_id_deleted_at_key UNIQUE (role_name, app_id, deleted_at);


--
-- Name: staff staff_email_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: customer uq_customer_tax_number; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.customer
    ADD CONSTRAINT uq_customer_tax_number UNIQUE (tax_number);


--
-- Name: user user_email_deleted_at_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application."user"
    ADD CONSTRAINT user_email_deleted_at_key UNIQUE (email, deleted_at);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (id);


--
-- Name: user user_user_number_key; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application."user"
    ADD CONSTRAINT user_user_number_key UNIQUE (user_number);


--
-- Name: additional_recipient_configuration additional_recipient_configuration_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.additional_recipient_configuration
    ADD CONSTRAINT additional_recipient_configuration_pkey PRIMARY KEY (id);


--
-- Name: address address_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (id);


--
-- Name: approval_configuration approval_configuration_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval_configuration
    ADD CONSTRAINT approval_configuration_pkey PRIMARY KEY (id);


--
-- Name: approval approval_entity_id_stage_number_approver_id_deleted_at_key; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval
    ADD CONSTRAINT approval_entity_id_stage_number_approver_id_deleted_at_key UNIQUE (entity_id, stage_number, approver_id, deleted_at);


--
-- Name: approval_log approval_log_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval_log
    ADD CONSTRAINT approval_log_pkey PRIMARY KEY (id);


--
-- Name: approval_notification_recipient approval_notification_recipient_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval_notification_recipient
    ADD CONSTRAINT approval_notification_recipient_pkey PRIMARY KEY (id);


--
-- Name: approval approval_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval
    ADD CONSTRAINT approval_pkey PRIMARY KEY (id);


--
-- Name: bank_account bank_account_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.bank_account
    ADD CONSTRAINT bank_account_pkey PRIMARY KEY (id);


--
-- Name: contact contact_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.contact
    ADD CONSTRAINT contact_pkey PRIMARY KEY (id);


--
-- Name: country country_iso2_code_key; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.country
    ADD CONSTRAINT country_iso2_code_key UNIQUE (iso2_code);


--
-- Name: country country_iso3_code_key; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.country
    ADD CONSTRAINT country_iso3_code_key UNIQUE (iso3_code);


--
-- Name: country country_name_key; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.country
    ADD CONSTRAINT country_name_key UNIQUE (name);


--
-- Name: country country_numeric_code_key; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.country
    ADD CONSTRAINT country_numeric_code_key UNIQUE (numeric_code);


--
-- Name: country country_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.country
    ADD CONSTRAINT country_pkey PRIMARY KEY (id);


--
-- Name: currency currency_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.currency
    ADD CONSTRAINT currency_pkey PRIMARY KEY (id);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: document document_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.document
    ADD CONSTRAINT document_pkey PRIMARY KEY (id);


--
-- Name: fcm_token fcm_token_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.fcm_token
    ADD CONSTRAINT fcm_token_pkey PRIMARY KEY (email, device_id);


--
-- Name: image image_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- Name: approval_configuration uq_approval_configuration_entity_type; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval_configuration
    ADD CONSTRAINT uq_approval_configuration_entity_type UNIQUE (entity_type, deleted_at);


--
-- Name: video video_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.video
    ADD CONSTRAINT video_pkey PRIMARY KEY (id);


--
-- Name: assembly_location assembly_location_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.assembly_location
    ADD CONSTRAINT assembly_location_pkey PRIMARY KEY (id);


--
-- Name: ebom ebom_part_id_child_part_id_deleted_at_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.ebom
    ADD CONSTRAINT ebom_part_id_child_part_id_deleted_at_key UNIQUE (part_id, child_part_id, deleted_at);


--
-- Name: ebom ebom_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.ebom
    ADD CONSTRAINT ebom_pkey PRIMARY KEY (id);


--
-- Name: eco_log eco_log_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_log
    ADD CONSTRAINT eco_log_pkey PRIMARY KEY (id);


--
-- Name: eco_part eco_part_eco_id_part_id_deleted_at_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_part
    ADD CONSTRAINT eco_part_eco_id_part_id_deleted_at_key UNIQUE (eco_id, part_id, deleted_at);


--
-- Name: eco_part eco_part_id_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_part
    ADD CONSTRAINT eco_part_id_pkey PRIMARY KEY (id);


--
-- Name: eco eco_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco
    ADD CONSTRAINT eco_pkey PRIMARY KEY (id);


--
-- Name: email_log email_log_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.email_log
    ADD CONSTRAINT email_log_pkey PRIMARY KEY (id);


--
-- Name: email_template email_template_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.email_template
    ADD CONSTRAINT email_template_pkey PRIMARY KEY (id);


--
-- Name: email_template email_template_template_code_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.email_template
    ADD CONSTRAINT email_template_template_code_key UNIQUE (template_code);


--
-- Name: guide_check_out_history guide_check_out_history_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_check_out_history
    ADD CONSTRAINT guide_check_out_history_pkey PRIMARY KEY (id);


--
-- Name: guide_ebom guide_ebom_guide_id_part_id_child_part_id_deleted_at_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_ebom
    ADD CONSTRAINT guide_ebom_guide_id_part_id_child_part_id_deleted_at_key UNIQUE (guide_id, part_id, child_part_id, deleted_at);


--
-- Name: guide_ebom guide_ebom_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_ebom
    ADD CONSTRAINT guide_ebom_pkey PRIMARY KEY (id);


--
-- Name: guide_mbom guide_mbom_guide_id_part_id_deleted_at_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_mbom
    ADD CONSTRAINT guide_mbom_guide_id_part_id_deleted_at_key UNIQUE (guide_id, part_id, deleted_at);


--
-- Name: guide_mbom guide_mbom_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_mbom
    ADD CONSTRAINT guide_mbom_pkey PRIMARY KEY (id);


--
-- Name: guide guide_part_id_number_version_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_part_id_number_version_key UNIQUE (part_id, number, version);


--
-- Name: guide guide_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_pkey PRIMARY KEY (id);


--
-- Name: guide guide_sequence_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_sequence_key UNIQUE (sequence);


--
-- Name: guide_step_equipment guide_step_equipment_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_pkey PRIMARY KEY (id);


--
-- Name: guide_step guide_step_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step
    ADD CONSTRAINT guide_step_pkey PRIMARY KEY (id);


--
-- Name: guide_step_task guide_step_task_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_task
    ADD CONSTRAINT guide_step_task_pkey PRIMARY KEY (id);


--
-- Name: guide_type guide_type_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_type
    ADD CONSTRAINT guide_type_pkey PRIMARY KEY (id);


--
-- Name: kit_bom_comment kit_bom_comment_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_bom_comment
    ADD CONSTRAINT kit_bom_comment_pkey PRIMARY KEY (id);


--
-- Name: kit kit_number_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit
    ADD CONSTRAINT kit_number_key UNIQUE (number);


--
-- Name: kit kit_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit
    ADD CONSTRAINT kit_pkey PRIMARY KEY (id);


--
-- Name: kit_serial kit_serial_kit_id_part_id_serialno_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_serial
    ADD CONSTRAINT kit_serial_kit_id_part_id_serialno_key UNIQUE (kit_id, part_id, serialno);


--
-- Name: kit_serial kit_serial_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_serial
    ADD CONSTRAINT kit_serial_pkey PRIMARY KEY (id);


--
-- Name: location location_number_name_deleted_at_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.location
    ADD CONSTRAINT location_number_name_deleted_at_key UNIQUE (number, name, deleted_at);


--
-- Name: location location_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);


--
-- Name: machine machine_number_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.machine
    ADD CONSTRAINT machine_number_key UNIQUE (number);


--
-- Name: machine machine_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.machine
    ADD CONSTRAINT machine_pkey PRIMARY KEY (id);


--
-- Name: machine_type machine_type_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.machine_type
    ADD CONSTRAINT machine_type_pkey PRIMARY KEY (id);


--
-- Name: material_kit material_kit_number_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit
    ADD CONSTRAINT material_kit_number_key UNIQUE (number);


--
-- Name: material_kit material_kit_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit
    ADD CONSTRAINT material_kit_pkey PRIMARY KEY (id);


--
-- Name: material_kit material_kit_sequence_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit
    ADD CONSTRAINT material_kit_sequence_key UNIQUE (sequence);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: news news_title_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.news
    ADD CONSTRAINT news_title_key UNIQUE (title);


--
-- Name: news_type news_type_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.news_type
    ADD CONSTRAINT news_type_pkey PRIMARY KEY (id);


--
-- Name: part_level part_level_code_deleted_at_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_level
    ADD CONSTRAINT part_level_code_deleted_at_key UNIQUE (code, deleted_at);


--
-- Name: part_level part_level_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_level
    ADD CONSTRAINT part_level_pkey PRIMARY KEY (id);


--
-- Name: part part_manufacturing_part_number_deleted_at_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_manufacturing_part_number_deleted_at_key UNIQUE (manufacturing_part_number, deleted_at);


--
-- Name: part part_part_number_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_part_number_key UNIQUE (part_number);


--
-- Name: part part_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_pkey PRIMARY KEY (id);


--
-- Name: part_type_category part_type_category_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_type_category
    ADD CONSTRAINT part_type_category_pkey PRIMARY KEY (id);


--
-- Name: part_type part_type_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_type
    ADD CONSTRAINT part_type_pkey PRIMARY KEY (id);


--
-- Name: platform platform_code_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.platform
    ADD CONSTRAINT platform_code_key UNIQUE (code);


--
-- Name: platform platform_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.platform
    ADD CONSTRAINT platform_pkey PRIMARY KEY (id);


--
-- Name: product product_number_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product
    ADD CONSTRAINT product_number_key UNIQUE (number);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: product product_sequence_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product
    ADD CONSTRAINT product_sequence_key UNIQUE (sequence);


--
-- Name: subsystem subsystem_code_deleted_at_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.subsystem
    ADD CONSTRAINT subsystem_code_deleted_at_key UNIQUE (code, deleted_at);


--
-- Name: subsystem subsystem_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.subsystem
    ADD CONSTRAINT subsystem_pkey PRIMARY KEY (id);


--
-- Name: tool tool_number_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.tool
    ADD CONSTRAINT tool_number_key UNIQUE (number);


--
-- Name: tool tool_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.tool
    ADD CONSTRAINT tool_pkey PRIMARY KEY (id);


--
-- Name: tool_type tool_type_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.tool_type
    ADD CONSTRAINT tool_type_pkey PRIMARY KEY (id);


--
-- Name: unit_of_measure unit_of_measure_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.unit_of_measure
    ADD CONSTRAINT unit_of_measure_pkey PRIMARY KEY (id);


--
-- Name: work_order work_order_kit_id_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_kit_id_key UNIQUE (kit_id);


--
-- Name: work_order work_order_number_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_number_key UNIQUE (number);


--
-- Name: work_order work_order_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_pkey PRIMARY KEY (id);


--
-- Name: work_order_step work_order_step_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT work_order_step_pkey PRIMARY KEY (id);


--
-- Name: work_order_task work_order_task_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_task
    ADD CONSTRAINT work_order_task_pkey PRIMARY KEY (id);


--
-- Name: work_order_task work_order_task_work_order_id_guide_step_task_id_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_task
    ADD CONSTRAINT work_order_task_work_order_id_guide_step_task_id_key UNIQUE (work_order_id, guide_step_task_id);


--
-- Name: work_package work_package_number_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package
    ADD CONSTRAINT work_package_number_key UNIQUE (number);


--
-- Name: work_package work_package_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package
    ADD CONSTRAINT work_package_pkey PRIMARY KEY (id);


--
-- Name: work_package work_package_sequence_key; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package
    ADD CONSTRAINT work_package_sequence_key UNIQUE (sequence);


--
-- Name: board_column board_column_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.board_column
    ADD CONSTRAINT board_column_pkey PRIMARY KEY (id);


--
-- Name: dashboard_widget dashboard_widget_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.dashboard_widget
    ADD CONSTRAINT dashboard_widget_pkey PRIMARY KEY (id);


--
-- Name: milestone milestone_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.milestone
    ADD CONSTRAINT milestone_pkey PRIMARY KEY (id);


--
-- Name: program program_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.program
    ADD CONSTRAINT program_pkey PRIMARY KEY (id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: sub_project sub_project_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.sub_project
    ADD CONSTRAINT sub_project_pkey PRIMARY KEY (id);


--
-- Name: resource_allocation resource_allocation_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.resource_allocation
    ADD CONSTRAINT resource_allocation_pkey PRIMARY KEY (id);


--
-- Name: task_activity task_activity_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_activity
    ADD CONSTRAINT task_activity_pkey PRIMARY KEY (id);


--
-- Name: task_assignee task_assignee_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_assignee
    ADD CONSTRAINT task_assignee_pkey PRIMARY KEY (id);


--
-- Name: task_comment task_comment_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_comment
    ADD CONSTRAINT task_comment_pkey PRIMARY KEY (id);


--
-- Name: task_dependency task_dependency_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_dependency
    ADD CONSTRAINT task_dependency_pkey PRIMARY KEY (id);


--
-- Name: task task_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);


--
-- Name: time_entry time_entry_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.time_entry
    ADD CONSTRAINT time_entry_pkey PRIMARY KEY (id);


--
-- Name: task_assignee uq_task_assignee; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_assignee
    ADD CONSTRAINT uq_task_assignee UNIQUE (task_id, user_id);


--
-- Name: task_dependency uq_task_dependency; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_dependency
    ADD CONSTRAINT uq_task_dependency UNIQUE (predecessor_task_id, successor_task_id);


--
-- Name: bin_management bin_management_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.bin_management
    ADD CONSTRAINT bin_management_pkey PRIMARY KEY (id);


--
-- Name: company_address company_address_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_address
    ADD CONSTRAINT company_address_pkey PRIMARY KEY (id);


--
-- Name: company_bank_account company_bank_account_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_bank_account
    ADD CONSTRAINT company_bank_account_pkey PRIMARY KEY (id);


--
-- Name: company_contact company_contact_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_contact
    ADD CONSTRAINT company_contact_pkey PRIMARY KEY (id);


--
-- Name: company_part company_part_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_part
    ADD CONSTRAINT company_part_pkey PRIMARY KEY (id);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- Name: goods_receipt_note goods_receipt_note_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_pkey PRIMARY KEY (id);


--
-- Name: grn_line_item grn_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.grn_line_item
    ADD CONSTRAINT grn_line_item_pkey PRIMARY KEY (id);


--
-- Name: inventory_part inventory_part_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_part
    ADD CONSTRAINT inventory_part_pkey PRIMARY KEY (id);


--
-- Name: inventory_stock inventory_stock_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT inventory_stock_pkey PRIMARY KEY (id);


--
-- Name: inventory_transaction inventory_transaction_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT inventory_transaction_pkey PRIMARY KEY (id);


--
-- Name: item item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (id);


--
-- Name: payment_term payment_term_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.payment_term
    ADD CONSTRAINT payment_term_pkey PRIMARY KEY (id);


--
-- Name: po_line_item po_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.po_line_item
    ADD CONSTRAINT po_line_item_pkey PRIMARY KEY (id);


--
-- Name: purchase_order purchase_order_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_pkey PRIMARY KEY (id);


--
-- Name: requisition_line_item requisition_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition_line_item
    ADD CONSTRAINT requisition_line_item_pkey PRIMARY KEY (id);


--
-- Name: requisition requisition_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition
    ADD CONSTRAINT requisition_pkey PRIMARY KEY (id);


--
-- Name: scrap_line_item scrap_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_line_item
    ADD CONSTRAINT scrap_line_item_pkey PRIMARY KEY (id);


--
-- Name: scrap_request scrap_request_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_pkey PRIMARY KEY (id);


--
-- Name: stock_movement_line_item stock_movement_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement_line_item
    ADD CONSTRAINT stock_movement_line_item_pkey PRIMARY KEY (id);


--
-- Name: stock_movement stock_movement_movement_number_key; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT stock_movement_movement_number_key UNIQUE (movement_number);


--
-- Name: stock_movement stock_movement_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT stock_movement_pkey PRIMARY KEY (id);


--
-- Name: tender_line_item tender_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_line_item
    ADD CONSTRAINT tender_line_item_pkey PRIMARY KEY (id);


--
-- Name: tender tender_number_key; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_number_key UNIQUE (tender_number);


--
-- Name: tender tender_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_pkey PRIMARY KEY (id);


--
-- Name: tender_quotation_line_item tender_quotation_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation_line_item
    ADD CONSTRAINT tender_quotation_line_item_pkey PRIMARY KEY (id);


--
-- Name: tender_quotation tender_quotation_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation
    ADD CONSTRAINT tender_quotation_pkey PRIMARY KEY (id);


--
-- Name: tender_vendor tender_vendor_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_vendor
    ADD CONSTRAINT tender_vendor_pkey PRIMARY KEY (id);


--
-- Name: tender_vendor uq_tender_vendor; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_vendor
    ADD CONSTRAINT uq_tender_vendor UNIQUE (tender_id, company_id);


--
-- Name: vendor_return_line_item vendor_return_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_line_item
    ADD CONSTRAINT vendor_return_line_item_pkey PRIMARY KEY (id);


--
-- Name: vendor_return_request vendor_return_request_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_pkey PRIMARY KEY (id);


--
-- Name: ix_user_department_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX ix_user_department_id ON application."user" USING btree (department_id) WITH (fillfactor='100', deduplicate_items='true') WHERE (deleted_at IS NULL);


--
-- Name: idx_additional_recipient_config_template; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_additional_recipient_config_template ON common.additional_recipient_configuration USING btree (template_code) WHERE (deleted_at IS NULL);


--
-- Name: idx_approval_configuration_entity_type; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_approval_configuration_entity_type ON common.approval_configuration USING btree (entity_type) WHERE (deleted_at IS NULL);


--
-- Name: idx_approval_log_action_at; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_approval_log_action_at ON common.approval_log USING btree (action_at DESC);


--
-- Name: idx_approval_log_entity; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_approval_log_entity ON common.approval_log USING btree (entity_type, entity_id);


--
-- Name: idx_approval_notification_recipient_entity; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_approval_notification_recipient_entity ON common.approval_notification_recipient USING btree (entity_type, entity_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_approval_notification_recipient_user; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_approval_notification_recipient_user ON common.approval_notification_recipient USING btree (recipient_user_id);


--
-- Name: ux_department_code_active; Type: INDEX; Schema: common; Owner: -
--

CREATE UNIQUE INDEX ux_department_code_active ON common.department USING btree (code) WITH (fillfactor='100', deduplicate_items='true') WHERE (deleted_at IS NULL);


--
-- Name: fki_guide_step_image_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX fki_guide_step_image_id_fkey ON mes.guide_step USING btree (image_id);


--
-- Name: guide_step_image_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX guide_step_image_id_fkey ON mes.guide_step USING btree (image_id);


--
-- Name: guide_step_video_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX guide_step_video_id_fkey ON mes.guide_step USING btree (video_id);


--
-- Name: idx_part_grade; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_grade ON mes.part USING btree (grade) WHERE (deleted_at IS NULL);


--
-- Name: idx_part_level_active; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_level_active ON mes.part_level USING btree (is_active) WHERE (deleted_at IS NULL);


--
-- Name: idx_part_level_code; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_level_code ON mes.part_level USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: idx_part_level_sort_order; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_level_sort_order ON mes.part_level USING btree (sort_order) WHERE (deleted_at IS NULL);


--
-- Name: idx_part_subsystem_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_subsystem_id ON mes.part USING btree (subsystem_id);


--
-- Name: idx_part_suffix_version; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_suffix_version ON mes.part USING btree (part_number_suffix, version DESC) WHERE ((item_type IS NULL) AND (deleted_by IS NULL));


--
-- Name: idx_subsystem_active; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_subsystem_active ON mes.subsystem USING btree (is_active) WHERE (deleted_at IS NULL);


--
-- Name: idx_subsystem_code; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_subsystem_code ON mes.subsystem USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: material_kit_image_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX material_kit_image_id_fkey ON mes.material_kit USING btree (image_id);


--
-- Name: product_image_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX product_image_id_fkey ON mes.product USING btree (image_id);


--
-- Name: work_order_step_image_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX work_order_step_image_id_fkey ON mes.work_order_step USING btree (image_id);


--
-- Name: work_order_step_manager_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX work_order_step_manager_id_fkey ON mes.work_order_step USING btree (manager_id);


--
-- Name: work_order_step_technician_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX work_order_step_technician_id_fkey ON mes.work_order_step USING btree (technician_id);


--
-- Name: idx_board_column_position; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_board_column_position ON pm.board_column USING btree (project_id, "position") WHERE (deleted_at IS NULL);


--
-- Name: idx_board_column_project_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_board_column_project_id ON pm.board_column USING btree (project_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_dashboard_widget_project_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_dashboard_widget_project_id ON pm.dashboard_widget USING btree (project_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_dashboard_widget_user_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_dashboard_widget_user_id ON pm.dashboard_widget USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_resource_allocation_dates; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_resource_allocation_dates ON pm.resource_allocation USING btree (start_date, end_date) WHERE (deleted_at IS NULL);


--
-- Name: idx_resource_allocation_project_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_resource_allocation_project_id ON pm.resource_allocation USING btree (project_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_resource_allocation_user_dates; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_resource_allocation_user_dates ON pm.resource_allocation USING btree (user_id, start_date, end_date) WHERE (deleted_at IS NULL);


--
-- Name: idx_resource_allocation_user_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_resource_allocation_user_id ON pm.resource_allocation USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_activity_created_by; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_activity_created_by ON pm.task_activity USING btree (created_by, created_at DESC);


--
-- Name: idx_task_activity_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_activity_task_id ON pm.task_activity USING btree (task_id, created_at DESC);


--
-- Name: idx_task_activity_type; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_activity_type ON pm.task_activity USING btree (task_id, activity_type);


--
-- Name: idx_task_assigned_to_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_assigned_to_id ON pm.task USING btree (assigned_to_id);


--
-- Name: idx_task_assignee_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_assignee_task_id ON pm.task_assignee USING btree (task_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_assignee_user_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_assignee_user_id ON pm.task_assignee USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_board_column_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_board_column_id ON pm.task USING btree (board_column_id);


--
-- Name: idx_task_comment_created_at; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_comment_created_at ON pm.task_comment USING btree (task_id, created_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_comment_mentions; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_comment_mentions ON pm.task_comment USING gin (mentions) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_comment_parent_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_comment_parent_id ON pm.task_comment USING btree (parent_comment_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_comment_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_comment_task_id ON pm.task_comment USING btree (task_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_dependency_predecessor; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_dependency_predecessor ON pm.task_dependency USING btree (predecessor_task_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_dependency_successor; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_dependency_successor ON pm.task_dependency USING btree (successor_task_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_parent_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_parent_task_id ON pm.task USING btree (parent_task_id);


--
-- Name: idx_task_project_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_project_id ON pm.task USING btree (project_id);


--
-- Name: idx_time_entry_date_range; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_time_entry_date_range ON pm.time_entry USING btree (user_id, entry_date) WHERE (deleted_at IS NULL);


--
-- Name: idx_time_entry_entry_date; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_time_entry_entry_date ON pm.time_entry USING btree (entry_date) WHERE (deleted_at IS NULL);


--
-- Name: idx_time_entry_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_time_entry_task_id ON pm.time_entry USING btree (task_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_time_entry_task_user; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_time_entry_task_user ON pm.time_entry USING btree (task_id, user_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_time_entry_user_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_time_entry_user_id ON pm.time_entry USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_company_part_is_preferred; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_company_part_is_preferred ON sc.company_part USING btree (is_preferred) WHERE (is_preferred = true);


--
-- Name: idx_company_part_vendor_part_number; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_company_part_vendor_part_number ON sc.company_part USING btree (vendor_part_number);


--
-- Name: idx_stock_movement_date; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_date ON sc.stock_movement USING btree (movement_date) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_from_location; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_from_location ON sc.stock_movement USING btree (from_location_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_line_item_movement; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_line_item_movement ON sc.stock_movement_line_item USING btree (stock_movement_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_line_item_part; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_line_item_part ON sc.stock_movement_line_item USING btree (part_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_status; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_status ON sc.stock_movement USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_to_location; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_to_location ON sc.stock_movement USING btree (to_location_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_type; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_type ON sc.stock_movement USING btree (movement_type) WHERE (deleted_at IS NULL);


--
-- Name: IX_stock_movement_company_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_stock_movement_company_id" ON sc.stock_movement USING btree (company_id);


--
-- Name: idx_tender_buyer_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_buyer_id ON sc.tender USING btree (buyer_id);


--
-- Name: idx_tender_closing_date; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_closing_date ON sc.tender USING btree (closing_date);


--
-- Name: idx_tender_deleted_by; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_deleted_by ON sc.tender USING btree (deleted_by) WHERE (deleted_by IS NULL);


--
-- Name: idx_tender_line_item_deleted_by; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_line_item_deleted_by ON sc.tender_line_item USING btree (deleted_by) WHERE (deleted_by IS NULL);


--
-- Name: idx_tender_line_item_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_line_item_part_id ON sc.tender_line_item USING btree (part_id);


--
-- Name: idx_tender_line_item_tender_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_line_item_tender_id ON sc.tender_line_item USING btree (tender_id);


--
-- Name: idx_tender_project_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_project_id ON sc.tender USING btree (project_id);


--
-- Name: idx_tender_requisition_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_requisition_id ON sc.tender USING btree (requisition_id);


--
-- Name: idx_tender_status; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_status ON sc.tender USING btree (status);


--
-- Name: idx_tender_vendor_company_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_vendor_company_id ON sc.tender_vendor USING btree (company_id);


--
-- Name: idx_tender_vendor_deleted_by; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_vendor_deleted_by ON sc.tender_vendor USING btree (deleted_by) WHERE (deleted_by IS NULL);


--
-- Name: idx_tender_vendor_status; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_vendor_status ON sc.tender_vendor USING btree (status);


--
-- Name: idx_tender_vendor_tender_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_vendor_tender_id ON sc.tender_vendor USING btree (tender_id);


--
-- Name: idx_tender_vendor_unique; Type: INDEX; Schema: sc; Owner: -
--

CREATE UNIQUE INDEX idx_tender_vendor_unique ON sc.tender_vendor USING btree (tender_id, company_id) WHERE (deleted_by IS NULL);


--
-- Name: ix_purchase_order_department_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX ix_purchase_order_department_id ON sc.purchase_order USING btree (department_id) WITH (fillfactor='100', deduplicate_items='true') WHERE (deleted_at IS NULL);


--
-- Name: ix_requisition_department_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX ix_requisition_department_id ON sc.requisition USING btree (department_id) WITH (fillfactor='100', deduplicate_items='true') WHERE (deleted_at IS NULL);


--
-- Name: grns_by_purchase_order_vw _RETURN; Type: RULE; Schema: sc; Owner: -
--

CREATE OR REPLACE VIEW sc.grns_by_purchase_order_vw AS
 SELECT grn.id AS grn_id,
    grn.grn_number,
    grn.purchase_order_id,
    grn.received_date,
    grn.received_by_id,
    (((u.first_name)::text || ' '::text) || (u.last_name)::text) AS received_by_full_name,
    u.email AS received_by_email,
    grn.location_id,
    loc.number AS location_number,
    loc.name AS location_name,
    grn.description,
    grn.reference_number,
    grn.invoice_number,
    grn.invoice_date,
    grn.vendor_reference_id,
    grn.status,
    grn.vendor_id,
    vendor.vendor_code,
    vendor.name AS vendor_name,
    grn.is_active,
    grn.created_at,
    grn.created_by,
    grn.updated_at,
    grn.updated_by,
    json_agg(jsonb_build_object('grn_line_item_id', li.id, 'part_id', li.part_id, 'part_name', p.name, 'part_number', p.part_number, 'received_quantity', li.received_quantity)) FILTER (WHERE (li.id IS NOT NULL)) AS grn_line_items
   FROM (((((sc.goods_receipt_note grn
     LEFT JOIN application."user" u ON ((grn.received_by_id = u.id)))
     LEFT JOIN mes.location loc ON ((grn.location_id = loc.id)))
     LEFT JOIN sc.grn_line_item li ON (((li.grn_id = grn.id) AND (li.deleted_by IS NULL))))
     LEFT JOIN mes.part p ON ((p.id = li.part_id)))
     LEFT JOIN sc.company vendor ON ((grn.vendor_id = vendor.id)))
  WHERE (grn.deleted_by IS NULL)
  GROUP BY grn.id, grn.grn_number, grn.purchase_order_id, grn.received_date, grn.received_by_id, u.first_name, u.last_name, u.email, grn.location_id, loc.number, loc.name, grn.description, grn.vendor_reference_id, grn.status, grn.vendor_id, vendor.vendor_code, vendor.name, grn.is_active, grn.created_at, grn.created_by, grn.updated_at, grn.updated_by;


--
-- Name: part part_number_trigger; Type: TRIGGER; Schema: mes; Owner: -
--

CREATE TRIGGER part_number_trigger BEFORE INSERT OR UPDATE OF part_type_id ON mes.part FOR EACH ROW EXECUTE FUNCTION mes.generate_part_number();


--
-- Name: ebom trg_update_has_bom_flag; Type: TRIGGER; Schema: mes; Owner: -
--

CREATE TRIGGER trg_update_has_bom_flag AFTER INSERT OR DELETE OR UPDATE ON mes.ebom FOR EACH ROW EXECUTE FUNCTION mes.update_has_bom_flag();


--
-- Name: customer fk_customer_address; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.customer
    ADD CONSTRAINT fk_customer_address FOREIGN KEY (customer_address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: user fk_user_department; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application."user"
    ADD CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;


--
-- Name: issue issue_guide_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.issue
    ADD CONSTRAINT issue_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL;


--
-- Name: issue issue_product_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.issue
    ADD CONSTRAINT issue_product_id_fkey FOREIGN KEY (product_id) REFERENCES mes.product(id) ON DELETE SET NULL;


--
-- Name: issue issue_work_order_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.issue
    ADD CONSTRAINT issue_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE SET NULL;


--
-- Name: organization_address organization_address_address_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.organization_address
    ADD CONSTRAINT organization_address_address_id_fkey FOREIGN KEY (address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: organization_address organization_address_organization_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.organization_address
    ADD CONSTRAINT organization_address_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES application.organization(id) ON DELETE SET NULL;


--
-- Name: role role_app_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role
    ADD CONSTRAINT role_app_id_fkey FOREIGN KEY (app_id) REFERENCES application.app(id) ON DELETE SET NULL;


--
-- Name: role_filter role_filter_role_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role_filter
    ADD CONSTRAINT role_filter_role_id_fkey FOREIGN KEY (role_id) REFERENCES application.role(id);


--
-- Name: role_permission role_permission_role_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role_permission
    ADD CONSTRAINT role_permission_role_id_fkey FOREIGN KEY (role_id) REFERENCES application.role(id) ON DELETE SET NULL;


--
-- Name: staff user_manager_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.staff
    ADD CONSTRAINT user_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: staff user_organization_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.staff
    ADD CONSTRAINT user_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES application.organization(id) ON DELETE SET NULL;


--
-- Name: user_role user_role_role_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.user_role
    ADD CONSTRAINT user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES application.role(id) ON DELETE CASCADE;


--
-- Name: user_role user_role_user_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES application."user"(id) ON DELETE CASCADE;


--
-- Name: address address_country_id_fkey; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.address
    ADD CONSTRAINT address_country_id_fkey FOREIGN KEY (country_id) REFERENCES common.country(id) ON DELETE SET NULL;


--
-- Name: approval approval_approver_id_fkey; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval
    ADD CONSTRAINT approval_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: bank_account bank_account_address_id_fkey; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.bank_account
    ADD CONSTRAINT bank_account_address_id_fkey FOREIGN KEY (address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: bank_account bank_account_currency_id_fkey; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.bank_account
    ADD CONSTRAINT bank_account_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: contact contact_company_id_fkey; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.contact
    ADD CONSTRAINT contact_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: approval_notification_recipient fk_approval_notification_recipient_user; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval_notification_recipient
    ADD CONSTRAINT fk_approval_notification_recipient_user FOREIGN KEY (recipient_user_id) REFERENCES application."user"(id) ON DELETE CASCADE;


--
-- Name: department fk_department_head; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.department
    ADD CONSTRAINT fk_department_head FOREIGN KEY (head_of_department_user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: department fk_department_parent; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.department
    ADD CONSTRAINT fk_department_parent FOREIGN KEY (parent_department_id) REFERENCES common.department(id) ON DELETE SET NULL;


--
-- Name: ebom ebom_assembly_location_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.ebom
    ADD CONSTRAINT ebom_assembly_location_id_fkey FOREIGN KEY (assembly_location_id) REFERENCES mes.assembly_location(id) ON DELETE SET NULL;


--
-- Name: ebom ebom_child_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.ebom
    ADD CONSTRAINT ebom_child_part_id_fkey FOREIGN KEY (child_part_id) REFERENCES mes.part(id);


--
-- Name: ebom ebom_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.ebom
    ADD CONSTRAINT ebom_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id);


--
-- Name: eco_log eco_log_eco_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_log
    ADD CONSTRAINT eco_log_eco_id_fkey FOREIGN KEY (eco_id) REFERENCES mes.eco(id);


--
-- Name: eco_part eco_part_eco_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_part
    ADD CONSTRAINT eco_part_eco_id_fkey FOREIGN KEY (eco_id) REFERENCES mes.eco(id);


--
-- Name: eco_part eco_part_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_part
    ADD CONSTRAINT eco_part_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id);


--
-- Name: guide_check_out_history guide_check_out_history_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_check_out_history
    ADD CONSTRAINT guide_check_out_history_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE;


--
-- Name: guide guide_clone_from_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_clone_from_id_fkey FOREIGN KEY (clone_from_id) REFERENCES mes.guide(id) ON DELETE SET NULL;


--
-- Name: guide_ebom guide_ebom_child_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_ebom
    ADD CONSTRAINT guide_ebom_child_part_id_fkey FOREIGN KEY (child_part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: guide_ebom guide_ebom_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_ebom
    ADD CONSTRAINT guide_ebom_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL;


--
-- Name: guide_ebom guide_ebom_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_ebom
    ADD CONSTRAINT guide_ebom_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: guide guide_guide_type_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_guide_type_id_fkey FOREIGN KEY (guide_type_id) REFERENCES mes.guide_type(id) ON DELETE SET NULL;


--
-- Name: guide_mbom guide_mbom_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_mbom
    ADD CONSTRAINT guide_mbom_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id);


--
-- Name: guide_mbom guide_mbom_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_mbom
    ADD CONSTRAINT guide_mbom_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id);


--
-- Name: guide guide_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: guide guide_platform_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES mes.platform(id) ON DELETE SET NULL;


--
-- Name: guide_step_equipment guide_step_equipment_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE;


--
-- Name: guide_step_equipment guide_step_equipment_guide_step_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_guide_step_id_fkey FOREIGN KEY (guide_step_id) REFERENCES mes.guide_step(id) ON DELETE CASCADE;


--
-- Name: guide_step_equipment guide_step_equipment_machine_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_machine_id_fkey FOREIGN KEY (machine_id) REFERENCES mes.machine(id) ON DELETE SET NULL;


--
-- Name: guide_step_equipment guide_step_equipment_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: guide_step_equipment guide_step_equipment_tool_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES mes.tool(id) ON DELETE SET NULL;


--
-- Name: guide_step guide_step_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step
    ADD CONSTRAINT guide_step_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE;


--
-- Name: guide_step guide_step_image_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step
    ADD CONSTRAINT guide_step_image_id_fkey FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL;


--
-- Name: guide_step_task guide_step_task_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_task
    ADD CONSTRAINT guide_step_task_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE;


--
-- Name: guide_step_task guide_step_task_guide_step_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_task
    ADD CONSTRAINT guide_step_task_guide_step_id_fkey FOREIGN KEY (guide_step_id) REFERENCES mes.guide_step(id) ON DELETE CASCADE;


--
-- Name: guide_step guide_step_video_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step
    ADD CONSTRAINT guide_step_video_id_fkey FOREIGN KEY (video_id) REFERENCES common.video(id) ON DELETE SET NULL;


--
-- Name: kit_bom_comment kit_bom_comment_kit_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_bom_comment
    ADD CONSTRAINT kit_bom_comment_kit_id_fkey FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL;


--
-- Name: kit_bom_comment kit_bom_comment_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_bom_comment
    ADD CONSTRAINT kit_bom_comment_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: kit kit_location_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit
    ADD CONSTRAINT kit_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: kit kit_material_kit_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit
    ADD CONSTRAINT kit_material_kit_id_fkey FOREIGN KEY (material_kit_id) REFERENCES mes.material_kit(id) ON DELETE SET NULL;


--
-- Name: kit kit_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit
    ADD CONSTRAINT kit_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: kit_serial kit_serial_kit_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_serial
    ADD CONSTRAINT kit_serial_kit_id_fkey FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL;


--
-- Name: kit_serial kit_serial_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_serial
    ADD CONSTRAINT kit_serial_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: machine machine_machine_type_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.machine
    ADD CONSTRAINT machine_machine_type_id_fkey FOREIGN KEY (machine_type_id) REFERENCES mes.machine_type(id) ON DELETE SET NULL;


--
-- Name: material_kit material_kit_image_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit
    ADD CONSTRAINT material_kit_image_id_fkey FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL;


--
-- Name: material_kit material_kit_location_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit
    ADD CONSTRAINT material_kit_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: material_kit material_kit_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit
    ADD CONSTRAINT material_kit_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: news news_news_type_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.news
    ADD CONSTRAINT news_news_type_id_fkey FOREIGN KEY (news_type_id) REFERENCES mes.news_type(id) ON DELETE SET NULL;


--
-- Name: part part_country_of_origin_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_country_of_origin_id_fkey FOREIGN KEY (country_of_origin_id) REFERENCES common.country(id) ON DELETE SET NULL;


--
-- Name: part part_eco_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_eco_id_fkey FOREIGN KEY (eco_id) REFERENCES mes.eco(id) ON DELETE SET NULL NOT VALID;


--
-- Name: part part_part_type_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_part_type_id_fkey FOREIGN KEY (part_type_id) REFERENCES mes.part_type(id) ON DELETE SET NULL;


--
-- Name: part part_subsystem_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_subsystem_id_fkey FOREIGN KEY (subsystem_id) REFERENCES mes.subsystem(id) ON DELETE SET NULL;


--
-- Name: part_type part_type_part_level_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_type
    ADD CONSTRAINT part_type_part_level_id_fkey FOREIGN KEY (part_level_id) REFERENCES mes.part_level(id) ON DELETE SET NULL;


--
-- Name: part_type part_type_part_type_category_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_type
    ADD CONSTRAINT part_type_part_type_category_id_fkey FOREIGN KEY (part_type_category_id) REFERENCES mes.part_type_category(id) ON DELETE SET NULL;


--
-- Name: part part_unit_of_measure_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_unit_of_measure_id_fkey FOREIGN KEY (unit_of_measure_id) REFERENCES mes.unit_of_measure(id) ON DELETE SET NULL;


--
-- Name: product product_image_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product
    ADD CONSTRAINT product_image_id_fkey FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL;


--
-- Name: product product_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product
    ADD CONSTRAINT product_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: product product_platform_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product
    ADD CONSTRAINT product_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES mes.platform(id) ON DELETE SET NULL;


--
-- Name: tool tool_tool_type_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.tool
    ADD CONSTRAINT tool_tool_type_id_fkey FOREIGN KEY (tool_type_id) REFERENCES mes.tool_type(id) ON DELETE SET NULL;


--
-- Name: work_order work_order_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL;


--
-- Name: work_order work_order_kit_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_kit_id_fkey FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL;


--
-- Name: work_order work_order_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id);


--
-- Name: work_order work_order_product_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_product_id_fkey FOREIGN KEY (product_id) REFERENCES mes.product(id) ON DELETE SET NULL;


--
-- Name: work_order_step work_order_step_guide_step_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT work_order_step_guide_step_id_fkey FOREIGN KEY (guide_step_id) REFERENCES mes.guide_step(id);


--
-- Name: work_order_step work_order_step_image_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT work_order_step_image_id_fkey FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL;


--
-- Name: work_order_step work_order_step_manager_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT work_order_step_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: work_order_step work_order_step_technician_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT work_order_step_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: work_order_step work_order_step_work_order_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT work_order_step_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE CASCADE;


--
-- Name: work_order_task work_order_task_guide_step_task_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_task
    ADD CONSTRAINT work_order_task_guide_step_task_id_fkey FOREIGN KEY (guide_step_task_id) REFERENCES mes.guide_step_task(id);


--
-- Name: work_order_task work_order_task_work_order_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_task
    ADD CONSTRAINT work_order_task_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE CASCADE;


--
-- Name: work_order_task work_order_task_work_order_step_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_task
    ADD CONSTRAINT work_order_task_work_order_step_id_fkey FOREIGN KEY (work_order_step_id) REFERENCES mes.work_order_step(id);


--
-- Name: work_order work_order_work_package_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_work_package_id_fkey FOREIGN KEY (work_package_id) REFERENCES mes.work_package(id) ON DELETE SET NULL;


--
-- Name: work_package work_package_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package
    ADD CONSTRAINT work_package_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL;


--
-- Name: work_package work_package_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package
    ADD CONSTRAINT work_package_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id);


--
-- Name: work_package work_package_product_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package
    ADD CONSTRAINT work_package_product_id_fkey FOREIGN KEY (product_id) REFERENCES mes.product(id) ON DELETE SET NULL;


--
-- Name: board_column board_column_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.board_column
    ADD CONSTRAINT board_column_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE CASCADE;


--
-- Name: dashboard_widget dashboard_widget_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.dashboard_widget
    ADD CONSTRAINT dashboard_widget_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE CASCADE;


--
-- Name: milestone milestone_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.milestone
    ADD CONSTRAINT milestone_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: program program_buyer_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.program
    ADD CONSTRAINT program_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES application."user"(id) ON DELETE SET NULL NOT VALID;


--
-- Name: program program_customer_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.program
    ADD CONSTRAINT program_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES application.customer(id) ON DELETE SET NULL;


--
-- Name: program program_program_manager_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.program
    ADD CONSTRAINT program_program_manager_id_fkey FOREIGN KEY (program_manager_id) REFERENCES application."user"(id) ON DELETE SET NULL NOT VALID;


--
-- Name: program program_supply_chain_manager_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.program
    ADD CONSTRAINT program_supply_chain_manager_id_fkey FOREIGN KEY (supply_chain_manager_id) REFERENCES application."user"(id) ON DELETE SET NULL NOT VALID;


--
-- Name: project project_program_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.project
    ADD CONSTRAINT project_program_id_fkey FOREIGN KEY (program_id) REFERENCES pm.program(id) ON DELETE SET NULL;


--
-- Name: project project_project_manager_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.project
    ADD CONSTRAINT project_project_manager_id_fkey FOREIGN KEY (project_manager_id) REFERENCES application."user"(id) ON DELETE SET NULL NOT VALID;


--
-- Name: sub_project sub_project_program_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.sub_project
    ADD CONSTRAINT sub_project_program_id_fkey FOREIGN KEY (program_id) REFERENCES pm.program(id) ON DELETE SET NULL;


--
-- Name: sub_project sub_project_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.sub_project
    ADD CONSTRAINT sub_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE CASCADE;


--
-- Name: sub_project sub_project_project_manager_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.sub_project
    ADD CONSTRAINT sub_project_project_manager_id_fkey FOREIGN KEY (project_manager_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: resource_allocation resource_allocation_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.resource_allocation
    ADD CONSTRAINT resource_allocation_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE CASCADE;


--
-- Name: resource_allocation resource_allocation_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.resource_allocation
    ADD CONSTRAINT resource_allocation_task_id_fkey FOREIGN KEY (task_id) REFERENCES pm.task(id) ON DELETE SET NULL;


--
-- Name: resource_allocation resource_allocation_user_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.resource_allocation
    ADD CONSTRAINT resource_allocation_user_id_fkey FOREIGN KEY (user_id) REFERENCES application."user"(id) ON DELETE SET NULL NOT VALID;


--
-- Name: task_activity task_activity_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_activity
    ADD CONSTRAINT task_activity_task_id_fkey FOREIGN KEY (task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: task task_assigned_to_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES application."user"(id) ON DELETE SET NULL NOT VALID;


--
-- Name: task_assignee task_assignee_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_assignee
    ADD CONSTRAINT task_assignee_task_id_fkey FOREIGN KEY (task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: task_assignee task_assignee_user_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_assignee
    ADD CONSTRAINT task_assignee_user_id_fkey FOREIGN KEY (user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: task task_board_column_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_board_column_id_fkey FOREIGN KEY (board_column_id) REFERENCES pm.board_column(id) ON DELETE SET NULL;


--
-- Name: task_comment task_comment_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_comment
    ADD CONSTRAINT task_comment_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES pm.task_comment(id) ON DELETE SET NULL;


--
-- Name: task_comment task_comment_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_comment
    ADD CONSTRAINT task_comment_task_id_fkey FOREIGN KEY (task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: task_dependency task_dependency_predecessor_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_dependency
    ADD CONSTRAINT task_dependency_predecessor_task_id_fkey FOREIGN KEY (predecessor_task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: task_dependency task_dependency_successor_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_dependency
    ADD CONSTRAINT task_dependency_successor_task_id_fkey FOREIGN KEY (successor_task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: task task_milestone_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES pm.milestone(id) ON DELETE SET NULL;


--
-- Name: task task_parent_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_parent_task_id_fkey FOREIGN KEY (parent_task_id) REFERENCES pm.task(id) ON DELETE SET NULL;


--
-- Name: task task_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: time_entry time_entry_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.time_entry
    ADD CONSTRAINT time_entry_task_id_fkey FOREIGN KEY (task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: time_entry time_entry_user_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.time_entry
    ADD CONSTRAINT time_entry_user_id_fkey FOREIGN KEY (user_id) REFERENCES application."user"(id) ON DELETE SET NULL NOT VALID;


--
-- Name: bin_management bin_management_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.bin_management
    ADD CONSTRAINT bin_management_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: bin_management bin_management_unit_of_measure_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.bin_management
    ADD CONSTRAINT bin_management_unit_of_measure_id_fkey FOREIGN KEY (unit_of_measure_id) REFERENCES mes.unit_of_measure(id) ON DELETE SET NULL;


--
-- Name: company_address company_address_address_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_address
    ADD CONSTRAINT company_address_address_id_fkey FOREIGN KEY (address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: company_address company_address_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_address
    ADD CONSTRAINT company_address_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: company_bank_account company_bank_account_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_bank_account
    ADD CONSTRAINT company_bank_account_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES common.bank_account(id) ON DELETE SET NULL;


--
-- Name: company_bank_account company_bank_account_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_bank_account
    ADD CONSTRAINT company_bank_account_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: company_contact company_contact_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_contact
    ADD CONSTRAINT company_contact_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: company_contact company_contact_contact_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_contact
    ADD CONSTRAINT company_contact_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES common.contact(id) ON DELETE SET NULL;


--
-- Name: company company_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company
    ADD CONSTRAINT company_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: company_part company_part_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_part
    ADD CONSTRAINT company_part_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: company_part company_part_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_part
    ADD CONSTRAINT company_part_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: company_part company_part_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_part
    ADD CONSTRAINT company_part_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: company company_payment_term_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company
    ADD CONSTRAINT company_payment_term_id_fkey FOREIGN KEY (payment_term_id) REFERENCES sc.payment_term(id) ON DELETE SET NULL;


--
-- Name: inventory_stock fk_inventory_stock_assigned_user; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT fk_inventory_stock_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: inventory_transaction fk_inventory_transaction_assigned_user; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT fk_inventory_transaction_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: inventory_transaction fk_inventory_transaction_from_location; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT fk_inventory_transaction_from_location FOREIGN KEY (from_location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: inventory_transaction fk_inventory_transaction_project; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT fk_inventory_transaction_project FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: inventory_transaction fk_inventory_transaction_to_location; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT fk_inventory_transaction_to_location FOREIGN KEY (to_location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: purchase_order fk_purchase_order_department; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT fk_purchase_order_department FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;


--
-- Name: requisition fk_requisition_department; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition
    ADD CONSTRAINT fk_requisition_department FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_assigned_user; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_from_bin; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_from_bin FOREIGN KEY (from_bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_from_location; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_from_location FOREIGN KEY (from_location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: stock_movement_line_item fk_stock_movement_line_item_movement; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement_line_item
    ADD CONSTRAINT fk_stock_movement_line_item_movement FOREIGN KEY (stock_movement_id) REFERENCES sc.stock_movement(id) ON DELETE CASCADE;


--
-- Name: stock_movement_line_item fk_stock_movement_line_item_part; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement_line_item
    ADD CONSTRAINT fk_stock_movement_line_item_part FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_performed_by; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_performed_by FOREIGN KEY (performed_by_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_to_bin; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_to_bin FOREIGN KEY (to_bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_to_location; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_to_location FOREIGN KEY (to_location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: stock_movement stock_movement_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT stock_movement_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_work_order; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_work_order FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE SET NULL;


--
-- Name: vendor_return_request fk_vendor_return_request_wo_id; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT fk_vendor_return_request_wo_id FOREIGN KEY (wo_id) REFERENCES mes.work_order(id) ON DELETE SET NULL;


--
-- Name: goods_receipt_note goods_receipt_note_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: goods_receipt_note goods_receipt_note_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES sc.purchase_order(id) ON DELETE SET NULL;


--
-- Name: goods_receipt_note goods_receipt_note_received_by_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_received_by_id_fkey FOREIGN KEY (received_by_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: goods_receipt_note goods_receipt_note_vendor_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: grn_line_item grn_line_item_checked_by_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.grn_line_item
    ADD CONSTRAINT grn_line_item_checked_by_id_fkey FOREIGN KEY (checked_by_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: grn_line_item grn_line_item_grn_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.grn_line_item
    ADD CONSTRAINT grn_line_item_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES sc.goods_receipt_note(id) ON DELETE SET NULL;


--
-- Name: grn_line_item grn_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.grn_line_item
    ADD CONSTRAINT grn_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: grn_line_item grn_line_item_po_line_item_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.grn_line_item
    ADD CONSTRAINT grn_line_item_po_line_item_id_fkey FOREIGN KEY (po_line_item_id) REFERENCES sc.po_line_item(id) ON DELETE SET NULL;


--
-- Name: inventory_part inventory_part_bin_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_part
    ADD CONSTRAINT inventory_part_bin_id_fkey FOREIGN KEY (bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL;


--
-- Name: inventory_part inventory_part_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_part
    ADD CONSTRAINT inventory_part_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: inventory_part inventory_part_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_part
    ADD CONSTRAINT inventory_part_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: inventory_stock inventory_stock_bin_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT inventory_stock_bin_id_fkey FOREIGN KEY (bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL;


--
-- Name: inventory_stock inventory_stock_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT inventory_stock_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: inventory_stock inventory_stock_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT inventory_stock_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: inventory_stock inventory_stock_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT inventory_stock_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: inventory_transaction inventory_transaction_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT inventory_transaction_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: po_line_item po_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.po_line_item
    ADD CONSTRAINT po_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: po_line_item po_line_item_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.po_line_item
    ADD CONSTRAINT po_line_item_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES sc.purchase_order(id) ON DELETE SET NULL;


--
-- Name: po_line_item po_line_item_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.po_line_item
    ADD CONSTRAINT po_line_item_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_billing_address_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_buyer_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES application."user"(id) ON DELETE SET NULL NOT VALID;


--
-- Name: purchase_order purchase_order_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_delivery_address_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_delivery_address_id_fkey FOREIGN KEY (delivery_address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_payment_term_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_payment_term_id_fkey FOREIGN KEY (payment_term_id) REFERENCES sc.payment_term(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_quotation_reference_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_quotation_reference_id_fkey FOREIGN KEY (quotation_reference_id) REFERENCES common.document(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_requisition_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES sc.requisition(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_shipping_address_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_supply_chain_lead_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_supply_chain_lead_id_fkey FOREIGN KEY (supply_chain_lead_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_vendor_billing_address_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_vendor_billing_address_id_fkey FOREIGN KEY (vendor_billing_address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_vendor_billing_contact_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_vendor_billing_contact_id_fkey FOREIGN KEY (vendor_billing_contact_id) REFERENCES common.contact(id) ON DELETE SET NULL;


--
-- Name: requisition_line_item requisition_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition_line_item
    ADD CONSTRAINT requisition_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: requisition_line_item requisition_line_item_requisition_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition_line_item
    ADD CONSTRAINT requisition_line_item_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES sc.requisition(id) ON DELETE SET NULL;


--
-- Name: requisition requisition_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition
    ADD CONSTRAINT requisition_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: requisition requisition_requested_by_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition
    ADD CONSTRAINT requisition_requested_by_id_fkey FOREIGN KEY (requested_by_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: scrap_line_item scrap_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_line_item
    ADD CONSTRAINT scrap_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: scrap_line_item scrap_line_item_scrap_request_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_line_item
    ADD CONSTRAINT scrap_line_item_scrap_request_id_fkey FOREIGN KEY (scrap_request_id) REFERENCES sc.scrap_request(id) ON DELETE CASCADE;


--
-- Name: scrap_request scrap_request_grn_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES sc.goods_receipt_note(id) ON DELETE SET NULL;


--
-- Name: scrap_request scrap_request_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: scrap_request scrap_request_po_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_po_id_fkey FOREIGN KEY (po_id) REFERENCES sc.purchase_order(id) ON DELETE SET NULL;


--
-- Name: scrap_request scrap_request_raised_by_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_raised_by_id_fkey FOREIGN KEY (raised_by_id) REFERENCES application."user"(id) ON DELETE SET NULL NOT VALID;


--
-- Name: scrap_request scrap_request_wo_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_wo_id_fkey FOREIGN KEY (wo_id) REFERENCES mes.work_order(id) ON DELETE SET NULL;


--
-- Name: stock_movement stock_movement_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT stock_movement_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: stock_movement stock_movement_sub_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT stock_movement_sub_project_id_fkey FOREIGN KEY (sub_project_id) REFERENCES pm.sub_project(id) ON DELETE SET NULL;


--
-- Name: tender tender_awarded_vendor_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_awarded_vendor_id_fkey FOREIGN KEY (awarded_vendor_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: tender tender_buyer_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: tender tender_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: tender_line_item tender_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_line_item
    ADD CONSTRAINT tender_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: tender_line_item tender_line_item_tender_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_line_item
    ADD CONSTRAINT tender_line_item_tender_id_fkey FOREIGN KEY (tender_id) REFERENCES sc.tender(id) ON DELETE CASCADE;


--
-- Name: tender_line_item tender_line_item_unit_of_measure_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_line_item
    ADD CONSTRAINT tender_line_item_unit_of_measure_id_fkey FOREIGN KEY (unit_of_measure_id) REFERENCES mes.unit_of_measure(id) ON DELETE SET NULL;


--
-- Name: tender tender_payment_term_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_payment_term_id_fkey FOREIGN KEY (payment_term_id) REFERENCES sc.payment_term(id) ON DELETE SET NULL;


--
-- Name: tender tender_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: tender_quotation tender_quotation_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation
    ADD CONSTRAINT tender_quotation_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: tender_quotation tender_quotation_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation
    ADD CONSTRAINT tender_quotation_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: tender_quotation tender_quotation_document_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation
    ADD CONSTRAINT tender_quotation_document_id_fkey FOREIGN KEY (document_id) REFERENCES common.document(id) ON DELETE SET NULL;


--
-- Name: tender_quotation_line_item tender_quotation_line_item_tender_line_item_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation_line_item
    ADD CONSTRAINT tender_quotation_line_item_tender_line_item_id_fkey FOREIGN KEY (tender_line_item_id) REFERENCES sc.tender_line_item(id) ON DELETE SET NULL;


--
-- Name: tender_quotation_line_item tender_quotation_line_item_tender_quotation_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation_line_item
    ADD CONSTRAINT tender_quotation_line_item_tender_quotation_id_fkey FOREIGN KEY (tender_quotation_id) REFERENCES sc.tender_quotation(id) ON DELETE CASCADE;


--
-- Name: tender_quotation tender_quotation_tender_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation
    ADD CONSTRAINT tender_quotation_tender_id_fkey FOREIGN KEY (tender_id) REFERENCES sc.tender(id) ON DELETE CASCADE;


--
-- Name: tender tender_requisition_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES sc.requisition(id) ON DELETE SET NULL;


--
-- Name: tender_vendor tender_vendor_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_vendor
    ADD CONSTRAINT tender_vendor_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: tender_vendor tender_vendor_tender_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_vendor
    ADD CONSTRAINT tender_vendor_tender_id_fkey FOREIGN KEY (tender_id) REFERENCES sc.tender(id) ON DELETE CASCADE;


--
-- Name: vendor_return_line_item vendor_return_line_item_grn_line_item_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_line_item
    ADD CONSTRAINT vendor_return_line_item_grn_line_item_id_fkey FOREIGN KEY (grn_line_item_id) REFERENCES sc.grn_line_item(id) ON DELETE SET NULL;


--
-- Name: vendor_return_line_item vendor_return_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_line_item
    ADD CONSTRAINT vendor_return_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: vendor_return_line_item vendor_return_line_item_return_request_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_line_item
    ADD CONSTRAINT vendor_return_line_item_return_request_id_fkey FOREIGN KEY (return_request_id) REFERENCES sc.vendor_return_request(id) ON DELETE CASCADE;


--
-- Name: vendor_return_request vendor_return_request_grn_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES sc.goods_receipt_note(id) ON DELETE SET NULL;


--
-- Name: vendor_return_request vendor_return_request_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: vendor_return_request vendor_return_request_po_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_po_id_fkey FOREIGN KEY (po_id) REFERENCES sc.purchase_order(id) ON DELETE SET NULL;


--
-- Name: vendor_return_request vendor_return_request_raised_by_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_raised_by_id_fkey FOREIGN KEY (raised_by_id) REFERENCES application."user"(id) ON DELETE SET NULL NOT VALID;


--
-- Name: vendor_return_request vendor_return_request_vendor_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict UjUO0IHgQPNu7meYfcqWDWl1ljNZBP44FCFdYCgTXgkSQxWt0aDzxMeNGXPGbqv

