# Design Spec: Code-First Database Migrations + CI Automation

- **Date:** 2026-06-03
- **Status:** Reviewed by specialist panel (architecture, .NET/EF Core, PostgreSQL/DBA, CI/release-safety) — all returned **APPROVE-WITH-CHANGES**; their blocking items are incorporated below.
- **Owner:** Vijay
- **Repo:** `SpaceLinx/` (ASP.NET Core 10, EF Core 10.0.5, Npgsql 10.0.1, PostgreSQL on Azure Flexible Server — **confirm major version before Phase 1**)

---

## 1. Problem & Goal

### Today (database-first, manual)
1. Developer manually changes the **Dev** database.
2. Runs `dotnet ef dbcontext scaffold` to regenerate `SpaceLinxContext.cs` (7,523 lines) + entities.
3. Hand-edits the scaffold to fit conventions (`BaseModel`, soft-delete/audit) and authors the per-entity `Write/Read/Update/Ref` DTOs + AutoMapper + `SpaceLinxConstants`.
4. Promotes to UAT/Prod **manually** via ad-hoc SQL.

There are **four overlapping schema mechanisms**, in inconsistent states:
- SSDT project (`database/SpaceLinx/`) — holds ~20+ **business-logic stored procedures** (`mes.approve_eco`, `mes.release_eco`, `consume_inventory_for_kit`, `import_ebom`, …) and functions, **not just DDL**.
- Flyway versioned (`database/migrations/versioned/V001/V002`) — the only *tested+applied* scripts; create the partitioned `audit.change_log` + immutability trigger + **parameterized** role grants (`${app_role}`).
- Hand-written `database/migrations/EFMigrations/*.sql` — note `20250101_AddMultiLevelApprovalEntities.sql` uses **unqualified PascalCase** table names (`"ApprovalConfigurations"`), suggesting those tables may live in `public`, or were never applied as the SSDT snake_case equivalents.
- Ad-hoc `database/migrations/migration_*.sql` — substantive structural changes (column renames, new tables, FK additions) that may post-date the scaffold.

### Goal
A single, long-term, industry-standard **code-first** workflow where C# entities are the source of truth, changes flow **Dev → UAT → Prod through CI** with review + approval gates, and **current production (UAT/Prod, 33K+ live rows) is never recreated or disrupted**.

### Non-goals
- No rewrite of the 83 entities or their DTOs.
- No data migration / re-platforming.
- DTO/convention **code generator** — deferred (§12).
- Soft-delete global query filter — deferred to an isolated phase (§7 Phase 6).
- Audit-partition lifecycle management (pg_partman/pg_cron) stays a separate operational concern, untouched.
- **HR / Payroll / Expense schemas** — a separate product co-located on the same server (per `DB_FINDINGS.md`); **verified absent from `spacelinx_uat_v1`**. SpaceLinx owns exactly `mes`, `sc`, `common`, `application`, `pm` (+ `vm`/`dap`/`imagery` if present). Every dump and CI build uses an explicit schema allow-list so HR/Payroll/Expense are never migrated. See `database/audit/ef-exclusion-list.md` §0.

---

## 2. Decision

**EF Core Migrations become the single source of truth for relational schema (tables, columns, constraints, indexes), applied to each environment as a reviewed *idempotent SQL script* in a gated CI stage. Non-table objects are split into three explicitly-owned categories (§3.2). SSDT, Flyway, and ad-hoc SQL folders are retired and folded in — but only *after* the EF pipeline is proven on Dev (§7).**

Rationale: Microsoft's recommended production pattern is generating SQL scripts applied in a controlled deploy step — **not** `Database.Migrate()` at startup. Flyway is untested (no sunk cost). One tool with native .NET integration + drift detection wins long-term. The existing Azure DevOps environments + Key Vault DDL login + Prod approval are **reused**.

Alternatives rejected: **Hybrid (EF authors / Flyway applies)** keeps two histories forever; **keep Flyway hand-SQL** abandons the code-first goal.

---

## 3. Target Architecture

```
Developer edits C# entity (Part.cs : BaseModel)
        │  dotnet ef migrations add <Name>   (+ hand-author unsafe DDL as raw Sql, see §6)
        ▼
EF migration (C#) committed  ◄── single source of truth for TABLES
        │  CI BuildAPI: dotnet ef migrations script --idempotent → migrate.sql  (PUBLISHED as artifact)
        │              + has-pending-model-changes  (drift gate, ALL paths)
        ▼
Reviewed migrate.sql artifact  ──promoted byte-identical──►  Dev → UAT → Prod
        │  apply: SET ROLE spacelinxadmin · lock_timeout · ON_ERROR_STOP · KV DDL login · Prod approval · backup-first
        ▼
   3-phase apply per release:  (1) drop dependent views → (2) migrate.sql → (3) recreate views + re-assert functions/triggers/grants
```

### 3.1 Components

| Component | Location | Responsibility |
|---|---|---|
| Code-first entities | `SpaceLinx.Model/**/*.cs` | Source of truth for table schema. |
| `SpaceLinxContext` | `SpaceLinx.Model/SpaceLinxContext.cs` | DbContext; conventions via the **already-present** `OnModelCreatingPartial` (line 7523, invoked at 7520). |
| Migrations | `SpaceLinx.Model/Migrations/` (new) | EF C# migrations + model snapshot. Committed. |
| Repeatable VIEWS | `database/repeatable/views/NN_*.sql` (new) | Numbered-manifest, dependency-ordered `DROP …; CREATE` with `OWNER TO`/`GRANT`. |
| Versioned FUNCTIONS/PROCEDURES | `database/procedures/` (new) | Business-logic sprocs/functions — **versioned deploy with quiesce contract**, NOT blind re-run (§3.2). |
| Baseline-required objects | baseline migration `Up()` (raw `Sql`) | `pgcrypto` extension, 4 sequences, `generate_*` functions that **column defaults depend on** — created **before** `CreateTable`. |
| Design-time factory | `SpaceLinx.Model/SpaceLinxContextFactory.cs` (new) | `IDesignTimeDbContextFactory` — required because the context has a parameterless ctor. Dummy build-time connection. |
| CI migration stage | `azure-pipelines.yml` + repurposed `db-migrate.yml` | Generate+publish `migrate.sql`; download+apply per env via `psql`. |

### 3.2 Object Ownership Model (panel Blocking #1 — architect & DBA)

Three categories, **not two**:

| Category | Examples | Mechanism | Safety contract |
|---|---|---|---|
| **Tables / columns / constraints / indexes** | `mes.part`, FKs, PKs | **EF migrations** | Expand-contract; raw `Sql` for unsafe DDL (§6). |
| **Views** (stateless, read-only) | the 23 `ToView` views | **Repeatable SQL** — drop+recreate, dependency-ordered, idempotent, re-run every deploy | `CREATE OR REPLACE` is *not* enough (fails on column reorder/retype/drop). 3-phase ordering (§5). |
| **Functions & stored procedures** (transactional business logic) | `mes.approve_eco`, `consume_inventory_for_kit`, `import_ebom` | **Versioned deploy** — applied as a discrete, ordered step; **only when changed**; not blindly re-run mid-load | A `CREATE OR REPLACE PROCEDURE` during an in-flight transaction is a behavior change, not a no-op. Deploy during the same gated window, idempotent, with change detection. |

`audit.change_log` (range-partitioned, immutability trigger, identity PK) is in **none** of these — it is **excluded from the EF model entirely** and remains operationally separate. The `generate_*` functions and 4 sequences that table **defaults depend on** are a special case: authored into the **baseline `Up()`** (raw `Sql`, idempotent) so a from-scratch build is valid.

---

## 4. Brownfield Adoption (production-safety crux)

### 4.0 Phase −1 — Schema Reconciliation Audit (NEW, hard go/no-go gate; panel Blocking #2)
Before *any* tooling work, prove we know what's actually in each environment:
1. `pg_dump --schema-only` from a **UAT clone** and from Dev.
2. Enumerate objects **in DB but not in EF model** and **in model but not in DB** (tables, columns, types, sequences, functions, views, triggers, extensions).
3. Specifically resolve the `EFMigrations/20250101` PascalCase question: do `"ApprovalConfigurations"` etc. exist, in which schema, and does the scaffolded model reflect them?
4. Catalogue every object EF must **exclude** (views, `audit.*`, partitioned tables, functions, triggers, partial/BRIN indexes, identity columns, domain/enum types).
5. **Gate:** no Phase 0 work until this audit is signed off. Output: a reconciliation report + the exclusion list that feeds §4.2.

### 4.1 Phase 0 — Tooling
Add `Microsoft.EntityFrameworkCore.Design` (`PrivateAssets="all"`), `dotnet-ef` as a pinned local tool, and the design-time factory. No schema impact.

### 4.2 Phase 1 — Baseline that provably round-trips
1. Author baseline-required objects into the baseline `Up()` **first** (raw, idempotent `Sql`): `CREATE EXTENSION IF NOT EXISTS pgcrypto;`, the 4 sequences (`mes.guide_sequence_seq`, `material_kit`, `product`, `work_package`), and the `generate_*` functions referenced by column defaults — **then** the EF `CreateTable`s.
2. **Probe-empty gate (the real zero-delta gate; panel EF B3 + DBA B1):** immediately after generating the baseline, `dotnet ef migrations add _Probe` must yield a **genuinely empty** `Up()/Down()`. Iterate the model (computed columns, sequences, defaults, precision) until it does. Until empty, `has-pending-model-changes` (the CI drift gate) is permanently red.
3. **Semantic schema diff** (not text diff): apply baseline to a throwaway DB and compare to the UAT-clone schema with a real tool (`migra` / Liquibase diff). Triage with an **explicit allow-list** for known scaffold cosmetics (default-literal formatting, computed-expression whitespace/casts, index naming). Structural facts (tables/columns/types/nullability/PK/FK/unique) must match exactly.
4. Move the 23 views → `database/repeatable/views/`; sprocs/functions → `database/procedures/`; confirm exclusions per §4.0.

### 4.3 Phase 2 — Stamp existing environments (no DDL)
Stamp Dev/UAT/Prod so EF treats the live schema as already-applied. **Use the `INSERT INTO "__EFMigrationsHistory"` statement EF emits in `migrations script`** (panel EF R3) rather than a hand-written one, after letting EF create the history table:
```sql
-- taken verbatim from `dotnet ef migrations script` output:
INSERT INTO "__EFMigrationsHistory" ("MigrationId","ProductVersion")
VALUES ('00000000000000_Baseline','10.0.5') ON CONFLICT DO NOTHING;
```
**Post-stamp gate (DBA B1):** on a freshly-stamped UAT *clone*, run `has-pending-model-changes` → must be empty, and a no-op `migrations add` → empty SQL. This is the only trustworthy proof the model matches reality. Reverting Phase 2 is a single `DELETE FROM "__EFMigrationsHistory"`.

---

## 5. Views, Functions & Procedures — apply mechanics

**3-phase ordering per release (DBA B2/Q4):** the naive "migrations → repeatable" is unsafe when a migration drops/retypes a column a view depends on (PG blocks it). Correct order:
1. **Drop dependent views** (deterministic order from the manifest).
2. Apply `migrate.sql` (table DDL).
3. **Recreate views** (reverse manifest order) + **re-assert** functions/triggers/grants.

Rules:
- Views use `DROP VIEW IF EXISTS … ; CREATE VIEW …` (not bare `CREATE OR REPLACE`), with a **numbered manifest** encoding view-on-view dependencies (e.g. `grns_by_purchase_order_vw` after `purchase_orders_vw`). Avoid blind `CASCADE`.
- Every view/function file re-asserts `ALTER … OWNER TO spacelinxadmin;` and `GRANT … TO spacelinxuser;` (matches existing convention).
- **Parameterized role grants** (Flyway `${app_role}` placeholders in V002) must be reproduced with `psql -v app_role=… -v read_role=…` substitution — this mechanism is otherwise **lost** when Flyway is retired (DBA Q6).
- `mes.part` carries a `BEFORE INSERT/UPDATE` trigger; any migration touching it must **re-assert the trigger/function** in phase 3 in case a table rewrite dropped it.
- A CI lint rule: **no EF migration may reference the `audit` schema.**

---

## 6. PostgreSQL DDL Safety Patterns (NEW; DBA B4 + locking guidance)

EF's default generated DDL is unsafe for several operations at production scale. These are **hand-authored as raw-`Sql` migrations**, not left to EF's defaults:

| Operation | EF default (unsafe) | Required pattern |
|---|---|---|
| Apply session | (none) | `SET lock_timeout='2s'; SET statement_timeout='…';` at top of apply; bounded retry. |
| Add column | `ADD COLUMN … DEFAULT <volatile>` → **full table rewrite under ACCESS EXCLUSIVE** | Add **nullable, no volatile default** → backfill in batches → set default for future rows. |
| NOT NULL | `ALTER COLUMN … SET NOT NULL` (scan under lock) | `ADD CONSTRAINT chk CHECK (col IS NOT NULL) NOT VALID` → `VALIDATE CONSTRAINT` → `SET NOT NULL`. |
| Foreign key | `ADD FOREIGN KEY …` (validates child under lock) | `ADD CONSTRAINT … NOT VALID` → `VALIDATE CONSTRAINT`. |
| Index | `CREATE INDEX` (blocks writes) | `CREATE INDEX CONCURRENTLY` via `migrationBuilder.Sql(…, suppressTransaction: true)` — **cannot run in EF's default single transaction**; failure leaves an `INVALID` index needing a documented drop-and-retry. |

Because of `CONCURRENTLY`, migrations containing such steps **cannot** be wrapped in one transaction; the apply script handles them outside the transactional block. Confirm the Azure Flexible Server PG **major version** to pin exact version-gated patterns.

Convention enforcement (`OnModelCreatingPartial`) iterates `BaseModel`-assignable entity types for shared PK/audit config, but **excludes keyless/view-mapped types** (EF R5). Any convention added must keep the probe-empty gate green.

---

## 6.5 Seed & Reference Data (first-class — not an afterthought)

Seed data is part of "code-first": the schema is useless without the reference rows the app depends on. Today this is scattered across `database/migrations/seed/permissions.seed.sql` + `apply-permissions-seed.sh` (no CI integration) and a ~1,400-line `Consolidated.PostDeployment.sql`. `DB_FINDINGS.md` is explicit that **86 of 249 UI permissions have no DB row** — the instant server-side authorization is enforced, those endpoints **deny-by-default for everyone**. So seeding is a correctness prerequisite, not a convenience.

**Two-tier model:**

| Tier | Data | Mechanism | Why |
|---|---|---|---|
| **Static lookup / catalog** | permission catalog (the canonical UAT 164 + the 86 to add), currencies, countries, option/enum sets | **EF `HasData`** → emitted into migrations, version-controlled, diffable, applied by the same `migrate.sql` | Truly static, belongs with the schema; drift-detected by `has-pending-model-changes`; one source of truth that can also code-gen the C# + TS permission constants (closes the client/DB drift `DB_FINDINGS.md` calls out). |
| **Environment/operational seed** | larger reference loads, org/tenant bootstrap, anything env-specific | **Idempotent seed SQL** in `database/seed/`, applied as an **ordered pipeline step AFTER migrations + procedures** | Too large/volatile for `HasData`; must be idempotent (`INSERT … ON CONFLICT DO NOTHING` / upsert) and re-runnable. |

**Rules:**
- Seed runs **after** table migrations and function/procedure deploy, **before** the API deploy, inside the same gated window (so the app never starts against un-seeded reference data). The ordered seed step is **reserved in the template now** even where tooling is deferred, so ordering is locked (architect REC4).
- All seed is **idempotent and re-runnable** — promoted as part of the `dbscript` artifact, identical across Dev/UAT/Prod.
- **The 86 missing permissions + Super Admin bypass + the `VENDORS.DOC.DELETE` typo fix** are seeded *before/with* any authorization-enforcement rollout — tracked as an explicit dependency of that work, surfaced here because the migration pipeline is its delivery vehicle.
- Seed data is **owned `spacelinxadmin`-side and granted** like everything else (§7.3 ownership rules apply).

## 7. CI/CD Design

Reuses stage topology (`BuildAPI`, `BuildFrontend`, `ValidateDb`, `DeployDev/UAT/Prod`); each deploy stage already runs the `db-migrate` template **before** `AzureWebApp@1` (DB-before-API ordering is correctly guaranteed by `DeployApi* dependsOn DeployDb*`).

### 7.1 Artifact generation + promotion (panel CI Blocking #2 — currently NOT wired)
- In **BuildAPI**, run `dotnet ef migrations script --idempotent --output migrate.sql` (via design-time factory, no DB) and bundle `database/repeatable/` + `database/procedures/`; **publish as a `dbscript` artifact**.
- In the `db-migrate` template, **replace `checkout: self` with `download` of the `dbscript` artifact** so every environment applies the **byte-identical** script (today the template re-reads source per env — that defeats promotion and risks tag≠branch drift on Prod).

### 7.2 Drift gate on ALL paths (panel CI Blocking #4 + architect REC3)
- `has-pending-model-changes` + ephemeral-PG build-from-scratch must run not only on PRs to `main` but also on **`release/v*` and `v*`** as a hard `dependsOn` of UAT/Prod apply. Note `has-pending-model-changes` only catches **model-ahead-of-migrations**; pair it with the **post-stamp UAT-clone check** (§4.3) to also catch **DB-ahead-of-model** drift.

### 7.3 Gated apply (repurpose `db-migrate.yml`)
- Keep: `condition` opt-in, `AzureKeyVault@2` DDL login, `environment:` (Prod approval **does** gate the DB job — it's a deployment job bound to the environment).
- Replace Flyway docker step with `psql`:
  - Password via **`PGPASSWORD` env** (mapped from secret) — never in a connection-string arg; `ON_ERROR_STOP=1`; **no `set -x`**.
  - `SET ROLE spacelinxadmin;` (or run as a member) so new objects inherit the existing owner and `CREATE OR REPLACE VIEW` ownership succeeds; define `ALTER DEFAULT PRIVILEGES` so new EF tables are accessible to `spacelinxuser` + audit-read role (panel DBA Blocking #3).
  - Backup/snapshot step with a **verified completion gate** before UAT/Prod apply.
  - 3-phase apply (§5).
- **Tighten the API-deploy condition** to require `Succeeded` (not `Succeeded,Skipped`) for UAT/Prod once migrations are live, so the app never ships against an un-migrated schema (panel CI Blocking #1).
- **Rename `runDbMigrations` → `applyEfMigrations`** at cutover; cut Flyway→EF over **atomically** in the template (never leave both engines behind runtime conditions → double-apply risk).

### 7.4 Rollback policy (explicit)
**Forward-only, backward-compatible, contract-deferred.** No `Down()` on Prod. Recovery = redeploy previous app version (additive schema stays) or fix-forward. PITR/snapshot is the **disaster fallback only** (restoring loses writes since the snapshot). Contract steps (drop column/table) ship a **release later** than the app that stopped using them. Document the `CONCURRENTLY` invalid-index recovery runbook.

---

## 8. Rollout Sequence (reordered per architect Blocking #3)

1. **Phase −1 — Reconciliation audit** (§4.0). Go/no-go gate.
2. **Phase 0 — Tooling** (§4.1).
3. **Phase 1 — Baseline that round-trips** (§4.2); probe-empty + semantic-diff gates.
4. **Phase 2 — Stamp** Dev/UAT/Prod (no DDL); post-stamp UAT-clone gate (§4.3).
5. **Phase 3 — Wire CI on Dev and PROVE end-to-end** (artifact, drift gate, 3-phase apply) — **before** consolidating anything.
6. **Phase 4 — Consolidate** `EFMigrations/` + versioned + ad-hoc into tracked migrations applied through the *proven* pipeline; retire SSDT/Flyway/ad-hoc (archive history; decide fate of the `flyway_schema_history` ghost table — keep as historical record, no longer applied).
7. **Phase 5 — First real migration** end-to-end: the `sc.purchase_order` dept/status index from `DB_FINDINGS.md` (additive, `CONCURRENTLY`, measurable) — validates §6 patterns on something valuable+reversible.
8. **Phase 6 (separate, opt-in)** — soft-delete global query filter, with full regression.

**Environment policy gaps to close:**
- **Demo** (`spacelinx-mes-demo`, `dependsOn: []`) has **no DB migration path** and will drift from Prod on the first migration. Decide: share Prod's migration apply, or document as tolerated-drift with a rebuild procedure (architect REC1).
- **Per-env prerequisite:** an environment must be **stamped (Phase 2)** before `applyEfMigrations='true'` is flipped for it, else the idempotent script's baseline guard sees no history row and may attempt `CreateTable` on live tables (CI R11). Manual, verified checklist item.
- **Seeding** (§6.5): two-tier (static catalog via EF `HasData`, operational seed via idempotent SQL); reserve the ordered seed step in the template now so ordering vs migrations is locked. The 86 missing permissions are a hard prerequisite of authorization enforcement.

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Scaffolded model ≠ live schema (sequences, pgcrypto, computed cols, partial/BRIN idx, identity, partitioned audit) | EF emits destructive/invalid DDL | §4.0 audit + §4.2 probe-empty + semantic diff + exclusion list; baseline authors sequences/extension/functions first. |
| Stored-proc replaced mid-transaction | Behavioral incident | §3.2 versioned-deploy category, change-only, in gated window. |
| Object ownership mismatch (migration login ≠ `spacelinxadmin`) | `CREATE OR REPLACE VIEW` fails; new tables invisible to app | `SET ROLE spacelinxadmin` + `ALTER DEFAULT PRIVILEGES` (§7.3). |
| Long-locking DDL on `mes.part`/`sc.purchase_order` | Outage | §6 patterns: nullable-add+backfill, `NOT VALID`→`VALIDATE`, `CONCURRENTLY`+`suppressTransaction`, `lock_timeout`. |
| View column drop/retype vs dependents | Apply deadlock/failure | §5 3-phase drop→migrate→recreate, dependency manifest. |
| Lost Flyway `${role}` placeholder substitution | Broken grants across envs | `psql -v` substitution (§5). |
| Artifact not promoted (template `checkout: self`) | Env drift, tag≠branch on Prod | Publish `dbscript` in BuildAPI; `download` in template (§7.1). |
| Drift check PR-only | UAT/Prod path unguarded | Run on `release/v*` + `v*` (§7.2). |
| `Skipped → deploy anyway` | App ships vs un-migrated schema | Require `Succeeded` on UAT/Prod (§7.3). |
| Stamp before first apply missing | `CreateTable` on live table | Per-env stamped-before-flip prerequisite (§8). |
| Demo drift | Broken Demo | Define Demo policy (§8). |
| Half-applied migration on Prod | Partial schema | Forward-only/contract-deferred (§7.4); per-migration transactions where possible; PITR disaster-only. |

---

## 10. Success Criteria
- [ ] Dev adds a column by editing a C# entity + `dotnet ef migrations add`; no manual SQL, no scaffolding.
- [ ] `git push` flows Dev → UAT → Prod with review + Prod approval; **same `migrate.sql` artifact** across envs.
- [ ] CI **fails** on model-vs-migration drift (`has-pending-model-changes`) on **all** branch/tag paths; UAT-clone check catches DB-vs-model drift.
- [ ] UAT/Prod adopt code-first with **zero schema recreation / zero data loss** (probe-empty + semantic-diff + post-stamp gates pass).
- [ ] Baseline builds a **valid schema from scratch** on an empty DB (sequences/extension/functions present, correct order).
- [ ] SSDT/Flyway/ad-hoc retired; tables=EF, views=repeatable, procedures=versioned; the 23 views + functions reproducible.
- [ ] Demo + seeding ordering policies documented.
- [ ] Static reference data (permission catalog incl. the 86, lookups) seeded via EF `HasData`; operational seed idempotent + ordered after migrations; app never starts against un-seeded reference data.

---

## 11. Open Questions — resolved by panel
1. **Baseline path** → history-row stamping, using EF-emitted INSERT, gated by probe-empty + UAT-clone check. ✔
2. **Brownfield DDL safety** → §6 patterns; migration login `SET ROLE spacelinxadmin`. ✔
3. **Script vs bundle** → **idempotent script** (reviewable, `psql`-applied, promotable). Bundle is opaque/AOT-caveated. ✔
4. **Repeatable ordering** → 3-phase drop→migrate→recreate with dependency manifest. ✔
5. **SSDT retirement** → tables to EF; **procedures get their own versioned category** (not blind-repeatable); views repeatable. ✔

## 12. Deferred / Out of Scope
- DTO + AutoMapper code generator (revisit if entity cadence rises).
- Soft-delete global query filter (Phase 6).
- Row-level security `role_filter` (unused per `DB_FINDINGS.md`).
- Audit partition lifecycle (separate ops concern).
- Deployment slots for true zero-downtime (current in-place + hard restart relies on expand-contract; slots are a future enhancement — CI R14).
