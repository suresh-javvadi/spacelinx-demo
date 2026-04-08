-- Migration: Remove AssemblyLocationType entity
-- Date: 2025-12-17
-- Description: Removes the assembly_location_type table and related foreign key columns

-- Step 1: Drop foreign key constraint from assembly_location table
ALTER TABLE mes.assembly_location
DROP CONSTRAINT IF EXISTS assembly_location_assembly_location_type_id_fkey;

-- Step 2: Drop foreign key constraint from part table
ALTER TABLE mes.part
DROP CONSTRAINT IF EXISTS part_assembly_location_type_id_fkey;

-- Step 3: Drop assembly_location_type_id column from assembly_location table
ALTER TABLE mes.assembly_location
DROP COLUMN IF EXISTS assembly_location_type_id;

-- Step 4: Drop assembly_location_type_id column from part table
ALTER TABLE mes.part
DROP COLUMN IF EXISTS assembly_location_type_id;

-- Step 5: Drop the assembly_location_type table
DROP TABLE IF EXISTS mes.assembly_location_type;
