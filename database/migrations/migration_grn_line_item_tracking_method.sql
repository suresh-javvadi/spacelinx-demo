-- Migration: Update tracking_method constraints on sc.grn_line_item
-- Allows TrackingMethod to be nullable and removes the 'None' default value.

ALTER TABLE sc.grn_line_item ALTER COLUMN tracking_method DROP NOT NULL;
ALTER TABLE sc.grn_line_item ALTER COLUMN tracking_method DROP DEFAULT;

-- Update the check constraint to allow NULL
ALTER TABLE sc.grn_line_item DROP CONSTRAINT IF EXISTS grn_line_item_tracking_method_check;
ALTER TABLE sc.grn_line_item ADD CONSTRAINT grn_line_item_tracking_method_check
  CHECK (tracking_method IS NULL OR tracking_method IN ('None','Batch','Serial'));
