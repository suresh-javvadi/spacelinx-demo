-- Table: pm.project
-- DROP TABLE IF EXISTS pm.project;

CREATE TABLE pm.project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    project_code VARCHAR(255) NOT NULL DEFAULT pm.generate_project_code(),
    name VARCHAR(255) NOT NULL,  
    description TEXT,
    program_id UUID,
    project_manager_id UUID,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status VARCHAR(255),
    budget DECIMAL(18, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,         
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,          
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY(program_id) REFERENCES pm.program(id) ON DELETE SET NULL,
    FOREIGN KEY(project_manager_id) REFERENCES application.user(id) ON DELETE SET NULL,
);