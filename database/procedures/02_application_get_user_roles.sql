CREATE OR REPLACE PROCEDURE application.get_user_roles(IN useremail character varying, IN appname character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if user exists and is active
    IF NOT EXISTS (
        SELECT 1
        FROM application.user u
        JOIN application.user_role ur ON u.id = ur.user_id
        JOIN application.role r ON ur.role_id = r.id
        JOIN application.app a ON r.app_id = a.id
        WHERE u.email = useremail
          AND a.app_name = appname
          AND u.is_active = TRUE
          AND a.is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'User not found or inactive';
    END IF;
 
    -- Display user roles using RAISE NOTICE for debugging/logging
    RAISE NOTICE 'User Roles: %', (
        SELECT json_agg(json_build_object(
            'user_id', u.id, 
            'first_name', u.first_name, 
            'last_name', u.last_name, 
            'email', u.email, 
            'role_id', ur.role_id, 
            'role_name', r.role_name
        ))
        FROM application.user u
        JOIN application.user_role ur ON u.id = ur.user_id
        JOIN application.role r ON ur.role_id = r.id
        JOIN application.app a ON r.app_id = a.id
        WHERE u.email = useremail
          AND a.app_name = appname
          AND u.is_active = TRUE
    );
 
END;
$$;

ALTER PROCEDURE application.get_user_roles(character varying, character varying) OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE application.get_user_roles(character varying, character varying) TO spacelinxuser;
