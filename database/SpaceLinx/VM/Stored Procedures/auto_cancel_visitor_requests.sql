CREATE OR REPLACE PROCEDURE auto_cancel_visitor_requests()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update the visitor requests where end_date has passed and status is Requested or Approved
    UPDATE vm.visitor_request
    SET status = 'Cancelled',
        updated_at = CURRENT_TIMESTAMP,
        updated_by = 'System' -- Set 'System' to indicate auto-cancellation
    WHERE end_date < NOW()
      AND status IN ('Requested', 'Approved');
END;
$$;
