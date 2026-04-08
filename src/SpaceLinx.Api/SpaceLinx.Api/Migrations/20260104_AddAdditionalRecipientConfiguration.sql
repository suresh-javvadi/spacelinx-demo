-- Migration: Add Additional Recipient Configuration Table
-- Date: 2026-01-04
-- Description: Creates additional_recipient_configuration table for global notification recipients per email template

-- =============================================
-- Create additional_recipient_configuration table
-- =============================================
CREATE TABLE IF NOT EXISTS common.additional_recipient_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    recipient_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255)
);

-- Index for efficient template code lookups (excluding soft-deleted records)
CREATE INDEX IF NOT EXISTS idx_additional_recipient_config_template
ON common.additional_recipient_configuration(template_code)
WHERE deleted_at IS NULL;

-- =============================================
-- Comments
-- =============================================
COMMENT ON TABLE common.additional_recipient_configuration IS 'Global notification recipients configured per email template type';
COMMENT ON COLUMN common.additional_recipient_configuration.template_code IS 'Email template code (e.g., REQUISITION_SUBMITTED, PO_APPROVED)';
COMMENT ON COLUMN common.additional_recipient_configuration.email IS 'Recipient email address';
COMMENT ON COLUMN common.additional_recipient_configuration.recipient_name IS 'Display name for the recipient';
COMMENT ON COLUMN common.additional_recipient_configuration.recipient_type IS 'Type of recipient (e.g., CC, Watcher, Stakeholder)';

-- =============================================
-- Seed Data: Global Notification Recipients
-- =============================================

-- Tarun Pandrangi (Supply Chain Manager) - All PO & Requisition notifications
INSERT INTO common.additional_recipient_configuration (template_code, email, recipient_name, recipient_type, created_by)
VALUES
    ('PO_SUBMITTED', 'tarun@xdlinx.space', 'Tarun Pandrangi', 'CC', 'System'),
    ('PO_APPROVED', 'tarun@xdlinx.space', 'Tarun Pandrangi', 'CC', 'System'),
    ('PO_REJECTED', 'tarun@xdlinx.space', 'Tarun Pandrangi', 'CC', 'System'),
    ('PO_STAGE_APPROVED', 'tarun@xdlinx.space', 'Tarun Pandrangi', 'CC', 'System'),
    ('REQUISITION_SUBMITTED', 'tarun@xdlinx.space', 'Tarun Pandrangi', 'CC', 'System'),
    ('REQUISITION_APPROVED', 'tarun@xdlinx.space', 'Tarun Pandrangi', 'CC', 'System'),
    ('REQUISITION_REJECTED', 'tarun@xdlinx.space', 'Tarun Pandrangi', 'CC', 'System'),
    ('REQUISITION_STAGE_APPROVED', 'tarun@xdlinx.space', 'Tarun Pandrangi', 'CC', 'System');

-- Sudheer (Head of Operations) - All notifications
INSERT INTO common.additional_recipient_configuration (template_code, email, recipient_name, recipient_type, created_by)
VALUES
    -- PO notifications
    ('PO_SUBMITTED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('PO_APPROVED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('PO_REJECTED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('PO_STAGE_APPROVED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    -- Requisition notifications
    ('REQUISITION_SUBMITTED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('REQUISITION_APPROVED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('REQUISITION_REJECTED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('REQUISITION_STAGE_APPROVED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    -- Tender notifications
    ('TENDER_SUBMITTED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('TENDER_APPROVED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('TENDER_REJECTED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('TENDER_STAGE_APPROVED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('TENDER_PUBLISHED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('TENDER_AWARDED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    -- ECO notifications
    ('ECO_SUBMITTED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('ECO_APPROVED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('ECO_REJECTED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System'),
    ('ECO_RELEASED', 'Sudheer@xdlinx.space', 'Sudheer', 'CC', 'System');

-- Rupesh Gandupalli (CEO) - All final decisions (Approved & Rejected)
INSERT INTO common.additional_recipient_configuration (template_code, email, recipient_name, recipient_type, created_by)
VALUES
    ('PO_APPROVED', 'rupesh@xdlinx.space', 'Rupesh Gandupalli', 'CC', 'System'),
    ('PO_REJECTED', 'rupesh@xdlinx.space', 'Rupesh Gandupalli', 'CC', 'System'),
    ('REQUISITION_APPROVED', 'rupesh@xdlinx.space', 'Rupesh Gandupalli', 'CC', 'System'),
    ('REQUISITION_REJECTED', 'rupesh@xdlinx.space', 'Rupesh Gandupalli', 'CC', 'System'),
    ('TENDER_APPROVED', 'rupesh@xdlinx.space', 'Rupesh Gandupalli', 'CC', 'System'),
    ('TENDER_REJECTED', 'rupesh@xdlinx.space', 'Rupesh Gandupalli', 'CC', 'System'),
    ('ECO_APPROVED', 'rupesh@xdlinx.space', 'Rupesh Gandupalli', 'CC', 'System'),
    ('ECO_REJECTED', 'rupesh@xdlinx.space', 'Rupesh Gandupalli', 'CC', 'System');
