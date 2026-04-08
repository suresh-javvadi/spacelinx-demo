-- Migration: Add location_id and bin_id to inventory_part
-- Date: 2026-01-27

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_part' AND column_name='location_id') THEN
        ALTER TABLE sc.inventory_part ADD COLUMN location_id UUID;
        ALTER TABLE sc.inventory_part ADD CONSTRAINT inventory_part_location_id_fkey FOREIGN KEY (location_id) REFERENCES common.location(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_part' AND column_name='bin_id') THEN
        ALTER TABLE sc.inventory_part ADD COLUMN bin_id UUID;
        ALTER TABLE sc.inventory_part ADD CONSTRAINT inventory_part_bin_id_fkey FOREIGN KEY (bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL;
    END IF;
END
$$;
