-- =============================================
-- SpaceLinx Tender Management ROLLBACK Script
-- Description: Removes Tender/RFQ management system
-- Date: 2025-12-25
-- WARNING: This will permanently delete all tender data!
-- =============================================

-- =============================================
-- PART 1: Drop Tender Number Generation Function
-- =============================================

DROP FUNCTION IF EXISTS sc.generate_tender_number();

-- =============================================
-- PART 2: Drop Tender Tables (in correct order for FK dependencies)
-- =============================================

-- Drop child tables first
DROP TABLE IF EXISTS sc.tender_quotation_line_item CASCADE;
DROP TABLE IF EXISTS sc.tender_quotation CASCADE;
DROP TABLE IF EXISTS sc.tender_vendor CASCADE;
DROP TABLE IF EXISTS sc.tender_line_item CASCADE;
DROP TABLE IF EXISTS sc.tender CASCADE;

-- =============================================
-- PART 3: Rollback company_part Changes
-- =============================================

-- Drop foreign key first
ALTER TABLE sc.company_part
DROP CONSTRAINT IF EXISTS company_part_currency_id_fkey;

-- Drop indexes
DROP INDEX IF EXISTS sc.idx_company_part_is_preferred;
DROP INDEX IF EXISTS sc.idx_company_part_vendor_part_number;

-- Drop columns added for PLM
ALTER TABLE sc.company_part
DROP COLUMN IF EXISTS unit_price,
DROP COLUMN IF EXISTS currency_id,
DROP COLUMN IF EXISTS lead_time_days,
DROP COLUMN IF EXISTS min_order_quantity,
DROP COLUMN IF EXISTS order_multiple,
DROP COLUMN IF EXISTS is_preferred,
DROP COLUMN IF EXISTS valid_from,
DROP COLUMN IF EXISTS valid_to,
DROP COLUMN IF EXISTS vendor_part_number,
DROP COLUMN IF EXISTS manufacturer_part_number,
DROP COLUMN IF EXISTS notes;

-- =============================================
-- End of Rollback Script
-- =============================================
