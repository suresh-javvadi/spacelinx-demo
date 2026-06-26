-- Migration: Add opening_qty / opening_price to sc.inventory_stock
-- Date: 2026-06-26
-- Accumulate-only "opening balance" figures stamped when goods pass QC (GRN finalize).
--   opening_qty   : lifetime sum of QC-passed received units (never reduced by consumption/issue/scrap).
--   opening_price : lifetime sum of (accepted_qty * po_line_item.unit_price) for those receipts.
-- Both default to 0; existing rows are NOT back-filled (accumulation starts from deployment forward).
-- Idempotent — safe to re-run.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='opening_qty') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN opening_qty INT NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='opening_price') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN opening_price NUMERIC(18,4) DEFAULT 0;
    END IF;
END
$$;
