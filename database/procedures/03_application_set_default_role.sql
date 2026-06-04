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

ALTER PROCEDURE application.set_default_role(uuid, uuid, text) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE application.set_default_role(uuid, uuid, text) TO spacelinxuser;
