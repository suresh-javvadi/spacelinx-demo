-- Table: common.image
--DROP TABLE IF EXISTS common.image;
 
CREATE TABLE common.image(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id UUID,
    file_name VARCHAR(255) NOT NULL,                                        
    file_extension VARCHAR(50),                                     
    file_size INT NOT NULL,                                                   
    file_path VARCHAR(255) NOT NULL,                                          
    file_relative_path VARCHAR(255) NOT NULL,                                                                                          
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255)
);