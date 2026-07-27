CREATE OR REPLACE PROCEDURE mes.clone_ebom(IN original_part_id uuid, IN new_part_id uuid, IN user_email text)
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

ALTER PROCEDURE mes.clone_ebom(uuid, uuid, text) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.clone_ebom(uuid, uuid, text) TO spacelinxuser;
