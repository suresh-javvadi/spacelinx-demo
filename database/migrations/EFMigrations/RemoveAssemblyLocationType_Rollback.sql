-- Rollback Migration: Restore AssemblyLocationType entity
-- Date: 2025-12-17
-- Description: Restores the assembly_location_type table and related foreign key columns

-- Step 1: Recreate the assembly_location_type table
CREATE TABLE IF NOT EXISTS mes.assembly_location_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP,
    deleted_by VARCHAR(255),
    deleted_at TIMESTAMP
);

-- Step 2: Add assembly_location_type_id column back to assembly_location table
ALTER TABLE mes.assembly_location
ADD COLUMN IF NOT EXISTS assembly_location_type_id UUID;

-- Step 3: Add assembly_location_type_id column back to part table
ALTER TABLE mes.part
ADD COLUMN IF NOT EXISTS assembly_location_type_id UUID;

-- Step 4: Add foreign key constraint to assembly_location table
ALTER TABLE mes.assembly_location
ADD CONSTRAINT assembly_location_assembly_location_type_id_fkey
FOREIGN KEY (assembly_location_type_id) REFERENCES mes.assembly_location_type(id)
ON DELETE SET NULL;

-- Step 5: Add foreign key constraint to part table
ALTER TABLE mes.part
ADD CONSTRAINT part_assembly_location_type_id_fkey
FOREIGN KEY (assembly_location_type_id) REFERENCES mes.assembly_location_type(id)
ON DELETE SET NULL;
