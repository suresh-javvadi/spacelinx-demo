-- Rollback: Remove Additional Recipient Configuration Table
-- Date: 2026-01-04

DROP INDEX IF EXISTS common.idx_additional_recipient_config_template;
DROP TABLE IF EXISTS common.additional_recipient_configuration;
