CREATE OR REPLACE PROCEDURE mes.create_work_package_and_work_orders(
    IN p_name TEXT,
    IN p_part_id UUID,
    IN p_guide_id UUID,
    IN p_product_id UUID,
    IN p_technician_id UUID,
    IN p_manager_id UUID,
    IN p_start_date TIMESTAMPTZ,
    IN p_end_date TIMESTAMPTZ,
    IN p_quantity INTEGER,
    IN p_user_email TEXT,
    OUT new_work_package_id UUID)
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