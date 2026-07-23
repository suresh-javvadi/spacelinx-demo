CREATE OR REPLACE PROCEDURE mes.clone_ebom(IN original_part_id uuid, IN new_part_id uuid, IN user_email text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insert all levels of BOM from original part to new part.
    -- path tracks visited part_ids so a circular BOM reference (e.g. A -> B -> A,
    -- which is possible in real data - see BomService's ancestor-path guards) stops
    -- the recursion instead of looping until the connection times out.
    -- Soft-deleting a part does not cascade to its ebom link rows, so a deleted
    -- child part can still have an active ebom row. Join mes.part on child_part_id
    -- and require deleted_by IS NULL so soft-deleted parts are not cloned into the
    -- new BOM (mirrors the guard in PartService.ClonePartWithNewVersion).
    WITH RECURSIVE bom_tree AS (
        SELECT e.part_id, e.child_part_id, e.quantity, ARRAY[e.part_id] AS path
		FROM mes.ebom e
        INNER JOIN mes.part cp ON cp.id = e.child_part_id AND cp.deleted_by IS NULL
        WHERE e.part_id = original_part_id
          AND e.deleted_by IS NULL

        UNION ALL

        SELECT bt.child_part_id AS part_id, e.child_part_id, e.quantity, bt.path || e.child_part_id
        FROM mes.ebom e
        INNER JOIN bom_tree bt ON e.part_id = bt.child_part_id
        INNER JOIN mes.part cp ON cp.id = e.child_part_id AND cp.deleted_by IS NULL
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
