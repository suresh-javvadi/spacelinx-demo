CREATE OR REPLACE PROCEDURE mes.clone_ebom(IN original_part_id uuid, IN new_part_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insert all levels of BOM from original part to new part.
    -- path tracks visited part_ids so a circular BOM reference (e.g. A -> B -> A,
    -- which is possible in real data - see BomService's ancestor-path guards) stops
    -- the recursion instead of looping until the connection times out.
    WITH RECURSIVE bom_tree AS (
        SELECT part_id, child_part_id, quantity, ARRAY[part_id] AS path
		FROM mes.ebom
        WHERE part_id = original_part_id
          AND deleted_by IS NULL

        UNION ALL

        SELECT bt.child_part_id AS part_id, e.child_part_id, e.quantity, bt.path || e.child_part_id
        FROM mes.ebom e
        INNER JOIN bom_tree bt ON e.part_id = bt.child_part_id
        WHERE e.deleted_by IS NULL
          AND NOT (e.child_part_id = ANY(bt.path))
    )
    INSERT INTO mes.ebom (part_id, child_part_id, quantity, created_by, created_at)
    SELECT new_part_id, child_part_id, quantity, user_email, NOW()
    FROM bom_tree
    ON CONFLICT (part_id, child_part_id, deleted_at) DO NOTHING;
END;
$$;

ALTER PROCEDURE mes.clone_ebom(uuid, uuid, text) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.clone_ebom(uuid, uuid, text) TO spacelinxuser;
