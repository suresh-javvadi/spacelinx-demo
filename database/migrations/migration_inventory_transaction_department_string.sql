-- Migration: Change department_id (UUID FK) to department (string) for inventory_transaction
--            Change assigned_user_id FK from application.user to application.staff for inventory_stock and inventory_transaction
-- Date: 2026-01-28

DO $$
BEGIN
    -- 1. Drop department FK constraint from inventory_transaction
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_inventory_transaction_department' AND table_schema='sc') THEN
        ALTER TABLE sc.inventory_transaction DROP CONSTRAINT fk_inventory_transaction_department;
    END IF;

    -- 2. Drop department_id column from inventory_transaction
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_transaction' AND column_name='department_id') THEN
        ALTER TABLE sc.inventory_transaction DROP COLUMN department_id;
    END IF;

    -- 3. Add department (string) column to inventory_transaction
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_transaction' AND column_name='department') THEN
        ALTER TABLE sc.inventory_transaction ADD COLUMN department VARCHAR(255);
    END IF;

    -- 4. Drop old assigned_user_id FK from inventory_stock (references application.user)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='inventory_stock_assigned_user_id_fkey' AND table_schema='sc') THEN
        ALTER TABLE sc.inventory_stock DROP CONSTRAINT inventory_stock_assigned_user_id_fkey;
    END IF;

    -- 5. Add new assigned_user_id FK to inventory_stock (references application.staff)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_inventory_stock_assigned_staff' AND table_schema='sc') THEN
        ALTER TABLE sc.inventory_stock ADD CONSTRAINT fk_inventory_stock_assigned_staff
            FOREIGN KEY (assigned_user_id) REFERENCES application.staff(id) ON DELETE SET NULL;
    END IF;

    -- 6. Drop old assigned_user_id FK from inventory_transaction (references application.user)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_inventory_transaction_assigned_user' AND table_schema='sc') THEN
        ALTER TABLE sc.inventory_transaction DROP CONSTRAINT fk_inventory_transaction_assigned_user;
    END IF;

    -- 7. Add new assigned_user_id FK to inventory_transaction (references application.staff)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_inventory_transaction_assigned_staff' AND table_schema='sc') THEN
        ALTER TABLE sc.inventory_transaction ADD CONSTRAINT fk_inventory_transaction_assigned_staff
            FOREIGN KEY (assigned_user_id) REFERENCES application.staff(id) ON DELETE SET NULL;
    END IF;
END
$$;
