-- Migration: Add Multi-Level Approval Entities
-- Date: 2025-01-01
-- Description: Creates tables for configurable multi-level approval system

-- =============================================
-- Table: ApprovalConfigurations
-- Purpose: Configures number of approval levels per entity type
-- =============================================
CREATE TABLE IF NOT EXISTS "ApprovalConfigurations" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "EntityType" varchar(100) NOT NULL,
    "NumberOfLevels" integer NOT NULL DEFAULT 1,
    "Description" text NULL,
    "RequireSequentialApproval" boolean NOT NULL DEFAULT true,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedBy" varchar(500) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" varchar(500) NULL,
    "UpdatedAt" timestamp with time zone NULL,
    "DeletedBy" varchar(500) NULL,
    "DeletedAt" timestamp with time zone NULL,
    CONSTRAINT "PK_ApprovalConfigurations" PRIMARY KEY ("Id")
);

-- Index for quick lookup by entity type
CREATE INDEX IF NOT EXISTS "IX_ApprovalConfigurations_EntityType"
ON "ApprovalConfigurations" ("EntityType")
WHERE "DeletedBy" IS NULL;

-- =============================================
-- Table: ApprovalNotificationRecipients
-- Purpose: Additional email recipients per entity instance
-- =============================================
CREATE TABLE IF NOT EXISTS "ApprovalNotificationRecipients" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "EntityType" varchar(100) NOT NULL,
    "EntityId" uuid NOT NULL,
    "RecipientUserId" uuid NOT NULL,
    "RecipientType" varchar(50) NULL,  -- "CC", "Watcher", "Stakeholder"
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedBy" varchar(500) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" varchar(500) NULL,
    "UpdatedAt" timestamp with time zone NULL,
    "DeletedBy" varchar(500) NULL,
    "DeletedAt" timestamp with time zone NULL,
    CONSTRAINT "PK_ApprovalNotificationRecipients" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ApprovalNotificationRecipients_Users" FOREIGN KEY ("RecipientUserId") REFERENCES "Users" ("Id")
);

-- Index for querying recipients by entity
CREATE INDEX IF NOT EXISTS "IX_ApprovalNotificationRecipients_EntityType_EntityId"
ON "ApprovalNotificationRecipients" ("EntityType", "EntityId")
WHERE "DeletedBy" IS NULL;

-- Index for FK
CREATE INDEX IF NOT EXISTS "IX_ApprovalNotificationRecipients_RecipientUserId"
ON "ApprovalNotificationRecipients" ("RecipientUserId");

-- =============================================
-- Table: ApprovalLogs
-- Purpose: Audit trail for all approval actions
-- =============================================
CREATE TABLE IF NOT EXISTS "ApprovalLogs" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "EntityType" varchar(100) NOT NULL,
    "EntityId" uuid NOT NULL,
    "Action" varchar(50) NOT NULL,  -- "Submitted", "StageApproved", "FullyApproved", "Rejected", "ResetToDraft"
    "ActionAt" timestamp with time zone NOT NULL,
    "ActionBy" varchar(500) NOT NULL,
    "StageNumber" integer NULL,
    "Notes" text NULL,
    "PreviousStatus" varchar(50) NULL,
    "NewStatus" varchar(50) NULL,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedBy" varchar(500) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" varchar(500) NULL,
    "UpdatedAt" timestamp with time zone NULL,
    "DeletedBy" varchar(500) NULL,
    "DeletedAt" timestamp with time zone NULL,
    CONSTRAINT "PK_ApprovalLogs" PRIMARY KEY ("Id")
);

-- Index for querying logs by entity
CREATE INDEX IF NOT EXISTS "IX_ApprovalLogs_EntityType_EntityId"
ON "ApprovalLogs" ("EntityType", "EntityId");

-- Index for filtering by action date
CREATE INDEX IF NOT EXISTS "IX_ApprovalLogs_ActionAt"
ON "ApprovalLogs" ("ActionAt" DESC);

-- =============================================
-- Seed Data: Default Approval Configurations
-- =============================================
INSERT INTO "ApprovalConfigurations" ("Id", "EntityType", "NumberOfLevels", "Description", "RequireSequentialApproval", "IsActive", "CreatedBy", "CreatedAt")
VALUES
    (gen_random_uuid(), 'Eco', 2, 'Engineering Change Order - 2 level approval', true, true, 'system', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Requisition', 2, 'Requisition - 2 level approval', true, true, 'system', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'PurchaseOrder', 2, 'Purchase Order - 2 level approval', true, true, 'system', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- =============================================
-- Seed Data: Email Templates for Approval Notifications
-- =============================================
INSERT INTO "EmailTemplates" ("Id", "TemplateCode", "Subject", "Body", "IsActive", "CreatedBy", "CreatedAt")
VALUES
    (gen_random_uuid(), 'REQUISITION_SUBMITTED', 'Requisition {{EntityNumber}} Submitted for Approval',
     '<p>Hello {{RecipientName}},</p><p>Requisition <strong>{{EntityNumber}}</strong> has been submitted for your approval.</p><p><strong>Title:</strong> {{Title}}</p><p><strong>Requestor:</strong> {{Requestor}}</p><p><strong>Total Estimated Amount:</strong> {{TotalAmount}}</p><p>Please review and take action.</p>',
     true, 'system', CURRENT_TIMESTAMP),

    (gen_random_uuid(), 'REQUISITION_APPROVED', 'Requisition {{EntityNumber}} Approved',
     '<p>Hello {{RecipientName}},</p><p>Requisition <strong>{{EntityNumber}}</strong> has been fully approved.</p><p><strong>Title:</strong> {{Title}}</p><p><strong>Approved By:</strong> {{ApprovedBy}}</p><p><strong>Timestamp:</strong> {{Timestamp}}</p>',
     true, 'system', CURRENT_TIMESTAMP),

    (gen_random_uuid(), 'REQUISITION_REJECTED', 'Requisition {{EntityNumber}} Rejected',
     '<p>Hello {{RecipientName}},</p><p>Requisition <strong>{{EntityNumber}}</strong> has been rejected.</p><p><strong>Title:</strong> {{Title}}</p><p><strong>Rejected By:</strong> {{RejectedBy}}</p><p><strong>Notes:</strong> {{Notes}}</p><p>The requisition has been reset to Draft status for revision.</p>',
     true, 'system', CURRENT_TIMESTAMP),

    (gen_random_uuid(), 'REQUISITION_STAGE_APPROVED', 'Requisition {{EntityNumber}} - Stage {{StageNumber}} Approved',
     '<p>Hello {{RecipientName}},</p><p>Stage {{StageNumber}} of Requisition <strong>{{EntityNumber}}</strong> has been approved.</p><p><strong>Title:</strong> {{Title}}</p><p><strong>Approved By:</strong> {{ApprovedBy}}</p><p>The requisition is now pending approval at the next stage.</p>',
     true, 'system', CURRENT_TIMESTAMP),

    (gen_random_uuid(), 'PO_SUBMITTED', 'PO {{EntityNumber}} Submitted for Approval',
     '<p>Hello {{RecipientName}},</p><p>Purchase Order <strong>{{EntityNumber}}</strong> has been submitted for your approval.</p><p><strong>Vendor:</strong> {{Vendor}}</p><p><strong>Total Amount:</strong> {{TotalAmount}}</p><p>Please review and take action.</p>',
     true, 'system', CURRENT_TIMESTAMP),

    (gen_random_uuid(), 'PO_APPROVED', 'PO {{EntityNumber}} Approved and Issued',
     '<p>Hello {{RecipientName}},</p><p>Purchase Order <strong>{{EntityNumber}}</strong> has been fully approved and issued.</p><p><strong>Vendor:</strong> {{Vendor}}</p><p><strong>Total Amount:</strong> {{TotalAmount}}</p><p><strong>Approved By:</strong> {{ApprovedBy}}</p><p><strong>Timestamp:</strong> {{Timestamp}}</p>',
     true, 'system', CURRENT_TIMESTAMP),

    (gen_random_uuid(), 'PO_REJECTED', 'PO {{EntityNumber}} Rejected',
     '<p>Hello {{RecipientName}},</p><p>Purchase Order <strong>{{EntityNumber}}</strong> has been rejected.</p><p><strong>Vendor:</strong> {{Vendor}}</p><p><strong>Rejected By:</strong> {{RejectedBy}}</p><p><strong>Notes:</strong> {{Notes}}</p><p>The PO has been reset to Draft status for revision.</p>',
     true, 'system', CURRENT_TIMESTAMP),

    (gen_random_uuid(), 'PO_STAGE_APPROVED', 'PO {{EntityNumber}} - Stage {{StageNumber}} Approved',
     '<p>Hello {{RecipientName}},</p><p>Stage {{StageNumber}} of Purchase Order <strong>{{EntityNumber}}</strong> has been approved.</p><p><strong>Vendor:</strong> {{Vendor}}</p><p><strong>Approved By:</strong> {{ApprovedBy}}</p><p>The PO is now pending approval at the next stage.</p>',
     true, 'system', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
