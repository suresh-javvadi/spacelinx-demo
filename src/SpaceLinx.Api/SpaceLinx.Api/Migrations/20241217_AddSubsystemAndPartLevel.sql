-- Migration: Add Subsystem and PartLevel Tables
-- Date: 2024-12-17
-- Description: Creates subsystem and part_level tables for Part classification
--              and adds foreign key columns to the part table

-- =============================================
-- Create subsystem table
-- =============================================
CREATE TABLE IF NOT EXISTS mes.subsystem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255),
    CONSTRAINT subsystem_code_deleted_at_key UNIQUE (code, deleted_at)
);

CREATE INDEX IF NOT EXISTS idx_subsystem_active ON mes.subsystem(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_subsystem_code ON mes.subsystem(code) WHERE deleted_at IS NULL;

-- =============================================
-- Create part_level table
-- =============================================
CREATE TABLE IF NOT EXISTS mes.part_level (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    sort_order INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255),
    CONSTRAINT part_level_code_deleted_at_key UNIQUE (code, deleted_at)
);

CREATE INDEX IF NOT EXISTS idx_part_level_active ON mes.part_level(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_part_level_code ON mes.part_level(code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_part_level_sort_order ON mes.part_level(sort_order) WHERE deleted_at IS NULL;

-- =============================================
-- Add foreign key columns to part table
-- =============================================
ALTER TABLE mes.part
ADD COLUMN IF NOT EXISTS subsystem_id UUID,
ADD COLUMN IF NOT EXISTS part_level_id UUID;

-- Add foreign key constraints
ALTER TABLE mes.part
ADD CONSTRAINT part_subsystem_id_fkey
FOREIGN KEY (subsystem_id) REFERENCES mes.subsystem(id) ON DELETE SET NULL;

ALTER TABLE mes.part
ADD CONSTRAINT part_part_level_id_fkey
FOREIGN KEY (part_level_id) REFERENCES mes.part_level(id) ON DELETE SET NULL;

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_part_subsystem_id ON mes.part(subsystem_id);
CREATE INDEX IF NOT EXISTS idx_part_part_level_id ON mes.part(part_level_id);

-- =============================================
-- Seed Subsystem data
-- =============================================
INSERT INTO mes.subsystem (code, name, description, is_active, created_by, created_at)
VALUES
    ('STRUCT', 'Structure', 'Structural components and assemblies including chassis, frames, and mounting hardware', true, 'System', CURRENT_TIMESTAMP),
    ('ADCS', 'ADCS', 'Attitude Determination and Control System - sensors, actuators, and control electronics', true, 'System', CURRENT_TIMESTAMP),
    ('AVIONICS', 'Avionics', 'Flight computers, data handling, and onboard computing systems', true, 'System', CURRENT_TIMESTAMP),
    ('EPS', 'EPS', 'Electrical Power System - solar arrays, batteries, power distribution, and regulation', true, 'System', CURRENT_TIMESTAMP),
    ('RF', 'RF', 'Radio Frequency communications - antennas, transceivers, and RF electronics', true, 'System', CURRENT_TIMESTAMP),
    ('PAYLOAD', 'Payload', 'Mission-specific payload equipment and instruments', true, 'System', CURRENT_TIMESTAMP),
    ('THERMAL', 'Thermal', 'Thermal control system - heaters, radiators, and thermal management', true, 'System', CURRENT_TIMESTAMP),
    ('PROPULSION', 'Propulsion', 'Propulsion system components - thrusters, tanks, and feed systems', true, 'System', CURRENT_TIMESTAMP)
ON CONFLICT ON CONSTRAINT subsystem_code_deleted_at_key DO NOTHING;

-- =============================================
-- Seed PartLevel data
-- =============================================
INSERT INTO mes.part_level (code, name, description, sort_order, is_active, created_by, created_at)
VALUES
    ('ASSY', 'Assembly', 'Top-level assembly that integrates multiple sub-assemblies or components', 1, true, 'System', CURRENT_TIMESTAMP),
    ('SUBASSY', 'Sub Assembly', 'Intermediate assembly that combines multiple components', 2, true, 'System', CURRENT_TIMESTAMP),
    ('COMP', 'Component', 'Individual part or lowest-level item in the bill of materials', 3, true, 'System', CURRENT_TIMESTAMP),
    ('PKG', 'Package', 'Packaged item or shipping unit for logistics and distribution', 4, true, 'System', CURRENT_TIMESTAMP)
ON CONFLICT ON CONSTRAINT part_level_code_deleted_at_key DO NOTHING;

-- =============================================
-- Verification queries (optional - can be removed in production)
-- =============================================
-- SELECT * FROM mes.subsystem WHERE deleted_at IS NULL;
-- SELECT * FROM mes.part_level WHERE deleted_at IS NULL ORDER BY sort_order;
