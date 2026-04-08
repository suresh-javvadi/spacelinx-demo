-- Table: mes.part_type
-- DROP TABLE IF EXISTS mes.part_type;
 
CREATE TABLE mes.part_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,          
    part_number_prefix VARCHAR(3),	
	category VARCHAR(255),
    category_type VARCHAR(255),  
    part_type_category_id UUID, 
    part_level_id UUID,
    department VARCHAR(255),    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_visible_in_ui BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (part_type_category_id) REFERENCES  mes.part_type_category(id) ON DELETE SET NULL,
    FOREIGN KEY (part_level_id) REFERENCES  mes.part_level(id) ON DELETE SET NULL
);