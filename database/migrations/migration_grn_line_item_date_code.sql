-- Migration: Add date_code to sc.grn_line_item
-- Date: 2026-06-29
-- Date Code is captured during QC for electronic-component traceability,
-- replacing the Manufacturing/Expiry date inputs in the QC UI.
-- Nullable / optional. Idempotent — safe to re-run.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='grn_line_item' AND column_name='date_code') THEN
        ALTER TABLE sc.grn_line_item ADD COLUMN date_code VARCHAR(100);
    END IF;
END
$$;
