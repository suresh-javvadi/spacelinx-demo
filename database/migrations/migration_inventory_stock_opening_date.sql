-- Migration: Add opening_date to sc.inventory_stock
-- Date: 2026-07-09
-- Work item: #2494
-- Records *as of when* a row's opening balance is effective, with time-of-day.
--   opening_date : TIMESTAMPTZ, nullable, no default.
-- Nullable with no default is deliberate: existing rows have no known opening
-- date, and a DEFAULT now() would stamp them with this script's run time --
-- fabricating data indistinguishable from a real seed. Opening rows are seeded
-- directly (opening_qty + opening_date); no API writes this column.
--
-- NOTE: sc.inventory_stock_report does NOT read this column. It still derives the
-- opening balance from the frozen opening_qty seed rolled forward from its
-- p_anchor parameter (default 2026-04-01). This column is inert until wired in.
--
-- Mirrors EF migration 20260709113052_AddOpeningDateToInventoryStock, which is what
-- the pipeline actually applies (see database/migrations/README.md). Keep in sync.
-- Idempotent — safe to re-run.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='opening_date') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN opening_date TIMESTAMPTZ;
    END IF;
END
$$;
