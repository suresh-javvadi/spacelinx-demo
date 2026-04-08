-- Table: vm.visitor_request
-- DROP TABLE IF EXISTS vm.visitor_request;

CREATE TABLE vm.visitor_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purpose VARCHAR(500) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    visitor_contact VARCHAR(100),
    no_of_guests INT NOT NULL DEFAULT 1,
    requested_by VARCHAR(200),
    approved_by VARCHAR(200),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Requested', 'Approved', 'Rejected', 'Cancelled', CheckedIn ,'Completed')),
    checkin_date TIMESTAMPTZ,
    checkout_date TIMESTAMPTZ,
    Location VARCHAR(200) DEFAULT NULL CHECK (Location IN ('Bld 1, 1st Floor', 'Bld 1, 2nd Floor', 'Bld 1, 3rd Floor', 'Bld 1, 4th Floor', 'Bld 2, 2nd Floor', 'Bld 3, 3rd Floor')),
    needs_accomodation BOOLEAN DEFAULT FALSE,
    needs_lunch BOOLEAN DEFAULT FALSE,
    needs_clean_room_access BOOLEAN DEFAULT FALSE,
    other_details TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);