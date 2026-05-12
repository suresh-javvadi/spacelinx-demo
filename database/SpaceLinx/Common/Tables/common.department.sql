CREATE TABLE common.department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_department_id UUID,
    head_of_department_user_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP,
    deleted_by VARCHAR(255),
    deleted_at TIMESTAMP,
    FOREIGN KEY (parent_department_id) REFERENCES common.department(id) ON DELETE SET NULL,
    FOREIGN KEY (head_of_department_user_id) REFERENCES application."user"(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_department_code_active
    ON common.department (code)
    WHERE deleted_at IS NULL;
