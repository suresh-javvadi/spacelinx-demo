-- Migration: Add RecordLink placeholder to Email Templates
-- Date: 2026-01-06
-- Description: Updates existing email templates to include a "View in SpaceLinx" button with {{RecordLink}} placeholder

-- =============================================
-- Update ECO_SUBMITTED Template
-- =============================================
UPDATE mes.email_template
SET body = '<!DOCTYPE html>
<html>
<head><style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .label { font-weight: bold; color: #666; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
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
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
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
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration'
WHERE template_code = 'ECO_SUBMITTED';

-- =============================================
-- Update ECO_APPROVED Template
-- =============================================
UPDATE mes.email_template
SET body = '<!DOCTYPE html>
<html>
<head><style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .label { font-weight: bold; color: #666; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
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
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
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
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration'
WHERE template_code = 'ECO_APPROVED';

-- =============================================
-- Update ECO_REJECTED Template
-- =============================================
UPDATE mes.email_template
SET body = '<!DOCTYPE html>
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
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
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
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
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
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration'
WHERE template_code = 'ECO_REJECTED';

-- =============================================
-- Update ECO_RELEASED Template
-- =============================================
UPDATE mes.email_template
SET body = '<!DOCTYPE html>
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
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
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
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
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
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration'
WHERE template_code = 'ECO_RELEASED';

-- =============================================
-- Insert or Update REQUISITION_SUBMITTED Template
-- =============================================
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'REQUISITION_SUBMITTED',
    'Requisition Submitted for Approval',
    'Requisition {{EntityNumber}} - {{Title}} Submitted for Approval',
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
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>Requisition Submitted for Approval</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>A requisition has been submitted and requires your attention.</p>
        <div class="details">
            <p><span class="label">Requisition Number:</span> {{EntityNumber}}</p>
            <p><span class="label">Title:</span> {{Title}}</p>
            <p><span class="label">Requestor:</span> {{Requestor}}</p>
            <p><span class="label">Project:</span> {{Project}}</p>
            <p><span class="label">Priority:</span> {{Priority}}</p>
            <p><span class="label">Total Amount:</span> {{TotalAmount}}</p>
        </div>
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
        </div>
        <p>Please review and take appropriate action.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when a requisition is submitted for approval',
    true,
    true,
    'Migration',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO UPDATE SET
    body = EXCLUDED.body,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration';

-- =============================================
-- Insert or Update REQUISITION_APPROVED Template
-- =============================================
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'REQUISITION_APPROVED',
    'Requisition Approved',
    'Requisition {{EntityNumber}} - {{Title}} Has Been Approved',
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
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>Requisition Approved</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>The following requisition has been fully approved.</p>
        <div class="details">
            <p><span class="label">Requisition Number:</span> {{EntityNumber}}</p>
            <p><span class="label">Title:</span> {{Title}}</p>
            <p><span class="label">Requestor:</span> {{Requestor}}</p>
            <p><span class="label">Project:</span> {{Project}}</p>
            <p><span class="label">Total Amount:</span> {{TotalAmount}}</p>
        </div>
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
        </div>
        <p>The requisition will now proceed to procurement.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when a requisition is fully approved',
    true,
    true,
    'Migration',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO UPDATE SET
    body = EXCLUDED.body,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration';

-- =============================================
-- Insert or Update REQUISITION_REJECTED Template
-- =============================================
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'REQUISITION_REJECTED',
    'Requisition Rejected',
    'Requisition {{EntityNumber}} - {{Title}} Has Been Rejected',
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
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>Requisition Rejected</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>The following requisition has been rejected.</p>
        <div class="details">
            <p><span class="label">Requisition Number:</span> {{EntityNumber}}</p>
            <p><span class="label">Title:</span> {{Title}}</p>
            <p><span class="label">Rejected By:</span> {{RejectorEmail}}</p>
        </div>
        <div class="rejection-notes">
            <p><span class="label">Rejection Notes:</span></p>
            <p>{{RejectionNotes}}</p>
        </div>
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
        </div>
        <p>Please review the notes and make necessary revisions before resubmitting.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when a requisition is rejected',
    true,
    true,
    'Migration',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO UPDATE SET
    body = EXCLUDED.body,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration';

-- =============================================
-- Insert or Update REQUISITION_STAGE_APPROVED Template
-- =============================================
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'REQUISITION_STAGE_APPROVED',
    'Requisition Stage Approved',
    'Requisition {{EntityNumber}} - Stage {{StageNumber}} Approved',
    '<!DOCTYPE html>
<html>
<head><style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .label { font-weight: bold; color: #666; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>Requisition Stage {{StageNumber}} Approved</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>A stage in the requisition approval workflow has been completed.</p>
        <div class="details">
            <p><span class="label">Requisition Number:</span> {{EntityNumber}}</p>
            <p><span class="label">Title:</span> {{Title}}</p>
            <p><span class="label">Stage:</span> {{StageNumber}}</p>
            <p><span class="label">Approved By:</span> {{ApproverEmail}}</p>
        </div>
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
        </div>
        <p>The requisition continues through the approval workflow.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when a requisition approval stage is completed',
    true,
    true,
    'Migration',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO UPDATE SET
    body = EXCLUDED.body,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration';

-- =============================================
-- Insert or Update PO_SUBMITTED Template
-- =============================================
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'PO_SUBMITTED',
    'Purchase Order Submitted for Approval',
    'PO {{EntityNumber}} - {{VendorName}} Submitted for Approval',
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
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>Purchase Order Submitted for Approval</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>A purchase order has been submitted and requires your attention.</p>
        <div class="details">
            <p><span class="label">PO Number:</span> {{EntityNumber}}</p>
            <p><span class="label">Vendor:</span> {{VendorName}}</p>
            <p><span class="label">Buyer:</span> {{Buyer}}</p>
            <p><span class="label">Project:</span> {{Project}}</p>
            <p><span class="label">Total Amount:</span> {{TotalAmount}}</p>
            <p><span class="label">Order Date:</span> {{OrderDate}}</p>
        </div>
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
        </div>
        <p>Please review and take appropriate action.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when a purchase order is submitted for approval',
    true,
    true,
    'Migration',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO UPDATE SET
    body = EXCLUDED.body,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration';

-- =============================================
-- Insert or Update PO_APPROVED Template
-- =============================================
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'PO_APPROVED',
    'Purchase Order Approved',
    'PO {{EntityNumber}} - {{VendorName}} Has Been Approved',
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
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>Purchase Order Approved</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>The following purchase order has been fully approved.</p>
        <div class="details">
            <p><span class="label">PO Number:</span> {{EntityNumber}}</p>
            <p><span class="label">Vendor:</span> {{VendorName}}</p>
            <p><span class="label">Buyer:</span> {{Buyer}}</p>
            <p><span class="label">Project:</span> {{Project}}</p>
            <p><span class="label">Total Amount:</span> {{TotalAmount}}</p>
        </div>
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
        </div>
        <p>The purchase order is now ready to be sent to the vendor.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when a purchase order is fully approved',
    true,
    true,
    'Migration',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO UPDATE SET
    body = EXCLUDED.body,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration';

-- =============================================
-- Insert or Update PO_REJECTED Template
-- =============================================
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'PO_REJECTED',
    'Purchase Order Rejected',
    'PO {{EntityNumber}} - {{VendorName}} Has Been Rejected',
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
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>Purchase Order Rejected</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>The following purchase order has been rejected.</p>
        <div class="details">
            <p><span class="label">PO Number:</span> {{EntityNumber}}</p>
            <p><span class="label">Vendor:</span> {{VendorName}}</p>
            <p><span class="label">Rejected By:</span> {{RejectorEmail}}</p>
        </div>
        <div class="rejection-notes">
            <p><span class="label">Rejection Notes:</span></p>
            <p>{{RejectionNotes}}</p>
        </div>
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
        </div>
        <p>Please review the notes and make necessary revisions before resubmitting.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when a purchase order is rejected',
    true,
    true,
    'Migration',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO UPDATE SET
    body = EXCLUDED.body,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration';

-- =============================================
-- Insert or Update PO_STAGE_APPROVED Template
-- =============================================
INSERT INTO mes.email_template (template_code, name, subject, body, description, is_html, is_active, created_by, created_at)
VALUES (
    'PO_STAGE_APPROVED',
    'Purchase Order Stage Approved',
    'PO {{EntityNumber}} - Stage {{StageNumber}} Approved',
    '<!DOCTYPE html>
<html>
<head><style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .label { font-weight: bold; color: #666; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .btn-container { text-align: center; margin: 25px 0; }
    .btn { background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
</style></head>
<body>
<div class="container">
    <div class="header">
        <h1>Purchase Order Stage {{StageNumber}} Approved</h1>
    </div>
    <div class="content">
        <p>Hello {{RecipientName}},</p>
        <p>A stage in the purchase order approval workflow has been completed.</p>
        <div class="details">
            <p><span class="label">PO Number:</span> {{EntityNumber}}</p>
            <p><span class="label">Vendor:</span> {{VendorName}}</p>
            <p><span class="label">Stage:</span> {{StageNumber}}</p>
            <p><span class="label">Approved By:</span> {{ApproverEmail}}</p>
        </div>
        <div class="btn-container">
            <a href="{{RecordLink}}" class="btn">View in SpaceLinx</a>
        </div>
        <p>The purchase order continues through the approval workflow.</p>
    </div>
    <div class="footer">
        <p>This is an automated message from SpaceLinx System</p>
        <p>{{Timestamp}}</p>
    </div>
</div>
</body>
</html>',
    'Email template sent when a purchase order approval stage is completed',
    true,
    true,
    'Migration',
    CURRENT_TIMESTAMP
) ON CONFLICT (template_code) DO UPDATE SET
    body = EXCLUDED.body,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'Migration';
