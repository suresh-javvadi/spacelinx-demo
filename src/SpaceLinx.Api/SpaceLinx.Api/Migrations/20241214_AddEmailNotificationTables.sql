-- Migration: Add Email Notification Tables
-- Date: 2024-12-14
-- Description: Creates email_template and email_log tables for ECO notification system

-- =============================================
-- Create email_template table
-- =============================================
CREATE TABLE IF NOT EXISTS mes.email_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    description TEXT,
    is_html BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255),
    CONSTRAINT idx_email_template_code UNIQUE (template_code)
);

CREATE INDEX IF NOT EXISTS idx_email_template_active ON mes.email_template(is_active) WHERE deleted_by IS NULL;

-- =============================================
-- Create email_log table
-- =============================================
CREATE TABLE IF NOT EXISTS mes.email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    sent_at TIMESTAMP,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_email_log_status ON mes.email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_entity ON mes.email_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON mes.email_log(created_at);

-- =============================================
-- Seed default email templates
-- =============================================

-- ECO Submitted Template
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'ECO_SUBMITTED',
    'ECO Submitted for Approval',
    'ECO {{EcoNumber}} - {{EcoName}} Submitted for Approval',
    '<!DOCTYPE html>
<html>
<head><style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .label { font-weight: bold; color: #666; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>ECO Submitted for Approval</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>An Engineering Change Order has been submitted and requires your attention.</p>
        <div class="details">
            <p><span class="label">ECO Number:</span> {{EcoNumber}}</p>
            <p><span class="label">Name:</span> {{EcoName}}</p>
            <p><span class="label">Change Type:</span> {{ChangeType}}</p>
            <p><span class="label">Priority:</span> {{Priority}}</p>
            <p><span class="label">Requestor:</span> {{Requestor}}</p>
            <p><span class="label">Reason for Change:</span> {{ReasonForChange}}</p>
        </div>
        <p>Please review and take appropriate action.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx ECO System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when an ECO is submitted for approval',
    true,
    true,
    'System',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO NOTHING;

-- ECO Approved Template
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'ECO_APPROVED',
    'ECO Approved',
    'ECO {{EcoNumber}} - {{EcoName}} Has Been Approved',
    '<!DOCTYPE html>
<html>
<head><style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .label { font-weight: bold; color: #666; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>ECO Approved</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>The following Engineering Change Order has been fully approved by all approvers.</p>
        <div class="details">
            <p><span class="label">ECO Number:</span> {{EcoNumber}}</p>
            <p><span class="label">Name:</span> {{EcoName}}</p>
            <p><span class="label">Change Type:</span> {{ChangeType}}</p>
            <p><span class="label">Requestor:</span> {{Requestor}}</p>
        </div>
        <p>The ECO will now proceed to the release process.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx ECO System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when an ECO is fully approved',
    true,
    true,
    'System',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO NOTHING;

-- ECO Rejected Template
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'ECO_REJECTED',
    'ECO Rejected',
    'ECO {{EcoNumber}} - {{EcoName}} Has Been Rejected',
    '<!DOCTYPE html>
<html>
<head><style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .label { font-weight: bold; color: #666; }
    .rejection-notes { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>ECO Rejected</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>The following Engineering Change Order has been rejected and returned to Draft status.</p>
        <div class="details">
            <p><span class="label">ECO Number:</span> {{EcoNumber}}</p>
            <p><span class="label">Name:</span> {{EcoName}}</p>
            <p><span class="label">Rejected By:</span> {{RejectorEmail}}</p>
        </div>
        <div class="rejection-notes">
            <p><span class="label">Rejection Notes:</span></p>
            <p>{{RejectionNotes}}</p>
        </div>
        <p>Please review the notes and make necessary revisions before resubmitting.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx ECO System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when an ECO is rejected',
    true,
    true,
    'System',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO NOTHING;

-- ECO Released Template
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'ECO_RELEASED',
    'ECO Released',
    'ECO {{EcoNumber}} - {{EcoName}} Has Been Released',
    '<!DOCTYPE html>
<html>
<head><style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .label { font-weight: bold; color: #666; }
    .success-box { background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>ECO Released</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <div class="success-box">
            <p>The Engineering Change Order has been successfully released and all associated parts have been updated.</p>
        </div>
        <div class="details">
            <p><span class="label">ECO Number:</span> {{EcoNumber}}</p>
            <p><span class="label">Name:</span> {{EcoName}}</p>
            <p><span class="label">Change Type:</span> {{ChangeType}}</p>
            <p><span class="label">Requestor:</span> {{Requestor}}</p>
        </div>
        <p>All engineering changes are now in effect.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx ECO System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when an ECO is released',
    true,
    true,
    'System',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO NOTHING;
