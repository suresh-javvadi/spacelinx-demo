-- =============================================
-- SpaceLinx Tender Management Migration Script
-- Description: Adds Tender/RFQ management system
-- Date: 2025-12-25
-- =============================================

-- =============================================
-- PART 1: ALTER sc.company_part - Add PLM Industry Standard Fields
-- =============================================

-- Add new columns to company_part table
ALTER TABLE sc.company_part
ADD COLUMN IF NOT EXISTS unit_price NUMERIC(18,4),
ADD COLUMN IF NOT EXISTS currency_id UUID,
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER,
ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER,
ADD COLUMN IF NOT EXISTS order_multiple INTEGER,
ADD COLUMN IF NOT EXISTS is_preferred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS valid_from DATE,
ADD COLUMN IF NOT EXISTS valid_to DATE,
ADD COLUMN IF NOT EXISTS vendor_part_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS manufacturer_part_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add foreign key for currency
ALTER TABLE sc.company_part
ADD CONSTRAINT company_part_currency_id_fkey
FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;

-- Create index on is_preferred for quick lookups
CREATE INDEX IF NOT EXISTS idx_company_part_is_preferred ON sc.company_part(is_preferred) WHERE is_preferred = TRUE;

-- Create index on vendor_part_number for lookups
CREATE INDEX IF NOT EXISTS idx_company_part_vendor_part_number ON sc.company_part(vendor_part_number);

-- =============================================
-- PART 2: CREATE sc.tender - Main Tender Table
-- =============================================

CREATE TABLE IF NOT EXISTS sc.tender (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_number VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Draft',
    requisition_id UUID,
    project_id UUID,
    publish_date DATE,
    closing_date DATE NOT NULL,
    approved_by VARCHAR(255),
    approved_date TIMESTAMP WITH TIME ZONE,
    awarded_vendor_id UUID,
    awarded_date TIMESTAMP WITH TIME ZONE,
    awarded_by VARCHAR(255),
    buyer_id UUID,
    terms TEXT,
    payment_term_id UUID,
    currency_id UUID,
    rejected_by VARCHAR(255),
    rejected_date TIMESTAMP WITH TIME ZONE,
    approver_comment TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255),

    CONSTRAINT tender_number_key UNIQUE (tender_number)
);

-- Add foreign keys for tender
ALTER TABLE sc.tender
ADD CONSTRAINT tender_requisition_id_fkey
    FOREIGN KEY (requisition_id) REFERENCES sc.requisition(id) ON DELETE SET NULL,
ADD CONSTRAINT tender_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL,
ADD CONSTRAINT tender_awarded_vendor_id_fkey
    FOREIGN KEY (awarded_vendor_id) REFERENCES sc.company(id) ON DELETE SET NULL,
ADD CONSTRAINT tender_buyer_id_fkey
    FOREIGN KEY (buyer_id) REFERENCES mes.staff(id) ON DELETE SET NULL,
ADD CONSTRAINT tender_payment_term_id_fkey
    FOREIGN KEY (payment_term_id) REFERENCES common.payment_term(id) ON DELETE SET NULL,
ADD CONSTRAINT tender_currency_id_fkey
    FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;

-- Create indexes for tender
CREATE INDEX IF NOT EXISTS idx_tender_status ON sc.tender(status);
CREATE INDEX IF NOT EXISTS idx_tender_requisition_id ON sc.tender(requisition_id);
CREATE INDEX IF NOT EXISTS idx_tender_project_id ON sc.tender(project_id);
CREATE INDEX IF NOT EXISTS idx_tender_buyer_id ON sc.tender(buyer_id);
CREATE INDEX IF NOT EXISTS idx_tender_closing_date ON sc.tender(closing_date);
CREATE INDEX IF NOT EXISTS idx_tender_deleted_by ON sc.tender(deleted_by) WHERE deleted_by IS NULL;

-- =============================================
-- PART 3: CREATE sc.tender_line_item
-- =============================================

CREATE TABLE IF NOT EXISTS sc.tender_line_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL,
    part_id UUID,
    quantity INTEGER NOT NULL,
    unit_of_measure_id UUID,
    description TEXT,
    specifications TEXT,
    line_number INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Add foreign keys for tender_line_item
ALTER TABLE sc.tender_line_item
ADD CONSTRAINT tender_line_item_tender_id_fkey
    FOREIGN KEY (tender_id) REFERENCES sc.tender(id) ON DELETE CASCADE,
ADD CONSTRAINT tender_line_item_part_id_fkey
    FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL,
ADD CONSTRAINT tender_line_item_uom_id_fkey
    FOREIGN KEY (unit_of_measure_id) REFERENCES common.unit_of_measure(id) ON DELETE SET NULL;

-- Create indexes for tender_line_item
CREATE INDEX IF NOT EXISTS idx_tender_line_item_tender_id ON sc.tender_line_item(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_line_item_part_id ON sc.tender_line_item(part_id);
CREATE INDEX IF NOT EXISTS idx_tender_line_item_deleted_by ON sc.tender_line_item(deleted_by) WHERE deleted_by IS NULL;

-- =============================================
-- PART 4: CREATE sc.tender_vendor (Invited Vendors)
-- =============================================

CREATE TABLE IF NOT EXISTS sc.tender_vendor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL,
    company_id UUID,
    invited_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    response_deadline DATE,
    status VARCHAR(50) DEFAULT 'Invited',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Add foreign keys for tender_vendor
ALTER TABLE sc.tender_vendor
ADD CONSTRAINT tender_vendor_tender_id_fkey
    FOREIGN KEY (tender_id) REFERENCES sc.tender(id) ON DELETE CASCADE,
ADD CONSTRAINT tender_vendor_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;

-- Create indexes for tender_vendor
CREATE INDEX IF NOT EXISTS idx_tender_vendor_tender_id ON sc.tender_vendor(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_vendor_company_id ON sc.tender_vendor(company_id);
CREATE INDEX IF NOT EXISTS idx_tender_vendor_status ON sc.tender_vendor(status);
CREATE INDEX IF NOT EXISTS idx_tender_vendor_deleted_by ON sc.tender_vendor(deleted_by) WHERE deleted_by IS NULL;

-- Create unique constraint to prevent duplicate vendor invitations
CREATE UNIQUE INDEX IF NOT EXISTS idx_tender_vendor_unique
ON sc.tender_vendor(tender_id, company_id) WHERE deleted_by IS NULL;

-- =============================================
-- PART 5: CREATE sc.tender_quotation (Vendor Responses)
-- =============================================

CREATE TABLE IF NOT EXISTS sc.tender_quotation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL,
    company_id UUID,
    quotation_number VARCHAR(100),
    quotation_date DATE NOT NULL,
    valid_until DATE,
    total_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    currency_id UUID,
    lead_time_days INTEGER,
    notes TEXT,
    terms_and_conditions TEXT,
    document_id UUID,
    is_selected BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Add foreign keys for tender_quotation
ALTER TABLE sc.tender_quotation
ADD CONSTRAINT tender_quotation_tender_id_fkey
    FOREIGN KEY (tender_id) REFERENCES sc.tender(id) ON DELETE CASCADE,
ADD CONSTRAINT tender_quotation_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL,
ADD CONSTRAINT tender_quotation_currency_id_fkey
    FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL,
ADD CONSTRAINT tender_quotation_document_id_fkey
    FOREIGN KEY (document_id) REFERENCES common.document(id) ON DELETE SET NULL;

-- Create indexes for tender_quotation
CREATE INDEX IF NOT EXISTS idx_tender_quotation_tender_id ON sc.tender_quotation(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_quotation_company_id ON sc.tender_quotation(company_id);
CREATE INDEX IF NOT EXISTS idx_tender_quotation_is_selected ON sc.tender_quotation(is_selected) WHERE is_selected = TRUE;
CREATE INDEX IF NOT EXISTS idx_tender_quotation_deleted_by ON sc.tender_quotation(deleted_by) WHERE deleted_by IS NULL;

-- =============================================
-- PART 6: CREATE sc.tender_quotation_line_item
-- =============================================

CREATE TABLE IF NOT EXISTS sc.tender_quotation_line_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_quotation_id UUID NOT NULL,
    tender_line_item_id UUID,
    unit_price NUMERIC(18,4) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(18,4) NOT NULL DEFAULT 0,
    lead_time_days INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Add foreign keys for tender_quotation_line_item
ALTER TABLE sc.tender_quotation_line_item
ADD CONSTRAINT tender_quotation_line_item_quotation_id_fkey
    FOREIGN KEY (tender_quotation_id) REFERENCES sc.tender_quotation(id) ON DELETE CASCADE,
ADD CONSTRAINT tender_quotation_line_item_line_item_id_fkey
    FOREIGN KEY (tender_line_item_id) REFERENCES sc.tender_line_item(id) ON DELETE SET NULL;

-- Create indexes for tender_quotation_line_item
CREATE INDEX IF NOT EXISTS idx_tender_quotation_line_item_quotation_id ON sc.tender_quotation_line_item(tender_quotation_id);
CREATE INDEX IF NOT EXISTS idx_tender_quotation_line_item_line_item_id ON sc.tender_quotation_line_item(tender_line_item_id);
CREATE INDEX IF NOT EXISTS idx_tender_quotation_line_item_deleted_by ON sc.tender_quotation_line_item(deleted_by) WHERE deleted_by IS NULL;

-- =============================================
-- PART 7: CREATE Tender Number Generation Function
-- =============================================

CREATE OR REPLACE FUNCTION sc.generate_tender_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_seq INT;
    current_year VARCHAR(4);
    prefix VARCHAR(10);
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    prefix := 'TND-' || current_year || '-';

    SELECT COALESCE(MAX(
        CASE
            WHEN tender_number LIKE prefix || '%'
            THEN CAST(SUBSTRING(tender_number FROM LENGTH(prefix) + 1) AS INT)
            ELSE 0
        END
    ), 0) + 1
    INTO next_seq
    FROM sc.tender
    WHERE tender_number LIKE prefix || '%';

    RETURN prefix || LPAD(next_seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PART 8: Add Comments for Documentation
-- =============================================

COMMENT ON TABLE sc.tender IS 'Tender/RFQ management table for procurement';
COMMENT ON TABLE sc.tender_line_item IS 'Line items/parts requested in a tender';
COMMENT ON TABLE sc.tender_vendor IS 'Vendors invited to respond to a tender';
COMMENT ON TABLE sc.tender_quotation IS 'Vendor quotation responses to tenders';
COMMENT ON TABLE sc.tender_quotation_line_item IS 'Line item pricing in vendor quotations';

COMMENT ON COLUMN sc.tender.status IS 'Draft, Submitted, Published, Closed, Awarded, Cancelled';
COMMENT ON COLUMN sc.tender_vendor.status IS 'Invited, Responded, NoResponse, Declined';
COMMENT ON COLUMN sc.tender_quotation.is_selected IS 'True if this is the winning quotation';

COMMENT ON COLUMN sc.company_part.unit_price IS 'Vendor price per unit';
COMMENT ON COLUMN sc.company_part.lead_time_days IS 'Expected delivery lead time in days';
COMMENT ON COLUMN sc.company_part.min_order_quantity IS 'Minimum order quantity required';
COMMENT ON COLUMN sc.company_part.order_multiple IS 'Order must be in multiples of this quantity';
COMMENT ON COLUMN sc.company_part.is_preferred IS 'Preferred vendor for this part';
COMMENT ON COLUMN sc.company_part.valid_from IS 'Pricing valid from date';
COMMENT ON COLUMN sc.company_part.valid_to IS 'Pricing valid until date';
COMMENT ON COLUMN sc.company_part.vendor_part_number IS 'Vendor catalog/SKU number';
COMMENT ON COLUMN sc.company_part.manufacturer_part_number IS 'Original manufacturer part number';

-- =============================================
-- End of Migration Script
-- =============================================
