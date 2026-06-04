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

ALTER FUNCTION pm.create_default_board_columns(uuid, character varying) OWNER TO spacelinxadmin;
GRANT EXECUTE ON FUNCTION pm.create_default_board_columns(uuid, character varying) TO spacelinxuser;
