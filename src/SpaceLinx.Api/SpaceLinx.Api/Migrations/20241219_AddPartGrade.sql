-- Migration: Add Grade column to Part table
-- Date: 2024-12-19
-- Description: Adds grade column to part table for component classification
--              Options: Aerospace, MIL, AEC, Industrial, Commercial, or custom value

-- =============================================
-- Add grade column to part table
-- =============================================
ALTER TABLE mes.part
ADD COLUMN IF NOT EXISTS grade VARCHAR(100);

-- Create index for grade column
CREATE INDEX IF NOT EXISTS idx_part_grade ON mes.part(grade) WHERE deleted_at IS NULL;

-- =============================================
-- Verification queries (optional - can be removed in production)
-- =============================================
-- SELECT id, part_number, name, grade FROM mes.part WHERE deleted_at IS NULL LIMIT 10;
