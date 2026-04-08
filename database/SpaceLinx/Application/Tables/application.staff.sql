CREATE TABLE application.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255),
    organization_id UUID NOT NULL,
    manager_id UUID, -- id of user
    staff_number VARCHAR(50),
    job_title VARCHAR(255),
    employment_start_date DATE,
    employment_end_date DATE,
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES application.organization(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES application.user(id) ON DELETE SET NULL
);