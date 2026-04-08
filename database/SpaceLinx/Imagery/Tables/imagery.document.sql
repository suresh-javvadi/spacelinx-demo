-- Table: imagery.document
-- DROP TABLE IF EXISTS imagery.document;
 
CREATE TABLE imagery.document(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, 
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,                                        
    file_extension VARCHAR(50) NOT NULL,                                     
    file_size INT NOT NULL,                                                   
    file_path VARCHAR(255) NOT NULL,                                          
    file_relative_path VARCHAR(255) NOT NULL,                                                                                          
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)   
);