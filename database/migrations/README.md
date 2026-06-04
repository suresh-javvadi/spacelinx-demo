# Database migrations — EF Core code-first (automated per environment)

Schema is **code-first**: C# entities in `SpaceLinx.Model` are the source of truth. A developer
edits an entity and runs `dotnet ef migrations add <Name>`; CI builds a reviewed **idempotent SQL
script** (`migrate.sql`) once, publishes it as the `dbscript` artifact, and applies the *same
artifact* to **Dev → UAT → Prod** (Prod gated by the environment approval check).

```
src/** or database/** change ──► pipeline (azure-pipelines.yml)
   BuildAPI        ──► dotnet ef migrations script --idempotent ──► publish `dbscript` artifact
   ValidateDb      ──► has-pending-model-changes + build-from-scratch on ephemeral postgres:16
   main            ──► Deploy Dev   ──► DeployDb (psql 3-phase apply) ──► deploy API
   release/v*      ──► Deploy UAT   ──► DeployDb (psql 3-phase apply) ──► deploy API
   tag v*          ──► Deploy Prod  ──► [approval] ──► DeployDb ──► deploy API
```

> **Flyway has been retired.** The pipeline no longer runs Flyway; the migration apply is the EF
> idempotent script applied via `psql` (`azure-pipelines.db-migrate.yml`). See the code-first design
> spec and plan under `docs/superpowers/`.

## Layout

| Path | Purpose |
|------|---------|
| `src/SpaceLinx.Api/SpaceLinx.Model/Migrations/` | **EF Core migrations** (source of truth for tables/columns/indexes/constraints) + model snapshot. |
| `database/repeatable/views/` | The 23 views as dependency-ordered, idempotent SQL — re-applied every deploy (Phase 3 of the apply). |
| `database/procedures/` | Business-logic functions/stored procedures + triggers — versioned SQL applied after the migration. |
| `database/seed/` | Idempotent reference/privilege seed applied after schema (e.g. `00_default_privileges.sql`). |
| `database/audit/` | Schema reconciliation artifacts (baseline-vs-UAT proof, exclusion list). |
| `database/SpaceLinx/**` | Legacy SSDT schema (historical; being retired as EF takes over). |
| `database/migrations/migration_*.sql`, `EFMigrations/` | **Legacy** pre-adoption scripts — folded into the baseline; historical only. |

## Adding a schema change

1. Edit the C# entity in `SpaceLinx.Model`.
2. `dotnet ef migrations add <Name> --project SpaceLinx.Model --startup-project SpaceLinx.Api --output-dir Migrations` (run from `src/SpaceLinx.Api/`).
3. Review the generated migration; for unsafe DDL (volatile-default columns, `SET NOT NULL`, FK validation, `CREATE INDEX CONCURRENTLY`) hand-author the safe pattern (see design spec §6).
4. Commit. CI fails on model/migration drift (`has-pending-model-changes`) and applies the change Dev→UAT→Prod.

## Required Key Vault secrets (per environment)

`DeployDb*` (`azure-pipelines.db-migrate.yml`) reads these from each env's Key Vault:

| Secret | Value |
|--------|-------|
| `PgMigrationUrl` | **libpq conninfo / URI** for `psql`, e.g. `host=<h> port=5432 dbname=<db> user=<u> sslmode=require` |
| `PgMigrationUser` / `PgMigrationPassword` | a **DDL-capable migration login** (member of / `SET ROLE spacelinxadmin`), separate from the app runtime login |
| `PgAppRole` | the app's least-privilege runtime role |
| `PgAuditReadRole` | a forensic read-only role for the `audit` schema |

> The apply runs `SET ROLE spacelinxadmin` so new objects inherit the existing owner, sets
> `lock_timeout`, passes the password via `PGPASSWORD` env (never argv), and uses `ON_ERROR_STOP=1`.

> **Enabling the jobs:** gated by pipeline variable `applyEfMigrations` (default `false`). Per
> environment, **stamp the baseline into `__EFMigrationsHistory` first** (no-DDL), then set
> `applyEfMigrations=true`. The `ValidateDb` stage needs no setup (throwaway DB).

## Audit table (`audit.change_log`)

`audit.change_log` is created by the **`AddAuditChangeLog` EF migration** via raw SQL
(`migrationBuilder.Sql(...)`): the table is **range-partitioned by month** and **tamper-resistant**
(append-only — an immutability trigger plus revoked `UPDATE/DELETE/TRUNCATE` on the app role). The
`ChangeLog` EF entity is `ExcludeFromMigrations` and is mapped for **read/insert only**, so EF does
not try to also create or alter the table. It is applied through the **standard pipeline** (the same
idempotent `migrate.sql` promoted Dev → UAT → Prod) — the audit feature lives **on top of** the
baseline, not in it. The DDL was ported verbatim from the retired Flyway scripts (`V001`/`V002`).

Partition automation (`pg_partman`/`pg_cron`) beyond the pre-created range (2026-01 .. 2028-01)
remains a separate **operational concern**. The forensic read role (`spacelinx_audit_ro`) grants are
**existence-guarded** in the migration (a `pg_roles` check), so they are a clean **no-op until the
role is provisioned** per environment.

## Data seeding (`database/seed/`, applied after schema in the pipeline seed phase)

Idempotent SQL seed — **provably a no-op on populated environments**, so it only ever *adds*
missing rows on fresh databases (Demo, new provisioning, CI build-from-scratch). It never updates
or deletes existing data (INSERT-only).

| File | Contents |
|------|----------|
| `00_default_privileges.sql` | `ALTER DEFAULT PRIVILEGES` so new objects are reachable by the app role (`-v app_role`). |
| `10_reference_data.sql` | 10 reference tables (app, feature_bit, option_set, permission, role, role_permission, approval_configuration, country, email_template, platform). `ON CONFLICT DO NOTHING` — caught by each table's natural-key UNIQUE constraint, so a no-op even if UUIDs differ across envs. Generated with `--column-inserts` (explicit columns → correct on EF's column order). |
| `12_currency_payment_department.sql` | The 3 tables with only a PK (currency, payment_term, department) — guarded on their **natural key** (`WHERE NOT EXISTS`) since `ON CONFLICT` on `id` alone could otherwise duplicate. |
| `20_bootstrap_admin.sql` | One **parameterized** Super Admin per environment (`-v admin_email=…`) — no PII in git. Skips if not provided; idempotent. App auth is Azure AD, so the email must match a real Entra ID identity. |

**No PII in the repo:** `application.user` (424 real employees) and `user_role` are **not** seeded; audit
columns (`created_by`/`updated_by`) on reference rows are scrubbed to a generic `system` marker. Real
user provisioning is a per-environment concern (Azure AD), outside this repo.
