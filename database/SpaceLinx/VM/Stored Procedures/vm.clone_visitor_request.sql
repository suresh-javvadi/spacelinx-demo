CREATE OR REPLACE PROCEDURE vm.clone_visitor_request(
    IN original_request_id uuid,
    IN user_email text,
    IN status text,
    OUT new_request_id uuid)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    original_request RECORD;
BEGIN
    -- Validate the input status
    IF status NOT IN ('Requested', 'Approved') THEN
        RAISE EXCEPTION 'Invalid status: %. Supported statuses are Requested, Approved.', status;
    END IF;

    -- Get the original visitor request details
    SELECT * INTO original_request FROM vm.visitor_request WHERE id = original_request_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Visitor request does not exist for ID: %', original_request_id;
    END IF;

    -- Insert the new visitor request as a copy of the original request
    INSERT INTO vm.visitor_request (purpose, start_date, end_date, visitor_contact, no_of_guests, requested_by, approved_by, status, location, created_at, created_by)
    VALUES (
        'Copy of ' || original_request.purpose,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '10 hours',
        original_request.visitor_contact, 
        original_request.no_of_guests, 
        user_email,
        NULL, -- Replace with actual approver logic if needed
        status,
        original_request.location, 
        CURRENT_TIMESTAMP,
        user_email
    )
    RETURNING id INTO new_request_id;

    -- Log success
    RAISE NOTICE 'New visitor request created with ID: %', new_request_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Handle any unexpected errors
        RAISE EXCEPTION 'Error in clone_visitor_request: %', SQLERRM;
END;
$BODY$;
