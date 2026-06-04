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

ALTER PROCEDURE mes.revert_inventory_for_kit(uuid, integer, text, uuid) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.revert_inventory_for_kit(uuid, integer, text, uuid) TO spacelinxuser;
