-- Table: mes.part_type
-- DROP TABLE IF EXISTS mes.part_type;

CREATE TABLE mes.part_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                                              
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)                
);

-- Table: mes.unit_of_measure
-- DROP TABLE IF EXISTS mes.unit_of_measure;

CREATE TABLE mes.unit_of_measure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, 
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);

-- Table: mes.part
-- DROP TABLE IF EXISTS mes.part;

CREATE TABLE mes.part (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    part_type_id UUID NOT NULL,
    revision VARCHAR(255),
    unit_of_measure_id UUID,
    make_buy INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_serial_number_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (part_type_id) REFERENCES mes.part_type(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_of_measure_id) REFERENCES mes.unit_of_measure(id) ON DELETE SET NULL
);

-- Table: mes.ebom
-- DROP TABLE IF EXISTS mes.ebom;

CREATE TABLE mes.ebom(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID NOT NULL,
    child_part_id UUID NOT NULL,
    quantity INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    FOREIGN KEY(part_id) REFERENCES mes.part(id),
    FOREIGN KEY(child_part_id) REFERENCES mes.part(id),
    UNIQUE (part_id, child_part_id)
);

-- Table: mes.tool_type
-- DROP TABLE IF EXISTS mes.tool_type;

CREATE TABLE mes.tool_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                                              
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)                
);

-- Table: mes.tool
-- DROP TABLE IF EXISTS mes.tool;

CREATE TABLE mes.tool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL, 
    tool_type_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (tool_type_id) REFERENCES mes.tool_type(id) ON DELETE SET NULL
);

-- Table: mes.machine_type
-- DROP TABLE IF EXISTS mes.machine_type;

CREATE TABLE mes.machine_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                                              
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)                
);

-- Table: mes.machine
-- DROP TABLE IF EXISTS mes.machine;

CREATE TABLE mes.machine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,     
    machine_type_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    FOREIGN KEY (machine_type_id) REFERENCES mes.machine_type(id) ON DELETE SET NULL
);

-- Table: mes.news_type
-- DROP TABLE IF EXISTS mes.newstype;

CREATE TABLE mes.news_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                                              
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)                
);

-- Table: mes.news
-- DROP TABLE IF EXISTS mes.news;

CREATE TABLE mes.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) UNIQUE NOT NULL,     
    news_type_id UUID NOT NULL,
    hyperlink VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    FOREIGN KEY (news_type_id) REFERENCES mes.news_type(id) ON DELETE SET NULL
);

-- Table: mes.location
-- DROP TABLE IF EXISTS mes.location;

CREATE TABLE mes.location (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,                                              
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)                
);

-- Table: mes.platform
-- DROP TABLE IF EXISTS mes.platform;

CREATE TABLE mes.platform
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)
);

-- Table: mes.guide_type
-- DROP TABLE IF EXISTS mes.guide_type;

CREATE TABLE mes.guide_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                                              
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)                
);

-- Table: mes.guide
-- DROP TABLE IF EXISTS mes.guide;

CREATE TABLE mes.guide (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,     
    sequence SERIAL UNIQUE NOT NULL,
    number VARCHAR(255) NOT NULL DEFAULT application.generate_alphanumeric_sequence('GD-', currval('mes.guide_sequence_seq')),     
    platform_id UUID,
    part_id UUID NOT NULL,
    guide_type_id UUID NOT NULL,
    clone_from_id UUID,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(255) NOT NULL DEFAULT 'Draft',
    check_out_by VARCHAR(255), 
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (platform_id) REFERENCES mes.platform(id) ON DELETE SET NULL,
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (guide_type_id) REFERENCES mes.guide_type(id) ON DELETE SET NULL,
    FOREIGN KEY (clone_from_id) REFERENCES mes.guide(id) ON DELETE SET NULL,
    UNIQUE (part_id, number, version)
);

-- Table: mes.image
-- DROP TABLE IF EXISTS mes.image;

CREATE TABLE mes.image (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                         
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

-- Table: mes.video
-- DROP TABLE IF EXISTS mes.image;

CREATE TABLE mes.video (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                         
    file_name VARCHAR(255) NOT NULL,   
    file_relative_path VARCHAR(255) NOT NULL,                                                                                          
    file_extension VARCHAR(50) NOT NULL, 
    file_path VARCHAR(255) NOT NULL,                                          
    file_size INT NOT NULL,                                                   
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255)                                     
);

-- Table: mes.guide_step
-- DROP TABLE IF EXISTS mes.guide_step;

CREATE TABLE mes.guide_step (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    guide_id UUID NOT NULL,
    image_id UUID,
    video_id UUID,
    sequence INT NOT NULL,
    comment Text,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES mes.image(id) ON DELETE SET NULL,
    FOREIGN KEY (video_id) REFERENCES mes.video(id) ON DELETE SET NULL
);

-- Table: mes.guide_step_equipment
-- DROP TABLE IF EXISTS mes.guide_step_equipment;

CREATE TABLE mes.guide_step_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_type VARCHAR(255) NOT NULL,     
    part_id UUID,
    tool_id UUID,
    machine_id UUID,
    quantity INT NOT NULL,
    guide_step_id UUID NOT NULL,
    guide_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    FOREIGN KEY (guide_step_id) REFERENCES mes.guide_step(id) ON DELETE CASCADE,
    FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (tool_id) REFERENCES mes.tool(id) ON DELETE SET NULL,
    FOREIGN KEY (machine_id) REFERENCES mes.machine(id) ON DELETE SET NULL
);

-- Table: mes.guide_step_task
-- DROP TABLE IF EXISTS mes.guide_step_task;

CREATE TABLE mes.guide_step_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    taskdetails JSON,
    description Text,
    ismandatory INT NOT NULL,
    guide_step_id UUID NOT NULL,
    guide_id UUID NOT NULL,
    sequence INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    FOREIGN KEY (guide_step_id) REFERENCES mes.guide_step(id) ON DELETE CASCADE,
    FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE
);

-- Table: mes.product
-- DROP TABLE IF EXISTS mes.product;

CREATE TABLE mes.product (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sequence SERIAL UNIQUE NOT NULL,
    number VARCHAR(255) UNIQUE NOT NULL DEFAULT application.generate_alphanumeric_sequence('PD-', currval('mes.product_sequence_seq')), 
    platform_id UUID,
    part_id UUID NOT NULL,
    image_id UUID,
    description Text,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (platform_id) REFERENCES mes.platform(id) ON DELETE SET NULL,
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (image_id) REFERENCES mes.image(id) ON DELETE SET NULL
);

-- Table: mes.material_kit
-- DROP TABLE IF EXISTS mes.material_kit;

CREATE TABLE mes.material_kit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sequence SERIAL UNIQUE NOT NULL,
    number VARCHAR(255) UNIQUE NOT NULL DEFAULT application.generate_alphanumeric_sequence('KIT-', currval('mes.material_kit_sequence_seq')), 
    part_id UUID NOT NULL,
    location_id UUID NOT NULL,
    image_id UUID,
    quantity INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL,
    FOREIGN KEY (image_id) REFERENCES mes.image(id) ON DELETE SET NULL
);

-- Table: mes.kit
-- DROP TABLE IF EXISTS mes.kit;

CREATE TABLE mes.kit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    number VARCHAR(255) UNIQUE NOT NULL,
    part_id UUID NOT NULL,
    location_id UUID,
    material_kit_id UUID,
    status VARCHAR(255) NOT NULL DEFAULT 'Pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL,
    FOREIGN KEY (material_kit_id) REFERENCES mes.material_kit(id) ON DELETE SET NULL
);

-- Table: mes.kit_serial
-- DROP TABLE IF EXISTS mes.kit_serial;
 
CREATE TABLE mes.kit_serial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID NOT NULL,
    part_id UUID NOT NULL,
    serialno varchar(255),
    status varchar(255) NOT NULL DEFAULT 'Unconsumed',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL,
    UNIQUE (kit_id, part_id, serialno)
);

-- Table: mes.kit_bom_comment
-- DROP TABLE IF EXISTS mes.kit_bom_comment;
 
CREATE TABLE mes.kit_bom_comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID NOT NULL,
    part_id UUID NOT NULL,
    comments varchar(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
    FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL
);

-- Table: mes.work_order
-- DROP TABLE IF EXISTS mes.work_order;

CREATE TABLE mes.work_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence SERIAL UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    number VARCHAR(255) UNIQUE NOT NULL DEFAULT application.generate_alphanumeric_sequence('WO-', currval('mes.work_order_sequence_seq')),     
    status VARCHAR(255) NOT NULL DEFAULT 'Pending',     
    kit_id UUID UNIQUE,
    technician_id UUID,
    manager_id UUID,
    guide_id UUID NOT NULL,
    part_id UUID NOT NULL,
    product_id UUID,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    actual_start_date TIMESTAMPTZ,
    actual_end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255), 
    FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL,
    FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL,
    FOREIGN KEY (part_id) REFERENCES mes.part(id),
    FOREIGN KEY (product_id) REFERENCES mes.product(id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES application.user(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES application.user(id) ON DELETE SET NULL
);

-- Table: mes.work_order_step
-- DROP TABLE IF EXISTS mes.work_order_step;

CREATE TABLE mes.work_order_step (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL,
    guide_step_id UUID NOT NULL, 
    technician_id UUID,
    manager_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    execution_time INTERVAL,     
    captured_time INTERVAL,       
    image_id UUID,
    comment varchar(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    FOREIGN KEY(work_order_id) REFERENCES mes.work_order(id) ON DELETE CASCADE,
    FOREIGN KEY(guide_step_id) REFERENCES mes.guide_step(id),
    FOREIGN KEY(image_id) REFERENCES mes.image(id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES application.user(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES application.user(id) ON DELETE SET NULL
);

-- Table: mes.work_order_task
-- DROP TABLE IF EXISTS mes.work_order_task;

CREATE TABLE mes.work_order_task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL,
    guide_step_task_id UUID NOT NULL,
    task_response JSON,
    status VARCHAR(255) NOT NULL DEFAULT 'Pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),   
    FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE CASCADE,
    FOREIGN KEY (guide_step_task_id) REFERENCES mes.guide_step_task(id),
    UNIQUE (work_order_id, guide_step_task_id)
);