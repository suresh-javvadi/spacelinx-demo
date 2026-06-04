# Code-First Migrations — Rollout & Shipping Plan

> Companion to the design spec (`2026-06-03-code-first-migrations-design.md`) and implementation plan
> (`2026-06-03-code-first-migrations.md`). Branch: `feature/code-first-migrations`.

## Status (2026-06-04, updated)
**Done & committed (offline-complete, container-validated):** Phase −1 audit, Phase 0 tooling,
Phase 1 baseline — **now genuinely matches UAT** (catalog-diff `TOTAL_BLOCKING=0`, independently
re-verified; the earlier "MATCH" was a false positive from sampling and has been reconciled, commit
184ee6c), CI pipeline, Flyway retired, audit as tamper-resistant incremental migration, idempotent
no-PII seed, **comprehensive catalog-diff fidelity gate committed + wired into CI** (acba785/bb209d6).
**Not started (need DB/DevOps):** per-environment stamping, end-to-end pipeline proof, infra setup.

**Runtime follow-ups (review before go-live, not schema):** (a) ~19 `timestamp without time zone`
columns now require the app to write `DateTime` as `DateTimeKind.Unspecified` (Npgsql throws otherwise);
(b) ~40 mechanical `?? 0`/`== true` null-coalescing fixes were applied in Controllers/Services for the
CLR-nullability changes — review for semantics; (c) R8: widen Dev's `sc.goods_receipt_note` status CHECK.

---

## What's left (work items)

| # | Item | Needs | Risk |
|---|------|-------|------|
| L1 | **Code review** the branch (esp. `Document.cs` nullable change + `DocumentController.cs ?? 0`, the surgically-edited baseline, the audit migration) | reviewer | med |
| L2 | **App-level smoke test** — run the API against an EF-built schema; confirm the regenerated context + Document nullability don't break runtime/tests | local/CI | med |
| L3 | **Branch/merge strategy** — `feature/code-first-migrations` is off `feature/audit-viewer-ui`; both ship together (audit migration depends on the audit-viewer entity) | decision | med |
| L4 | **Pre-existing uncommitted change** to `SpaceLinx.Api.csproj` (BOM + `UserSecretsId`) — not ours; decide keep/commit/discard | decision | low |
| L5 | **Infra setup** per env: DDL migration login (member of `spacelinxadmin`), Key Vault secrets, `applyEfMigrations` flag | DevOps | med |
| L6 | **Per-env stamping** (Dev→UAT→Prod) + post-stamp gate | DB conns | **high** |
| L7 | **Prove pipeline E2E** on Dev (Task 17), then a first real migration | DevOps | med |
| L8 | Follow-ups: `PLANNED_AddIntegrityConstraints` migration; `pg_partman`/`pg_cron` for audit partitions (before 2028-01); provision `spacelinx_audit_ro`; retire SSDT project | later | low |

---

## The ship sequence

### Stage A — Pre-merge (in the PR)
1. **L1 code review** + **L2 app smoke test**. The build is clean (0 errors); confirm the app *runs* against an EF-built DB (the `ValidateDb` CI job builds the schema from scratch — extend it / run locally to also start the API + hit a health endpoint).
2. Resolve **L3** (merge order) and **L4** (the stray csproj).
3. Merge to the integration branch. **Do not enable `applyEfMigrations` yet** (default `false` → DB jobs skip; API still deploys; zero behaviour change). Merging is safe because nothing applies migrations until the flag is flipped per env.

### Stage B — Infrastructure (one-time per environment) — **L5**
For Dev, UAT, Prod:
1. Ensure a **DDL migration login** exists and is a member of / can `SET ROLE spacelinxadmin` (owns new objects, can `CREATE OR REPLACE VIEW`).
2. Populate each environment's Key Vault:
   - `PgMigrationUrl` = **libpq conninfo** (`host=… port=5432 dbname=… user=… sslmode=require`) — *not* the old JDBC string.
   - `PgMigrationUser` / `PgMigrationPassword` (the DDL login).
   - `PgAppRole` = `spacelinxuser`; `PgAuditReadRole` = `spacelinx_audit_ro` (provision the role, or leave it — the audit grant is existence-guarded).
3. Confirm `keyVaultName` values in `azure-pipelines.yml` match the real vaults.

### Stage C — Adopt code-first per environment (Dev → UAT → Prod, ONE at a time) — **L6 (the critical step)**
This is the only step that touches a real database, and the stamp itself is **no-DDL**. For each environment, in order:

1. **Snapshot / backup** the database (and confirm PITR).
2. **Validate the baseline matches THIS environment** (not just UAT) with the COMPREHENSIVE gate:
   dump the env's schema and run `database/audit/run-catalog-diff.sh <env>.schema.sql --ef-db cmp_ef`
   (build `cmp_ef` from the migrations first) → **`TOTAL_BLOCKING` must be 0** (do NOT rely on
   `has-pending-model-changes` alone — that's what produced the false MATCH).
   - Dev is already verified: 0 vs UAT; vs Dev only the 1 GRN check (apply R8 to Dev first).
   - If any env shows drift, reconcile (forward migration, or apply the missing object) *before* stamping.
3. **Stamp** the real env: create `__EFMigrationsHistory` + insert the baseline row (the
   `database/stamp/stamp-baseline.sql` to be generated). **No schema change.**
4. **Re-verify** `has-pending-model-changes --connection <env>` = empty.
5. **Flip `applyEfMigrations=true`** for that environment only.
6. On the next pipeline run, the gated `DeployDb` job applies pending migrations — the **first one is
   `AddAuditChangeLog`**, which *creates* the audit schema (partitioned + tamper-resistant) in that
   env, then procedures/views/seed. Review that run's `migrate.sql` artifact before approving Prod.

> **Rollback at each step:** stamping is reversible (`DELETE FROM "__EFMigrationsHistory"`). Schema
> changes are forward-only + expand-contract; recovery = redeploy prior app version (additive schema
> stays) or PITR (disaster only). No `Down()` on Prod.

### Stage D — Prove the loop — **L7**
Ship one low-risk, high-value migration end-to-end (candidate: the `sc.purchase_order`
department/status index from `DB_FINDINGS.md` — `CREATE INDEX CONCURRENTLY` via `suppressTransaction`).
Watch it flow Dev → UAT → Prod (approval) and confirm `__EFMigrationsHistory` advances in each.

### Stage E — Steady state + follow-ups — **L8**
- New schema change = edit C# entity → `dotnet ef migrations add` → PR (drift gate) → merge → auto Dev/UAT/Prod.
- `PLANNED_AddIntegrityConstraints` (5 FKs + `document.file_*` NOT NULLs) after backfilling any violating rows.
- Enable `pg_partman`+`pg_cron` for audit partitions **before 2028-01** (no DEFAULT partition by design).
- Retire the SSDT project once EF is the sole source of truth.

---

## Go-live checklist (per environment)
- [ ] Backup taken & restore point recorded
- [ ] Baseline `has-pending-model-changes` against a clone of THIS env = empty
- [ ] DDL login + Key Vault secrets in place; `PgMigrationUrl` is libpq conninfo
- [ ] Stamped (`__EFMigrationsHistory` has the baseline row); re-verified empty pending
- [ ] `applyEfMigrations=true` set
- [ ] First gated run reviewed (`migrate.sql` artifact) — Prod behind manual approval
- [ ] Post-run: audit schema present & partitioned; app healthy; seed counts as expected

## Key risks to watch
- **Per-env schema drift** — the baseline matched UAT; Dev/Prod must each be verified before stamping (Stage C.2). This is the single most important gate.
- **`migrate.sql` must be the promoted artifact**, identical across envs (don't regenerate per env).
- **Don't flip `applyEfMigrations` before stamping** an env, or EF will try to `CreateTable` on live tables.
- **App behaviour** — `document.file_*` now nullable (temporary, to mirror UAT); re-tightened by `PLANNED_AddIntegrityConstraints`.
