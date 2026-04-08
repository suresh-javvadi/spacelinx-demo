CREATE OR REPLACE PROCEDURE application.set_default_role(
  IN p_user_id UUID,
  IN p_role_id UUID,
  IN p_user_email TEXT
)
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
