-- Table: application.user
-- DROP TABLE IF EXISTS application.user;

CREATE TABLE application.user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    user_number SERIAL UNIQUE NOT NULL,             
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,              
    phone VARCHAR(255),                             
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,          
    updated_by VARCHAR(255)                          
);

-- Table: application.role
-- DROP TABLE IF EXISTS application.role;

CREATE TABLE application.role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),   
    role_number SERIAL UNIQUE NOT NULL,              
    role_name VARCHAR(255) NOT NULL,          		 
    role_description TEXT,                           
    is_active BOOLEAN NOT NULL DEFAULT TRUE,         
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,          
    updated_by VARCHAR(255),                          
    UNIQUE (role_name)                  
);

-- Table: application.user_role
-- DROP TABLE IF EXISTS application.user_role;

CREATE TABLE application.user_role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),   
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,          
    updated_by VARCHAR(255),         
    FOREIGN KEY (user_id) REFERENCES application.user(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES application.role(id) ON DELETE CASCADE
);

-- Table: application.reference_type
-- DROP TABLE IF EXISTS application.reference_type;

CREATE TABLE application.reference_type
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    application_name VARCHAR(255) NOT NULL DEFAULT 'All',
    description TEXT,
    values JSON NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)                          
)