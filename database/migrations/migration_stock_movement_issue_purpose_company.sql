-- Migration: Add issue_purpose and company to sc.stock_movement
-- Date: 2026-07-14
-- Adds two nullable columns to the stock movement header, used only by the
-- "Issued" movement type in the Create/Edit Stock Movement dialog:
--   issue_purpose : VARCHAR(255), nullable. Backed by the issue_purpose OptionSet
--                   (Testing / Assembly / R&D / Rework); stored as free text like
--                   the existing `department` column.
--   company_id    : UUID, nullable, FK -> sc.company(id) ON DELETE SET NULL.
--                   Reuses the existing vendor/company list.
--
-- Both are nullable with no default: only Issue-type movements populate them, and
-- existing rows have no such data.
--
-- Mirrors EF migration 20260713064724_AddIssuePurposeAndCompanyToStockMovement,
-- which is what the pipeline actually applies (see database/migrations/README.md).
-- Keep in sync. Idempotent -- safe to re-run.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='stock_movement' AND column_name='issue_purpose') THEN
        ALTER TABLE sc.stock_movement ADD COLUMN issue_purpose VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='stock_movement' AND column_name='company_id') THEN
        ALTER TABLE sc.stock_movement ADD COLUMN company_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema='sc' AND table_name='stock_movement' AND constraint_name='stock_movement_company_id_fkey') THEN
        ALTER TABLE sc.stock_movement
            ADD CONSTRAINT stock_movement_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='sc' AND indexname='IX_stock_movement_company_id') THEN
        CREATE INDEX "IX_stock_movement_company_id" ON sc.stock_movement USING btree (company_id);
    END IF;
END
$$;
