-- Table: mes.work_package
-- DROP TABLE IF EXISTS mes.work_package;

CREATE TABLE mes.work_package (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence SERIAL UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    number VARCHAR(255) UNIQUE NOT NULL DEFAULT application.generate_alphanumeric_sequence('WO-', currval('mes.work_package_sequence_seq')),  
    quantity INT NOT NULL,
    technician_id UUID,
    manager_id UUID,
    guide_id UUID,
    part_id UUID NOT NULL,
    product_id UUID,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    actual_start_date TIMESTAMPTZ,
    actual_end_date TIMESTAMPTZ,
    status VARCHAR(255) NOT NULL DEFAULT 'Pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(255),
    FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL,
    FOREIGN KEY (part_id) REFERENCES mes.part(id),
    FOREIGN KEY (product_id) REFERENCES mes.product(id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES application.user(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES application.user(id) ON DELETE SET NULL
);