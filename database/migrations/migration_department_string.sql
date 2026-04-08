-- Migration: Change department_id (UUID FK) to department (string) for inventory_stock
--            Drop department_id from stock_movement (stock_movement already has a 'department' string column)
-- Date: 2026-01-28

DO $$
BEGIN
    -- 1. Drop department_id from stock_movement (if it exists from previous migration)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_stock_movement_department' AND table_schema='sc') THEN
        ALTER TABLE sc.stock_movement DROP CONSTRAINT fk_stock_movement_department;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='stock_movement' AND column_name='department_id') THEN
        ALTER TABLE sc.stock_movement DROP COLUMN department_id;
    END IF;

    -- 2. Drop department_id FK and column from inventory_stock
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='inventory_stock_department_id_fkey' AND table_schema='sc') THEN
        ALTER TABLE sc.inventory_stock DROP CONSTRAINT inventory_stock_department_id_fkey;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='department_id') THEN
        ALTER TABLE sc.inventory_stock DROP COLUMN department_id;
    END IF;

    -- 3. Add department (string) column to inventory_stock
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='department') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN department VARCHAR(255);
    END IF;
END
$$;
