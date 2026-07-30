-- Migration: Add "MSME Certificate" to the part_doc_types option set
-- Date: 2026-07-29
-- database/seed/ is deliberately INSERT-only (a no-op on any environment where the row
-- already exists, per database/migrations/README.md), so it only covers fresh/local
-- databases. This script is the companion patch for Dev/UAT/Prod, where option_set row
-- 786d09cd-0d8f-4870-b03c-665eebb8a3aa ('part_doc_types') already exists.
--
-- application.option_set."values" is typed `json` (not `jsonb` -- see
-- database/audit/uat.schema.sql), so the update casts to jsonb to concatenate/inspect and
-- casts back to json for storage.
--
-- Idempotent -- safe to re-run: the WHERE clause skips the row once "MSME Certificate" is
-- already present in the values array.

UPDATE application.option_set
SET "values" = ("values"::jsonb || '[{"name":"MSME Certificate","description":""}]'::jsonb)::json
WHERE id = '786d09cd-0d8f-4870-b03c-665eebb8a3aa'
  AND NOT ("values"::jsonb @> '[{"name":"MSME Certificate"}]'::jsonb);
