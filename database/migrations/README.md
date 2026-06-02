# Database migrations — Flyway (automated per environment)

Schema/DDL changes are applied automatically by **Flyway** as part of the Azure DevOps pipeline.
A developer adds a versioned SQL script; the pipeline applies it — in order, once each, tracked in
`flyway_schema_history` — to **Dev → UAT → Prod** (Prod gated by the environment approval check).

```
src/** or database/** change ──► pipeline
   main            ──► Deploy Dev   ──► Flyway migrate (Dev)  ──► deploy API
   release/v*      ──► Deploy UAT   ──► Flyway migrate (UAT)  ──► deploy API
   tag v*          ──► Deploy Prod  ──► [approval] ──► Flyway migrate (Prod) ──► deploy API
```

## Layout

| Path | Purpose |
|------|---------|
| `database/migrations/versioned/` | **Flyway-managed** schema migrations: `V<n>__<desc>.sql`, applied once in order. |
| `database/flyway.conf` | Non-secret Flyway settings (baseline, safety). Connection + role placeholders are injected per environment from Key Vault. |
| `database/SpaceLinx/**` | SSDT schema-of-record (canonical table definitions). |
| `database/migrations/migration_*.sql` | **Legacy** pre-Flyway scripts — already applied everywhere; part of the implicit baseline (Flyway ignores them). |

> **Baseline:** everything that existed before Flyway adoption (the SSDT schema + the legacy
> `migration_*.sql`) is the baseline. Flyway manages **forward** changes only, starting at `V001`.
> Provision a brand-new database from the SSDT schema first, then let Flyway apply `V001+`.

## Adding a migration

1. Create `database/migrations/versioned/V<next>__<short_description>.sql` (e.g.
   `V003__add_widget_table.sql`). Keep numbers strictly increasing; never edit a script that has
   already been applied to any environment (Flyway validates checksums — add a new `V` instead).
2. Per-environment values use Flyway placeholders, e.g. `${app_role}` (see `V002` for an example).
3. Merge → the pipeline applies it automatically (Dev on `main`, UAT on `release/v*`, Prod on a
   `v*` tag after approval).

## Required Key Vault secrets (per environment)

The pipeline's `DeployDb*` job (`azure-pipelines.db-migrate.yml`) reads these from each
environment's Key Vault (`spacelinx-<env>-kv`):

| Secret | Value |
|--------|-------|
| `PgMigrationUrl` | `jdbc:postgresql://<host>:5432/<db>?sslmode=require` |
| `PgMigrationUser` / `PgMigrationPassword` | a **DDL-capable migration login** — separate from the app's runtime login |
| `PgAppRole` | the app's least-privilege runtime role (INSERT-only on `audit`) |
| `PgAuditReadRole` | a forensic read-only role for the `audit` schema |

> **Least privilege:** Flyway connects as the migration login (has DDL). The application's runtime
> login never has DDL and is INSERT-only on `audit` — enforced by `V002`. Keep them distinct.

> **Enabling the automated jobs:** the `DeployDb*` jobs are gated by the pipeline variable
> `runDbMigrations` (default `false`) so merging never breaks a deployment before Key Vault is
> ready. Once the secrets + migration role exist for an environment, set `runDbMigrations=true`
> (and confirm the `keyVaultName` values in `azure-pipelines.yml` match your vaults). Until then the
> jobs are skipped and the API still deploys. The PR-validation stage needs no setup — it uses a
> throwaway database.

## Manual / local run (fallback)

Same scripts, run Flyway locally against an environment (e.g. for a hotfix or a fresh dev box):

```bash
docker run --rm \
  -v "$PWD/database/migrations/versioned:/flyway/sql:ro" \
  -v "$PWD/database/flyway.conf:/flyway/conf/flyway.conf:ro" \
  -e FLYWAY_URL="jdbc:postgresql://<host>:5432/<db>?sslmode=require" \
  -e FLYWAY_USER="<migration_user>" -e FLYWAY_PASSWORD="<pwd>" \
  -e FLYWAY_PLACEHOLDERS_APP_ROLE="<app_role>" \
  -e FLYWAY_PLACEHOLDERS_READ_ROLE="<audit_read_role>" \
  flyway/flyway:11-alpine info validate migrate
```

## Data seeding is a separate track

Reference/data seeding (e.g. `seed/permissions.seed.sql`, generated from the permission catalog)
is **not** managed by Flyway — it follows the seed-runner track (see `TASKS.md` T1.15 and
`tools/permission-catalog/README.md`). Note: the audit feature needs `AUDIT.VIEW` /
`AUDIT.VIEW.REGULATED` seeded and granted before the read API enforces them.

## Audit-trail specifics & partition automation

The audit trail deploys via `V001__audit_change_log.sql` (table, indexes, monthly partitions
through 2028-01) and `V002__audit_change_log_hardening.sql` (INSERT-only grant, forensic read role,
append-only immutability trigger — parameterized by `${app_role}` / `${read_role}`).

To automate partition creation/retention beyond 2028-01, enable `pg_partman` + `pg_cron` once per
environment (allow-listed on Azure Database for PostgreSQL Flexible Server):

```sql
SELECT partman.create_parent('audit.change_log', 'occurred_at', '1 month', p_premake := 3);
UPDATE partman.part_config SET retention = '18 months', retention_keep_table = false
 WHERE parent_table = 'audit.change_log';
SELECT cron.schedule('audit_partman', '0 1 * * *', $$CALL partman.run_maintenance_proc()$$);
```

## Verify after a run

```sql
-- Flyway history
SELECT installed_rank, version, description, success, installed_on
FROM flyway_schema_history ORDER BY installed_rank;

-- audit table + partitions present
SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='audit' ORDER BY relname;

-- after exercising a create/update/delete via the API:
SELECT occurred_at, entity_type, operation, actor_email, changed_cols, correlation_id
FROM audit.change_log ORDER BY id DESC LIMIT 20;
```
