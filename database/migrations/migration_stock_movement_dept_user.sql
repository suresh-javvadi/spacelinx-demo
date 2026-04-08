-- Migration: Add department_id and assigned_user_id to stock_movement
-- Date: 2026-01-27

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='stock_movement' AND column_name='department_id') THEN
        ALTER TABLE sc.stock_movement ADD COLUMN department_id UUID;
        ALTER TABLE sc.stock_movement ADD CONSTRAINT fk_stock_movement_department FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='stock_movement' AND column_name='assigned_user_id') THEN
        ALTER TABLE sc.stock_movement ADD COLUMN assigned_user_id UUID;
        ALTER TABLE sc.stock_movement ADD CONSTRAINT fk_stock_movement_assigned_staff FOREIGN KEY (assigned_user_id) REFERENCES application.staff(id) ON DELETE SET NULL;
    END IF;
END
$$;
