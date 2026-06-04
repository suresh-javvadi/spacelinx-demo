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

ALTER PROCEDURE mes.clone_ebom(uuid, uuid, text) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.clone_ebom(uuid, uuid, text) TO spacelinxuser;
