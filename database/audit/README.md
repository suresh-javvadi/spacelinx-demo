# Schema Reconciliation Audit (Phase −1)

> Inputs for the code-first migration baseline. See `docs/superpowers/plans/2026-06-03-code-first-migrations.md` Tasks 1–2 and `docs/superpowers/specs/2026-06-03-code-first-migrations-design.md` §4.

## Provenance
- **Source:** `spacelinx_uat_v1` on `spacelinxdevs.postgres.database.azure.com` (read-only, app role `spacelinxuser`).
- **Captured:** 2026-06-03, `pg_dump --schema-only --no-owner --no-privileges` (client 18.4, server **PostgreSQL 16.12**).
- **File:** `uat.schema.sql` (schema-only DDL, no data, no credentials).
- Dev snapshot (`dev.schema.sql`) **pending** — Dev connection string not yet provided (needed for Task 10 stamping, not for the baseline gate).

## Object inventory (UAT)
| Object | Count | Notes |
|---|---:|---|
| Base tables | 114 | application 16, common 15, mes 40, pm 12, sc 31 — matches `DB_FINDINGS.md`. |
| Views | 23 | Exactly matches the `.ToView(...)` mappings in `SpaceLinxContext`. |
| Sequences | 19 | More than the 4 inferred from defaults — see below. |
| Functions | 20 | Business-logic + `generate_*`; go to `database/procedures/`. |
| Triggers | 2 | Re-assert in the view/procedure phase if a table they fire on is rewritten. |
| Indexes | 77 | Check for partial/BRIN among these (Task 2). |
| Identity columns | 0 | No `GENERATED ALWAYS AS IDENTITY` → removes a round-trip risk class. |

## Key findings
- **`audit` schema is ABSENT in UAT** — V001/V002 Flyway audit migrations were never applied here. Nothing to exclude for `audit`; the audit-trail feature is not deployed to UAT.
- **Multi-level-approval tables resolved:** `common.approval`, `common.approval_configuration`, `common.approval_log`, `common.approval_notification_recipient` exist as **snake_case in `common`** (not orphaned PascalCase in `public`). Resolves the `20250101_AddMultiLevelApprovalEntities.sql` ambiguity — the scaffolded model maps these.
- **19 sequences** (Task 5 must declare/own all that EF-created tables reference, or exclude function-owned ones):
  `application.{app_app_number,role_role_number,user_user_number}_seq`,
  `mes.{guide,material_kit,product,work_package}_sequence_seq`,
  `pm.{program_code,project_code,task_code}_seq`,
  `sc.{company_code,customer_code,grn,partner_code,purchase_order,req,scrap_number,vendor_code,vendor_return_number}_seq`.

## Server version → DDL safety (spec §6)
PostgreSQL **16.12** supports all version-gated safe patterns: fast `ADD COLUMN` with constant default, `ADD CONSTRAINT … NOT VALID` → `VALIDATE CONSTRAINT`, and `CREATE INDEX CONCURRENTLY`.
