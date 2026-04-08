-- Migration: Add tracking, quantity breakdown, and associations to inventory_stock
-- Also: Create department table, add qty_returned to inventory_part
-- Date: 2026-01-26
-- Run with a database user that owns the tables (not spacelinxuser)

-- 1. Create Department table
CREATE TABLE IF NOT EXISTS common.department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP,
    deleted_by VARCHAR(255),
    deleted_at TIMESTAMP
);

-- 2. Alter sc.inventory_stock
DO $$
BEGIN
    -- Tracking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='tracking_type') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN tracking_type VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='tracking_id') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN tracking_id VARCHAR(100);
    END IF;

    -- Rename quantity to qty_onhand
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='quantity') THEN
        ALTER TABLE sc.inventory_stock RENAME COLUMN quantity TO qty_onhand;
    END IF;

    -- Quantity breakdown columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='qty_available') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN qty_available INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='qty_reserved') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN qty_reserved INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='qty_consumed') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN qty_consumed INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='qty_qc_pending') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN qty_qc_pending INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='qty_qc_failed') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN qty_qc_failed INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='qty_scrapped') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN qty_scrapped INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='qty_returned') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN qty_returned INT DEFAULT 0;
    END IF;

    -- Association columns with foreign keys
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='project_id') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN project_id UUID;
        ALTER TABLE sc.inventory_stock ADD CONSTRAINT inventory_stock_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='department_id') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN department_id UUID;
        ALTER TABLE sc.inventory_stock ADD CONSTRAINT inventory_stock_department_id_fkey FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='assigned_user_id') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN assigned_user_id UUID;
        ALTER TABLE sc.inventory_stock ADD CONSTRAINT inventory_stock_assigned_user_id_fkey FOREIGN KEY (assigned_user_id) REFERENCES application.user(id) ON DELETE SET NULL;
    END IF;

    -- 3. Add qty_returned to sc.inventory_part
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_part' AND column_name='qty_returned') THEN
        ALTER TABLE sc.inventory_part ADD COLUMN qty_returned INT DEFAULT 0;
    END IF;
END
$$;

-- 4. Add project_id, department_id, assigned_user_id to sc.inventory_transaction
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_transaction' AND column_name='project_id') THEN
        ALTER TABLE sc.inventory_transaction ADD COLUMN project_id UUID;
        ALTER TABLE sc.inventory_transaction ADD CONSTRAINT fk_inventory_transaction_project FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_transaction' AND column_name='department_id') THEN
        ALTER TABLE sc.inventory_transaction ADD COLUMN department_id UUID;
        ALTER TABLE sc.inventory_transaction ADD CONSTRAINT fk_inventory_transaction_department FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_transaction' AND column_name='assigned_user_id') THEN
        ALTER TABLE sc.inventory_transaction ADD COLUMN assigned_user_id UUID;
        ALTER TABLE sc.inventory_transaction ADD CONSTRAINT fk_inventory_transaction_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES application.user(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- 5. Grant permissions to spacelinxuser (if needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON common.department TO spacelinxuser;
GRANT USAGE ON SCHEMA common TO spacelinxuser;
