-- Rollback Migration: Remove Grade column from Part table
-- Date: 2024-12-19
-- Description: Reverts the grade column addition from part table

-- =============================================
-- Drop index first
-- =============================================
DROP INDEX IF EXISTS mes.idx_part_grade;

-- =============================================
-- Remove grade column from part table
-- =============================================
ALTER TABLE mes.part
DROP COLUMN IF EXISTS grade;
