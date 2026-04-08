-- Migration: Add Stock Movement Tables
-- Date: 2026-01-02
-- Description: Creates tables for stock movement functionality (Transfer, Adjustment, Issue)

-- =============================================
-- Function: Generate Stock Movement Number
-- =============================================
CREATE OR REPLACE FUNCTION sc.generate_stock_movement_number()
RETURNS varchar(255) AS $$
DECLARE
    next_val INTEGER;
    prefix TEXT := 'SM-';
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(movement_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_val
    FROM sc.stock_movement
    WHERE movement_number LIKE 'SM-%';

    RETURN prefix || LPAD(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Table: sc.stock_movement
-- Purpose: Header table for stock movements (Transfer, Adjustment, Issue)
-- =============================================
CREATE TABLE IF NOT EXISTS sc.stock_movement (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    movement_number varchar(255) NOT NULL,
    movement_type varchar(50) NOT NULL,
    movement_reason varchar(100) NULL,
    movement_date date NOT NULL,
    from_location_id uuid NULL,
    from_bin_id uuid NULL,
    to_location_id uuid NULL,
    to_bin_id uuid NULL,
    performed_by_id uuid NULL,
    work_order_id uuid NULL,
    reference_number varchar(255) NULL,
    notes text NULL,
    status varchar(50) NOT NULL DEFAULT 'Completed',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(255) NOT NULL,
    updated_at timestamp with time zone NULL,
    updated_by varchar(255) NULL,
    deleted_at timestamp with time zone NULL,
    deleted_by varchar(255) NULL,
    CONSTRAINT stock_movement_pkey PRIMARY KEY (id),
    CONSTRAINT stock_movement_movement_number_key UNIQUE (movement_number),
    CONSTRAINT fk_stock_movement_from_location FOREIGN KEY (from_location_id) REFERENCES mes.location(id) ON DELETE SET NULL,
    CONSTRAINT fk_stock_movement_to_location FOREIGN KEY (to_location_id) REFERENCES mes.location(id) ON DELETE SET NULL,
    CONSTRAINT fk_stock_movement_from_bin FOREIGN KEY (from_bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL,
    CONSTRAINT fk_stock_movement_to_bin FOREIGN KEY (to_bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL,
    -- NOTE: hr.staff FK removed - add later when hr schema exists
    -- CONSTRAINT fk_stock_movement_performed_by FOREIGN KEY (performed_by_id) REFERENCES hr.staff(id) ON DELETE SET NULL,
    CONSTRAINT fk_stock_movement_work_order FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE SET NULL
);

-- Indexes for stock_movement
CREATE INDEX IF NOT EXISTS idx_stock_movement_type ON sc.stock_movement(movement_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movement_date ON sc.stock_movement(movement_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movement_from_location ON sc.stock_movement(from_location_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movement_to_location ON sc.stock_movement(to_location_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movement_status ON sc.stock_movement(status) WHERE deleted_at IS NULL;

-- =============================================
-- Table: sc.stock_movement_line_item
-- Purpose: Line items for stock movements
-- =============================================
CREATE TABLE IF NOT EXISTS sc.stock_movement_line_item (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    stock_movement_id uuid NOT NULL,
    part_id uuid NOT NULL,
    quantity int NOT NULL,
    tracking_type varchar(50) NULL,
    tracking_id varchar(255) NULL,
    reason varchar(255) NULL,
    notes text NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(255) NOT NULL,
    updated_at timestamp with time zone NULL,
    updated_by varchar(255) NULL,
    deleted_at timestamp with time zone NULL,
    deleted_by varchar(255) NULL,
    CONSTRAINT stock_movement_line_item_pkey PRIMARY KEY (id),
    CONSTRAINT stock_movement_line_item_quantity_check CHECK (quantity > 0),
    CONSTRAINT fk_stock_movement_line_item_movement FOREIGN KEY (stock_movement_id) REFERENCES sc.stock_movement(id) ON DELETE CASCADE,
    CONSTRAINT fk_stock_movement_line_item_part FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL
);

-- Indexes for stock_movement_line_item
CREATE INDEX IF NOT EXISTS idx_stock_movement_line_item_movement ON sc.stock_movement_line_item(stock_movement_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movement_line_item_part ON sc.stock_movement_line_item(part_id) WHERE deleted_at IS NULL;

-- =============================================
-- Comments
-- =============================================
COMMENT ON TABLE sc.stock_movement IS 'Stock movement header for Transfer, Adjustment, and Issue operations';
COMMENT ON COLUMN sc.stock_movement.movement_type IS 'Transfer, Adjustment, or Issue';
COMMENT ON COLUMN sc.stock_movement.movement_reason IS 'Reason code for the movement';
COMMENT ON COLUMN sc.stock_movement.status IS 'Completed or Cancelled';

COMMENT ON TABLE sc.stock_movement_line_item IS 'Line items for stock movements, one per part per movement';
COMMENT ON COLUMN sc.stock_movement_line_item.tracking_type IS 'Serial, Batch, or None';
