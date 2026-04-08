CREATE OR REPLACE PROCEDURE mes.revert_inventory_for_kit(
    IN kit_part_id UUID,
    IN multiplier INTEGER,
    IN user_email TEXT,
    IN work_order_id UUID
)
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