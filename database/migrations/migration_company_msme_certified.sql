-- Migration: Add is_msme_certified to sc.company
-- Date: 2026-07-28
-- Adds one nullable column plus a vendor-only guard to the company/vendor header,
-- populated by the Create/Edit Vendor form:
--   is_msme_certified : BOOLEAN, nullable. Vendor-only "MSME Certified?" Yes/No answer.
--                        When true, the frontend requires an MSME certificate document
--                        to be attached (via sc.document, entity_type = 'Vendors') at
--                        vendor-creation time; this is enforced in application code, not
--                        by a DB constraint, since documents live in a separate polymorphic
--                        table with no FK back to company.
--   company_msme_check : CHECK constraint mirroring the existing company_pan_check --
--                        non-vendors must have is_msme_certified IS NULL.
--
-- Mirrors EF migration 20260728103518_AddIsMsmeCertifiedToCompany,
-- which is what the pipeline actually applies (see database/migrations/README.md).
-- Keep in sync. Idempotent -- safe to re-run.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='company' AND column_name='is_msme_certified') THEN
        ALTER TABLE sc.company ADD COLUMN is_msme_certified BOOLEAN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema='sc' AND table_name='company' AND constraint_name='company_msme_check') THEN
        ALTER TABLE sc.company
            ADD CONSTRAINT company_msme_check CHECK ((is_vendor = true) OR (is_msme_certified IS NULL));
    END IF;
END
$$;
