-- Migration: Add hsn_code to mes.part
-- Date: 2026-06-24
-- HSN (Harmonized System of Nomenclature) tax classification code used on invoices/GST.
-- Nullable / optional. Idempotent — safe to re-run.
 
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='mes' AND table_name='part' AND column_name='hsn_code') THEN
        ALTER TABLE mes.part ADD COLUMN hsn_code VARCHAR(50);
    END IF;
END
$$;
