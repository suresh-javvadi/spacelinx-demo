-- =============================================
-- Project Management Demo Data Cleanup Script
-- SpaceLinx MES - PM Schema
-- =============================================
-- This script removes all demo data created by pm.demo_data.sql
-- Run this to clean up the demo data from the database
-- =============================================

-- Delete in reverse dependency order

-- Dashboard Widgets
DELETE FROM pm.dashboard_widget WHERE id LIKE 'dw000001-%';

-- Time Entries
DELETE FROM pm.time_entry WHERE id LIKE 'te000001-%';

-- Resource Allocations
DELETE FROM pm.resource_allocation WHERE id LIKE 'ra000001-%';

-- Task Activities
DELETE FROM pm.task_activity WHERE id LIKE 'tact0001-%';

-- Task Comments
DELETE FROM pm.task_comment WHERE id LIKE 'tc000001-%';

-- Task Dependencies
DELETE FROM pm.task_dependency WHERE id LIKE 'td000001-%';

-- Task Assignees
DELETE FROM pm.task_assignee WHERE id LIKE 'ta000001-%';

-- Tasks
DELETE FROM pm.task WHERE id LIKE 't0000001-%';

-- Board Columns (for demo projects)
DELETE FROM pm.board_column WHERE project_id LIKE 'pj000001-%';

-- Milestones
DELETE FROM pm.milestone WHERE id LIKE 'm0000001-%';

-- Projects
DELETE FROM pm.project WHERE id LIKE 'pj000001-%';

-- Programs
DELETE FROM pm.program WHERE id LIKE 'p0000001-%';

-- Customers (only demo customers)
DELETE FROM application.customer WHERE id LIKE 'c0000001-%';

-- Reset sequences (optional - uncomment if needed)
-- SELECT setval('pm.program_code_seq', 1, false);
-- SELECT setval('pm.project_code_seq', 1, false);
-- SELECT setval('pm.task_code_seq', 1, false);

-- =============================================
-- Verification queries (optional)
-- =============================================
-- SELECT 'Programs remaining:' as entity, COUNT(*) as count FROM pm.program WHERE id LIKE 'p0000001-%'
-- UNION ALL
-- SELECT 'Projects remaining:', COUNT(*) FROM pm.project WHERE id LIKE 'pj000001-%'
-- UNION ALL
-- SELECT 'Tasks remaining:', COUNT(*) FROM pm.task WHERE id LIKE 't0000001-%'
-- UNION ALL
-- SELECT 'Customers remaining:', COUNT(*) FROM application.customer WHERE id LIKE 'c0000001-%';
