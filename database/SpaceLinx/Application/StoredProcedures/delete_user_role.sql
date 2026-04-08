-- PROCEDURE: application.delete_user_role(uuid, uuid, text)

-- DROP PROCEDURE IF EXISTS application.delete_user_role(uuid, uuid, text);

CREATE OR REPLACE PROCEDURE application.delete_user_role(
	IN target_user_id uuid,
	IN target_app_id uuid,
	IN user_email text)

LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
    -- Soft delete user roles for the specified application
    UPDATE application.user_role
    SET is_active = false,
        deleted_at = NOW(),
        deleted_by = user_email
    WHERE user_id = target_user_id
      AND role_id IN (
          SELECT id
          FROM application.role
          WHERE app_id = target_app_id
      )
      AND is_active = true;

    -- Check if the user still has any active roles across all applications
    IF NOT EXISTS (
        SELECT 1
        FROM application.user_role ur
        WHERE ur.user_id = target_user_id
          AND ur.is_active = true
    ) THEN
        -- Soft delete the user if no active roles remain
        UPDATE application.user
        SET is_active = false,
            deleted_at = NOW(),
            deleted_by = user_email
        WHERE id = target_user_id
          AND is_active = true;

        RAISE NOTICE 'User % soft-deleted as no active roles remain', target_user_id;
    ELSE
        RAISE NOTICE 'User % still has active roles in other applications and was not deleted', target_user_id;
    END IF;
END;
$BODY$;