CREATE OR REPLACE PROCEDURE mes.approve_eco(
	IN eco_entity_id uuid,
	IN user_email text)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    approver RECORD;
    eco_record RECORD;
    all_approved BOOLEAN;
BEGIN
    -- Fetch the ECO record
    SELECT * INTO eco_record
    FROM mes.eco
    WHERE id = eco_entity_id AND deleted_by IS NULL;
 
    IF eco_record IS NULL THEN
        RAISE EXCEPTION 'ECO record not found';
    END IF;
 
    IF eco_record.status != 'Submitted' THEN
        RAISE EXCEPTION 'ECO must be in Submitted status to Approve';
    END IF;
 
    -- Update the approver's status
    SELECT * INTO approver
    FROM application.approvals
    WHERE entity_type = 'Eco'
      AND entity_id = eco_entity_id
      AND approver_id = (
          SELECT id FROM application.users WHERE LOWER(email) = LOWER(user_email)
      )
      AND deleted_by IS NULL;
 
    IF approver IS NULL THEN
        RAISE EXCEPTION 'Approver not found';
    END IF;
 
    UPDATE application.approvals
    SET status = 'Approved',
        comment = approver.comment,
        acted_at = NOW(),
        updated_by = user_email,
        updated_at = NOW()
    WHERE id = approver.id;
 
    -- Check if all approvals are approved
    SELECT COUNT(*) = 0 INTO all_approved
    FROM application.approvals
    WHERE entity_type = 'Eco'
      AND entity_id = eco_entity_id
      AND deleted_by IS NULL
      AND status != 'Approved';
 
    IF all_approved THEN
        BEGIN
            -- Start transaction
            UPDATE mes.eco
            SET status = 'Approved',
                approved_date = NOW(),
                approved_by = 'System',
                updated_at = NOW(),
                updated_by = user_email
            WHERE id = eco_entity_id;
 
            -- Call release procedure
            CALL mes.release_eco(eco_entity_id, user_email);
 
            -- Insert into eco_log
            INSERT INTO mes.eco_log (
                eco_id, action, action_by, action_at,
                is_active, created_by, created_at
            )
            VALUES (
                eco_entity_id, 'Approved', user_email, NOW(),
                TRUE, user_email, NOW()
            );
        EXCEPTION
            WHEN OTHERS THEN
                RAISE EXCEPTION 'Error during ECO approval process: %', SQLERRM;
        END;
    END IF;
END;
$BODY$;