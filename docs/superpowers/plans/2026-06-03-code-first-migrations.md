# Code-First EF Migrations + CI Automation — Implementation Plan (Phases −1 → 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adopt EF Core code-first migrations as the single source of truth for the SpaceLinx schema, with production safely baselined (no recreation) and the migration CI pipeline proven end-to-end on Dev.

**Architecture:** EF migrations own tables; views are dependency-ordered repeatable SQL; business-logic procedures are versioned deploy; sequences/extension/defaults-functions are authored into the baseline. Existing schema is adopted by stamping `__EFMigrationsHistory` (no DDL). A single reviewed idempotent `migrate.sql` artifact is built once and promoted across environments via the existing Azure DevOps + Key Vault + approval topology.

**Tech Stack:** ASP.NET Core 10, EF Core 10.0.5, Npgsql 10.0.1, PostgreSQL (Azure Flexible Server), Azure DevOps Pipelines, `psql`, a schema-diff tool (`migra` or Liquibase).

**Spec:** `docs/superpowers/specs/2026-06-03-code-first-migrations-design.md`

**Paths used throughout:**
- Model project: `src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinx.Model.csproj` (contains `SpaceLinxContext.cs`)
- Startup project: `src/SpaceLinx.Api/SpaceLinx.Api/SpaceLinx.Api.csproj`
- Solution: `src/SpaceLinx.Api/SpaceLinx.Api.sln`
- Pipelines: `azure-pipelines.yml`, `azure-pipelines.db-migrate.yml`

**Branch:** create `feature/code-first-migrations` off `main` before Task 1.

> ⚠️ **Production-safety invariant for the whole plan:** No task in Phases −1 → 3 runs DDL against real UAT/Prod. The only production touch is the Phase 2 *history-row stamp* (one INSERT, no schema change), gated by a runbook. All schema work happens on Dev and on disposable **UAT clones**.

---

## Milestone A — Phase −1: Schema Reconciliation Audit (go/no-go gate)

### Task 1: Capture authoritative schema snapshots

**Files:**
- Create: `database/audit/uat-clone.schema.sql`
- Create: `database/audit/dev.schema.sql`
- Create: `database/audit/README.md`

- [ ] **Step 1: Restore a disposable UAT clone**

Use a UAT backup/snapshot restored to a throwaway database (never dump from live Prod/UAT under load). Record the clone connection string in your shell only.

- [ ] **Step 2: Dump schema-only from the UAT clone and Dev**

Run:
```bash
pg_dump --schema-only --no-owner --no-privileges \
  -n mes -n sc -n common -n application -n pm -n vm -n dap -n imagery -n audit \
  "$UAT_CLONE_CONN" > database/audit/uat-clone.schema.sql
pg_dump --schema-only --no-owner --no-privileges \
  -n mes -n sc -n common -n application -n pm -n vm -n dap -n imagery -n audit \
  "$DEV_CONN" > database/audit/dev.schema.sql
```
Expected: two non-empty `.sql` files.

- [ ] **Step 3: Record object counts**

Run:
```bash
grep -cE "^CREATE TABLE" database/audit/uat-clone.schema.sql
grep -cE "^CREATE (OR REPLACE )?VIEW" database/audit/uat-clone.schema.sql
grep -cE "^CREATE SEQUENCE" database/audit/uat-clone.schema.sql
grep -cE "^CREATE (OR REPLACE )?FUNCTION" database/audit/uat-clone.schema.sql
grep -cE "^CREATE TRIGGER" database/audit/uat-clone.schema.sql
```
Write the counts into `database/audit/README.md` (date, source, counts).

- [ ] **Step 4: Commit**

```bash
git add database/audit/
git commit -m "chore(db-audit): capture UAT-clone + Dev schema snapshots"
```

### Task 2: Build the reconciliation report + exclusion list (GATE)

**Files:**
- Create: `database/audit/reconciliation-report.md`
- Create: `database/audit/ef-exclusion-list.md`

- [ ] **Step 1: Inventory objects in DB but not in the EF model**

Cross-reference `database/audit/uat-clone.schema.sql` against `src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContext.cs`. For each schema, list tables/columns/sequences/functions/views/triggers/extensions present in the dump. Grep the context for coverage:
```bash
grep -oE 'ToTable\("[^"]+", "[^"]+"\)' src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContext.cs | sort -u
grep -oE 'ToView\("[^"]+", "[^"]+"\)'  src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContext.cs | sort -u
grep -cE 'HasSequence|HasPostgresExtension' src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContext.cs
```

- [ ] **Step 2: Resolve the `ApprovalConfigurations` question**

In the UAT clone, determine the real schema/casing of the multi-level-approval tables that `database/migrations/EFMigrations/20250101_AddMultiLevelApprovalEntities.sql` creates with unqualified PascalCase names:
```bash
psql "$UAT_CLONE_CONN" -c "\dt *.*approval*"
psql "$UAT_CLONE_CONN" -c "SELECT table_schema, table_name FROM information_schema.tables WHERE table_name ILIKE '%approval%';"
```
Record whether they landed in `public`, in `common`/`application` (snake_case), or are absent. This determines whether the scaffolded model matches reality.

- [ ] **Step 3: Write the exclusion list**

In `database/audit/ef-exclusion-list.md`, enumerate every object EF must NOT own (feeds Task 5):
- All `ToView` views (23).
- `audit.change_log` + all partitions + the immutability trigger/function (range-partitioned; EF cannot model).
- All functions/stored procedures (go to `database/procedures/`).
- Triggers (e.g. the `mes.part` BEFORE INSERT/UPDATE trigger).
- Partial indexes, BRIN indexes, `WITH (pages_per_range=…)` indexes.
- Identity columns (`GENERATED ALWAYS AS IDENTITY`).
- Domain/enum/extension types.

- [ ] **Step 4: Write the reconciliation report and decide GO/NO-GO**

`database/audit/reconciliation-report.md` must state, explicitly: (a) tables in DB-not-model and model-not-DB, (b) the ApprovalConfigurations resolution, (c) any ad-hoc `migration_*.sql` changes not reflected in the model, (d) the GO/NO-GO decision. **Do not proceed to Milestone B until this says GO.**

- [ ] **Step 5: Commit**

```bash
git add database/audit/
git commit -m "docs(db-audit): reconciliation report + EF exclusion list (Phase -1 gate)"
```

---

## Milestone B — Phase 0: Tooling

### Task 3: Add EF Core design package + pinned dotnet-ef tool

**Files:**
- Modify: `src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinx.Model.csproj`
- Modify: `src/SpaceLinx.Api/SpaceLinx.Api/SpaceLinx.Api.csproj` (startup project — see note)
- Create: `src/SpaceLinx.Api/.config/dotnet-tools.json`

- [ ] **Step 1: Add the Design package to BOTH the model and startup projects**

In `SpaceLinx.Model.csproj` AND `SpaceLinx.Api.csproj`, inside the existing `<ItemGroup>` with EF packages, add:
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.5">
  <PrivateAssets>all</PrivateAssets>
  <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
</PackageReference>
```
> **Why both:** `PrivateAssets=all` stops the Model project's reference from flowing transitively, so `dotnet ef` fails with *"startup project doesn't reference Microsoft.EntityFrameworkCore.Design"* unless the **startup** project (`SpaceLinx.Api`) also references it. (Learned during execution — the Design ref on the startup project was committed in Task 4's commit.)

- [ ] **Step 2: Create a pinned local tool manifest**

Run from `src/SpaceLinx.Api/`:
```bash
cd src/SpaceLinx.Api
dotnet new tool-manifest
dotnet tool install dotnet-ef --version 10.0.5
```
Expected: `.config/dotnet-tools.json` created listing `dotnet-ef` 10.0.5.

- [ ] **Step 3: Verify restore + build**

Run:
```bash
dotnet tool restore
dotnet build SpaceLinx.Api.sln
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinx.Model.csproj src/SpaceLinx.Api/.config/dotnet-tools.json
git commit -m "build(ef): add EntityFrameworkCore.Design + pinned dotnet-ef 10.0.5"
```

### Task 4: Add a design-time DbContext factory

**Files:**
- Create: `src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContextFactory.cs`

- [ ] **Step 1: Write the factory**

The scaffolded context has a parameterless ctor, so `dotnet ef` could instantiate it with no provider. An explicit factory makes design-time deterministic and never contacts a real DB:
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SpaceLinx.Model;

// Used ONLY by `dotnet ef` at design time (migrations add/script).
// Connection string is a non-contacting placeholder — no DB access needed to build the model.
public class SpaceLinxContextFactory : IDesignTimeDbContextFactory<SpaceLinxContext>
{
    public SpaceLinxContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<SpaceLinxContext>()
            .UseNpgsql("Host=localhost;Database=spacelinx_design;Username=design;Password=design")
            .Options;
        return new SpaceLinxContext(options);
    }
}
```

- [ ] **Step 2: Verify EF can load the model**

Run from `src/SpaceLinx.Api/`:
```bash
dotnet ef dbcontext info --project SpaceLinx.Model --startup-project SpaceLinx.Api
```
Expected: prints provider `Npgsql.EntityFrameworkCore.PostgreSQL` and entity count; no connection error.

- [ ] **Step 3: Commit**

```bash
git add src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContextFactory.cs
git commit -m "feat(ef): add design-time DbContext factory"
```

---

## Milestone C — Phase 1: Baseline that provably round-trips

### Task 5: Configure the model for faithful round-trip (audit-accurate)

> **Updated from the Phase −1 audit (`database/audit/reconciliation-report.md` + `ef-exclusion-list.md`):**
> - **No `pgcrypto`** — `gen_random_uuid()` is core in PostgreSQL 13+ (server is 16.12). Do NOT add `HasPostgresExtension`.
> - **7** default-backing sequences (not 4) need declaring.
> - The **7 unmapped non-domain tables** (`sc.item`, 6 staging/scratch) need **no action** — they're not in the model, so EF ignores them; `audit` schema is absent. No `ExcludeFromMigrations` calls are needed.
> - **`common.fcm_token`** must be **modeled** (user decision) so the from-scratch build includes it.
> - The **46 partial soft-delete indexes** are NOT pre-configured here — let the probe (Task 7) reveal whether the scaffold already captured them, then fix only what's flagged.

**Files:**
- Modify: `src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContext.cs` (`OnModelCreatingPartial`)
- Create: `src/SpaceLinx.Api/SpaceLinx.Model/FcmToken/FcmToken.cs` (follow the existing per-entity folder convention)

- [ ] **Step 1: Declare the 7 default-backing sequences**

In `OnModelCreatingPartial(ModelBuilder modelBuilder)` add (exact names+schemas from the audit):
```csharp
modelBuilder.HasSequence<long>("app_app_number_seq", "application");
modelBuilder.HasSequence<long>("role_role_number_seq", "application");
modelBuilder.HasSequence<long>("user_user_number_seq", "application");
modelBuilder.HasSequence<long>("guide_sequence_seq", "mes");
modelBuilder.HasSequence<long>("material_kit_sequence_seq", "mes");
modelBuilder.HasSequence<long>("product_sequence_seq", "mes");
modelBuilder.HasSequence<long>("work_package_sequence_seq", "mes");
```
> Verify the sequence integer type against the dump (`CREATE SEQUENCE … AS <type>`); use `<int>` if they're `integer`, `<long>` if `bigint`. Match the dump exactly or the probe (Task 7) will flag a delta.

- [ ] **Step 2: Model the `FcmToken` entity (composite PK)**

The live DDL (from `database/audit/uat.schema.sql`) is:
```sql
CREATE TABLE common.fcm_token (
    id uuid DEFAULT gen_random_uuid(),
    email character varying(255) NOT NULL,
    device_id character varying(255) NOT NULL,
    device_token character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);
ALTER TABLE ONLY common.fcm_token ADD CONSTRAINT fcm_token_pkey PRIMARY KEY (email, device_id);
```
Note: the PK is the **composite (email, device_id)** — NOT `id`. `id` is an ordinary auto-defaulted uuid column. So `FcmToken` cannot simply inherit `BaseModel` (whose key is `Id`). Create the entity explicitly:
```csharp
namespace SpaceLinx.Model;

public partial class FcmToken
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string DeviceId { get; set; } = null!;
    public string? DeviceToken { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = null!;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
}
```
Add the DbSet to `SpaceLinxContext` (matching the existing `public virtual DbSet<X> Xs { get; set; }` style) and configure it in `OnModelCreatingPartial` mirroring the scaffold's conventions for other `common` tables (snake_case columns, `varchar(255)`, tz timestamps):
```csharp
modelBuilder.Entity<FcmToken>(entity =>
{
    entity.HasKey(e => new { e.Email, e.DeviceId });
    entity.ToTable("fcm_token", "common");
    entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
    entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(255);
    entity.Property(e => e.DeviceId).HasColumnName("device_id").HasMaxLength(255);
    entity.Property(e => e.DeviceToken).HasColumnName("device_token").HasMaxLength(255);
    entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
    entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
    entity.Property(e => e.CreatedBy).HasColumnName("created_by").HasMaxLength(255);
    entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
    entity.Property(e => e.UpdatedBy).HasColumnName("updated_by").HasMaxLength(255);
    entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
    entity.Property(e => e.DeletedBy).HasColumnName("deleted_by").HasMaxLength(255);
});
```

- [ ] **Step 3: Build**

Run: `dotnet build src/SpaceLinx.Api/SpaceLinx.Api.sln`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContext.cs src/SpaceLinx.Api/SpaceLinx.Model/FcmToken/
git commit -m "feat(ef): declare 7 default-backing sequences + model FcmToken (composite PK)"
```

### Task 6: Generate the baseline migration and author pre-table objects

**Files:**
- Create: `src/SpaceLinx.Api/SpaceLinx.Model/Migrations/*_Baseline.cs` (generated)
- Modify: the generated baseline `Up()` to prepend raw SQL

- [ ] **Step 1: Generate the baseline**

Run from `src/SpaceLinx.Api/`:
```bash
dotnet ef migrations add Baseline \
  --project SpaceLinx.Model --startup-project SpaceLinx.Api \
  --output-dir Migrations
```
Expected: a `Migrations/` folder with `<timestamp>_Baseline.cs` + `SpaceLinxContextModelSnapshot.cs`.

- [ ] **Step 2: Prepend the DDL-ordering function(s) to `Up()`**

> **Audit-corrected:** **No `CREATE EXTENSION`** (gen_random_uuid is PG-core). **No manual `CREATE SEQUENCE`** — the 7 sequences are now modeled via `HasSequence` (Task 5), so EF emits `CreateSequence` itself. The only pre-table dependency is the function(s) a column `DEFAULT` calls.

Per the audit, `application.generate_alphanumeric_sequence` is referenced by column defaults (e.g. `mes.guide.number`), so it must exist **before** the `CreateTable`s. At the very top of the generated `Up(MigrationBuilder migrationBuilder)`, before any `CreateTable`, prepend its body verbatim from `database/audit/uat.schema.sql` (the dump is the authoritative source; the function appears there):
```csharp
migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION application.generate_alphanumeric_sequence(/* …signature from dump… */)
RETURNS text AS $$ /* …body copied verbatim from uat.schema.sql… */ $$ LANGUAGE plpgsql;");
```
Cross-check the dump for any OTHER function called inside a column `DEFAULT` (grep `DEFAULT .*\(` in the table DDL); add each such function here in dependency order. Pure business-logic functions (the other ~19) are NOT needed for the baseline — they go to `database/procedures/` (Task 9).
> This `Up()` **only ever runs on an empty DB** (fresh CI build / new env). On existing DBs it is skipped — the Phase 2 stamp marks the baseline already-applied.

- [ ] **Step 3: Build**

Run: `dotnet build src/SpaceLinx.Api/SpaceLinx.Api.sln`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/SpaceLinx.Api/SpaceLinx.Model/Migrations/
git commit -m "feat(ef): baseline migration with pre-table extension/sequences/functions"
```

### Task 7: Probe-empty gate (the real zero-delta proof)

**Files:** none persisted (probe is generated then removed)

- [ ] **Step 1: Generate a probe migration**

Run from `src/SpaceLinx.Api/`:
```bash
dotnet ef migrations add _Probe --project SpaceLinx.Model --startup-project SpaceLinx.Api --output-dir Migrations
```

- [ ] **Step 2: Assert the probe is empty**

Open `Migrations/<timestamp>__Probe.cs`. Expected: `Up()` and `Down()` bodies are empty (no operations). If NOT empty, the model does not round-trip — note each operation (these are usually computed-column formatting, default-literal, or precision mismatches), fix the model config, and regenerate. Iterate until empty.

- [ ] **Step 3: Remove the probe once empty**

Run:
```bash
dotnet ef migrations remove --project SpaceLinx.Model --startup-project SpaceLinx.Api
```
Expected: probe files deleted; snapshot unchanged.

- [ ] **Step 4: Verify drift gate is green**

Run:
```bash
dotnet ef migrations has-pending-model-changes --project SpaceLinx.Model --startup-project SpaceLinx.Api
```
Expected: exit code 0 ("No changes have been made…"). This same command becomes the CI drift gate (Task 14).

- [ ] **Step 5: Commit any model fixes**

```bash
git add -A src/SpaceLinx.Api/SpaceLinx.Model/
git commit -m "fix(ef): model round-trips to empty migration (probe-empty gate green)"
```

### Task 8: Semantic schema diff vs UAT clone

**Files:**
- Create: `database/audit/baseline-vs-uat.diff`
- Create: `database/audit/diff-allowlist.md`

- [ ] **Step 1: Build a fresh DB from the baseline**

Run:
```bash
createdb spacelinx_baseline_check
dotnet ef database update --project SpaceLinx.Model --startup-project SpaceLinx.Api \
  --connection "Host=localhost;Database=spacelinx_baseline_check;Username=postgres;Password=postgres"
```
Expected: baseline applies cleanly on the empty DB (proves sequences/extension/functions order is valid).

- [ ] **Step 2: Diff against the UAT clone semantically**

Using `migra` (or Liquibase diff):
```bash
migra "postgresql:///spacelinx_baseline_check" "$UAT_CLONE_CONN" > database/audit/baseline-vs-uat.diff || true
```

- [ ] **Step 3: Triage into an allow-list**

Every line in the diff is either (a) a **structural** difference (table/column/type/nullability/PK/FK/unique) → must be fixed in the model and re-probed (back to Task 7), or (b) a **known cosmetic** (default-literal formatting, computed-expression whitespace/casts, index naming, view/function bodies owned elsewhere) → record in `database/audit/diff-allowlist.md` with a one-line justification. Gate: zero un-allow-listed structural deltas.

- [ ] **Step 4: Clean up + commit**

```bash
dropdb spacelinx_baseline_check
git add database/audit/baseline-vs-uat.diff database/audit/diff-allowlist.md
git commit -m "test(db): semantic baseline-vs-UAT diff triaged; zero structural delta"
```

### Task 9: Extract views (repeatable) and procedures (versioned)

**Files:**
- Create: `database/repeatable/views/00_manifest.md`
- Create: `database/repeatable/views/NN_<view>.sql` (one per view, 23 total)
- Create: `database/procedures/00_manifest.md`
- Create: `database/procedures/NN_<proc>.sql` (one per function/procedure)

- [ ] **Step 1: Extract each view to a numbered file**

For each of the 23 `ToView` views, create `database/repeatable/views/NN_<name>.sql` containing `DROP VIEW IF EXISTS <schema>.<name>; CREATE VIEW … ; ALTER VIEW <schema>.<name> OWNER TO spacelinxadmin; GRANT SELECT ON <schema>.<name> TO spacelinxuser;` — bodies copied from the UAT-clone dump.

- [ ] **Step 2: Order the manifest by dependency**

In `00_manifest.md`, list the files in **apply order** (a view referenced by another comes first; e.g. `purchase_orders_vw` before `grns_by_purchase_order_vw`). The recreate phase applies in this order; the drop phase applies in reverse.

- [ ] **Step 3: Extract procedures/functions**

Move each business-logic function/stored procedure (`mes.approve_eco`, `consume_inventory_for_kit`, `import_ebom`, …) from `database/SpaceLinx/**` into `database/procedures/NN_<name>.sql` as idempotent `CREATE OR REPLACE … ; ALTER … OWNER TO spacelinxadmin; GRANT EXECUTE … TO spacelinxuser;`. (Functions that column DEFAULTs depend on stay in the baseline per Task 6 — do not duplicate.)

- [ ] **Step 4: Verify the view set re-applies on the baseline DB**

Run:
```bash
createdb spacelinx_view_check
dotnet ef database update --project SpaceLinx.Model --startup-project SpaceLinx.Api \
  --connection "Host=localhost;Database=spacelinx_view_check;Username=postgres;Password=postgres"
# apply procedures then views in manifest order:
for f in $(awk '/^[0-9]/{print $1}' database/procedures/00_manifest.md); do psql "postgresql:///spacelinx_view_check" -v ON_ERROR_STOP=1 -f database/procedures/$f; done
for f in $(awk '/^[0-9]/{print $1}' database/repeatable/views/00_manifest.md); do psql "postgresql:///spacelinx_view_check" -v ON_ERROR_STOP=1 -f database/repeatable/views/$f; done
```
Expected: all apply with no error. Then `dropdb spacelinx_view_check`.

- [ ] **Step 5: Commit**

```bash
git add database/repeatable/ database/procedures/
git commit -m "feat(db): extract 23 views (repeatable, ordered) + procedures (versioned)"
```

---

## Milestone D — Phase 2: Stamp existing environments (no DDL)

### Task 10: Generate the stamp script and stamp Dev

**Files:**
- Create: `database/stamp/stamp-baseline.sql`

- [ ] **Step 1: Generate the EF history INSERT**

Run from `src/SpaceLinx.Api/`:
```bash
dotnet ef migrations script --idempotent \
  --project SpaceLinx.Model --startup-project SpaceLinx.Api \
  -o /tmp/full-baseline.sql
```
From `/tmp/full-baseline.sql`, copy the `CREATE TABLE … "__EFMigrationsHistory" …` block and the final `INSERT INTO "__EFMigrationsHistory" …VALUES ('<ts>_Baseline','10.0.5')…` line into `database/stamp/stamp-baseline.sql`. Wrap the INSERT with `ON CONFLICT DO NOTHING`. **Do not** include any `CreateTable` from the script.

- [ ] **Step 2: Stamp Dev**

Run:
```bash
psql "$DEV_CONN" -v ON_ERROR_STOP=1 -f database/stamp/stamp-baseline.sql
```
Expected: history table exists with exactly one baseline row; no other DDL ran.

- [ ] **Step 3: Post-stamp gate on Dev**

Run:
```bash
dotnet ef migrations has-pending-model-changes \
  --project SpaceLinx.Model --startup-project SpaceLinx.Api \
  --connection "$DEV_CONN"
```
Expected: exit 0. If non-zero, the model disagrees with Dev reality → return to Task 7/8.

- [ ] **Step 4: Commit**

```bash
git add database/stamp/stamp-baseline.sql
git commit -m "feat(db): baseline history-stamp script; Dev stamped + verified"
```

### Task 11: Stamp a UAT clone and prove zero pending changes (rehearsal for Prod)

**Files:**
- Create: `database/stamp/RUNBOOK.md`

- [ ] **Step 1: Stamp the UAT clone**

Run:
```bash
psql "$UAT_CLONE_CONN" -v ON_ERROR_STOP=1 -f database/stamp/stamp-baseline.sql
```

- [ ] **Step 2: Post-stamp gate on the UAT clone**

Run:
```bash
dotnet ef migrations has-pending-model-changes \
  --project SpaceLinx.Model --startup-project SpaceLinx.Api \
  --connection "$UAT_CLONE_CONN"
```
Expected: exit 0. Also generate a no-op migration and confirm empty SQL, then `migrations remove`.

- [ ] **Step 3: Write the production stamp runbook**

`database/stamp/RUNBOOK.md` documents the exact, gated procedure for stamping **real UAT then Prod**: snapshot first → apply `stamp-baseline.sql` via the Key Vault DDL login → run the post-stamp `has-pending-model-changes` gate → rollback is `DELETE FROM "__EFMigrationsHistory" WHERE "MigrationId" LIKE '%_Baseline'`. Real UAT/Prod stamping is executed by a human via this runbook during a change window — **not** by this pipeline.

- [ ] **Step 4: Commit**

```bash
git add database/stamp/RUNBOOK.md
git commit -m "docs(db): production stamp runbook; UAT-clone stamp verified"
```

---

## Milestone E — Phase 3: Wire CI on Dev and prove end-to-end

### Task 12: Generate + publish the `dbscript` artifact in BuildAPI

**Files:**
- Modify: `azure-pipelines.yml` (the `BuildAPI` stage, ~lines 41-83)

- [ ] **Step 1: Add migrate.sql generation + artifact publish**

In the `BuildAPI` job, after the publish step, add steps that build the promotable DB artifact (no DB connection needed — uses the design-time factory):
```yaml
          - script: |
              cd src/SpaceLinx.Api
              dotnet tool restore
              dotnet ef migrations script --idempotent \
                --project SpaceLinx.Model --startup-project SpaceLinx.Api \
                -o $(Build.ArtifactStagingDirectory)/dbscript/migrate.sql
              cp -r ../../database/repeatable $(Build.ArtifactStagingDirectory)/dbscript/repeatable
              cp -r ../../database/procedures $(Build.ArtifactStagingDirectory)/dbscript/procedures
              cp -r ../../database/seed       $(Build.ArtifactStagingDirectory)/dbscript/seed 2>/dev/null || true
            displayName: 'Generate idempotent migrate.sql + repeatable/procedures/seed'
          - publish: $(Build.ArtifactStagingDirectory)/dbscript
            artifact: dbscript
            displayName: 'Publish dbscript artifact'
```

- [ ] **Step 2: Validate YAML locally**

Run: `python -c "import yaml,sys; yaml.safe_load(open('azure-pipelines.yml')); print('ok')"`
Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add azure-pipelines.yml
git commit -m "ci: build + publish promotable dbscript artifact in BuildAPI"
```

### Task 13: Repurpose db-migrate.yml — download artifact + psql 3-phase apply

**Files:**
- Modify: `azure-pipelines.db-migrate.yml`

- [ ] **Step 1: Replace `checkout: self` with artifact download**

In the deployment job, swap the Flyway docker step for an artifact download + `psql` apply:
```yaml
            - download: current
              artifact: dbscript
            - task: AzureKeyVault@2
              displayName: 'Fetch DB migration secrets'
              inputs:
                azureSubscription: ${{ parameters.azureSubscription }}
                KeyVaultName: ${{ parameters.keyVaultName }}
                SecretsFilter: 'PgMigrationUrl,PgMigrationUser,PgMigrationPassword,PgAppRole,PgAuditReadRole'
            - script: |
                set -euo pipefail   # NOTE: no `set -x` — never echo secrets
                export PGPASSWORD="$PG_PASS"
                PSQL="psql $PG_URL -v ON_ERROR_STOP=1 -v app_role=$PG_APP_ROLE -v read_role=$PG_READ_ROLE"
                # Session safety + ownership:
                $PSQL -c "SET lock_timeout='2s'; SET statement_timeout='15min'; SET ROLE spacelinxadmin;"
                # Phase 1: drop dependent views (reverse manifest order)
                for f in $(tac $(Pipeline.Workspace)/dbscript/repeatable/views/00_manifest.order); do $PSQL -c "DROP VIEW IF EXISTS $f;"; done
                # Phase 2: tables
                $PSQL -f $(Pipeline.Workspace)/dbscript/migrate.sql
                # Phase 3: procedures, then recreate views, then (reserved) seed
                for f in $(awk '/^[0-9]/{print $1}' $(Pipeline.Workspace)/dbscript/procedures/00_manifest.md); do $PSQL -f $(Pipeline.Workspace)/dbscript/procedures/$f; done
                for f in $(awk '/^[0-9]/{print $1}' $(Pipeline.Workspace)/dbscript/repeatable/views/00_manifest.md); do $PSQL -f $(Pipeline.Workspace)/dbscript/repeatable/views/$f; done
                # Seed step (reserved; runs after schema, before API deploy):
                if [ -d "$(Pipeline.Workspace)/dbscript/seed" ]; then for f in $(Pipeline.Workspace)/dbscript/seed/*.sql; do [ -e "$f" ] && $PSQL -f "$f"; done; fi
              displayName: 'Apply EF migrations + procedures + views + seed (3-phase)'
              env:
                PG_URL: $(PgMigrationUrl)
                PG_PASS: $(PgMigrationPassword)
                PG_APP_ROLE: $(PgAppRole)
                PG_READ_ROLE: $(PgAuditReadRole)
```
> The `CONCURRENTLY` caveat: migrations containing `CREATE INDEX CONCURRENTLY` are authored with `suppressTransaction: true` (spec §6); document the invalid-index recovery in `database/stamp/RUNBOOK.md`.

- [ ] **Step 2: Add `ALTER DEFAULT PRIVILEGES` once (idempotent)**

Add a `database/seed/00_default_privileges.sql` (applied by the seed step) so new EF-created objects are reachable by the app role:
```sql
ALTER DEFAULT PRIVILEGES FOR ROLE spacelinxadmin IN SCHEMA mes, sc, common, application, pm
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :app_role;
```

- [ ] **Step 3: Validate YAML**

Run: `python -c "import yaml; yaml.safe_load(open('azure-pipelines.db-migrate.yml')); print('ok')"`
Expected: `ok`.

- [ ] **Step 4: Commit**

```bash
git add azure-pipelines.db-migrate.yml database/seed/00_default_privileges.sql
git commit -m "ci(db): artifact-download + psql 3-phase apply with SET ROLE/lock_timeout"
```

### Task 14: Add the drift gate to all branch/tag paths

**Files:**
- Modify: `azure-pipelines.yml` (the `ValidateDb` stage, ~lines 123-173)

- [ ] **Step 1: Replace the Flyway ephemeral check with an EF drift + build-from-scratch check**

```yaml
  - stage: ValidateDb
    displayName: 'Validate DB migrations'
    dependsOn: []
    jobs:
      - job: Drift
        displayName: 'EF drift + build-from-scratch'
        pool: { vmImage: 'ubuntu-latest' }
        services:
          postgres: { image: 'postgres:16', ports: ['5432:5432'], env: { POSTGRES_PASSWORD: postgres } }
        steps:
          - script: |
              cd src/SpaceLinx.Api && dotnet tool restore
              dotnet ef migrations has-pending-model-changes --project SpaceLinx.Model --startup-project SpaceLinx.Api
            displayName: 'Fail on model/migration drift'
          - script: |
              cd src/SpaceLinx.Api
              dotnet ef database update --project SpaceLinx.Model --startup-project SpaceLinx.Api \
                --connection "Host=localhost;Database=spacelinx_ci;Username=postgres;Password=postgres"
            displayName: 'Build schema from scratch (baseline validity)'
```

- [ ] **Step 2: Make it run on UAT/Prod paths, not just PRs**

Remove the `condition: eq(variables['Build.Reason'],'PullRequest')` restriction, and add `ValidateDb` to the `dependsOn:` of `DeployUAT` and `DeployProd` (so the gate runs for `release/v*` and `v*`).

- [ ] **Step 3: Validate YAML + commit**

```bash
python -c "import yaml; yaml.safe_load(open('azure-pipelines.yml')); print('ok')"
git add azure-pipelines.yml
git commit -m "ci(db): EF drift gate on PR + release/* + tag paths"
```

### Task 15: Tighten deploy gating + rename the cutover flag

**Files:**
- Modify: `azure-pipelines.yml` (deploy stages), `azure-pipelines.db-migrate.yml`

- [ ] **Step 1: Require `Succeeded` (not `Skipped`) for UAT/Prod API deploy**

Change the API-deploy condition on the **UAT and Prod** stages from `in(dependencies.DeployDb*.result,'Succeeded','Skipped')` to `eq(dependencies.DeployDb*.result,'Succeeded')`. Leave Dev permissive.

- [ ] **Step 2: Rename the flag**

Rename `runDbMigrations` → `applyEfMigrations` in `azure-pipelines.yml` (variable, ~line 35) and the `condition` in `azure-pipelines.db-migrate.yml` (~line 29). Keep default `'false'`.

- [ ] **Step 3: Validate YAML + commit**

```bash
python -c "import yaml; yaml.safe_load(open('azure-pipelines.yml')); yaml.safe_load(open('azure-pipelines.db-migrate.yml')); print('ok')"
git add azure-pipelines.yml azure-pipelines.db-migrate.yml
git commit -m "ci(db): require Succeeded on UAT/Prod; rename flag to applyEfMigrations"
```

### Task 16: Seed tier-1 (static catalog) via EF HasData

**Files:**
- Modify: `src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContext.cs` (`OnModelCreatingPartial`)
- Create: `src/SpaceLinx.Api/SpaceLinx.Model/Seed/PermissionSeed.cs`

- [ ] **Step 1: Define the canonical permission set**

In `PermissionSeed.cs`, expose the canonical 164 UAT permissions **plus the 86 missing** (from `PERMISSION_CATALOG.md` / `DB_FINDINGS.md`) and the `VENDORS.DOC.DELETE`→`VENDORS.DOCUMENTS.DELETE` fix, as a `Permission[]` with fixed `Guid` Ids (stable across environments).

- [ ] **Step 2: Wire HasData**

In `OnModelCreatingPartial`:
```csharp
modelBuilder.Entity<Permission>().HasData(PermissionSeed.All);
```

- [ ] **Step 3: Generate the seed migration**

Run:
```bash
cd src/SpaceLinx.Api
dotnet ef migrations add SeedPermissionCatalog --project SpaceLinx.Model --startup-project SpaceLinx.Api --output-dir Migrations
```
Expected: a migration with `InsertData` for the permissions. Review it.

- [ ] **Step 4: Verify drift green + commit**

```bash
dotnet ef migrations has-pending-model-changes --project SpaceLinx.Model --startup-project SpaceLinx.Api
git add src/SpaceLinx.Api/SpaceLinx.Model/Seed/ src/SpaceLinx.Api/SpaceLinx.Model/Migrations/ src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContext.cs
git commit -m "feat(seed): permission catalog (164 + 86 missing) via EF HasData"
```

### Task 17: Prove the pipeline end-to-end on Dev

**Files:** none (operational verification)

- [ ] **Step 1: Pre-req checklist**

Confirm Dev is **stamped** (Task 10) before flipping the flag. Set `applyEfMigrations='true'` for the **Dev** environment only (variable/group), per `database/stamp/RUNBOOK.md`.

- [ ] **Step 2: Push the branch and open a PR to `main`**

Expected: `ValidateDb` (drift + build-from-scratch) passes; `BuildAPI` publishes the `dbscript` artifact.

- [ ] **Step 3: Merge to `main` → DeployDev runs**

Expected order: `DeployDbDev` downloads `dbscript`, applies migrate.sql (the SeedPermissionCatalog migration is the first *real* change to flow) + procedures + views + seed, **then** `DeployApiDev` deploys. Confirm in logs the DB job ran before the API job and `__EFMigrationsHistory` shows the new migration on Dev.

- [ ] **Step 4: Verify Dev application health**

Hit the Dev API health endpoint and confirm the seeded permissions are present:
```bash
psql "$DEV_CONN" -c "SELECT count(*) FROM application.permission;"
```
Expected: count reflects 164 + 86 additions.

- [ ] **Step 5: Tag the milestone**

```bash
git tag -a code-first-dev-proven -m "Code-first EF migrations proven end-to-end on Dev"
```

---

## Deferred to a follow-up plan (write after Phase −1 audit + Phase 3 proof)

These depend on the reconciliation report and on the Dev pipeline being proven; planning them in detail now would be guesswork:

- **Phase 4 — Consolidate:** fold `EFMigrations/` + `versioned/` + ad-hoc `migration_*.sql` into tracked EF migrations applied through the proven pipeline; retire SSDT/Flyway/ad-hoc; decide the `flyway_schema_history` ghost-table fate; stamp + cut over real **UAT then Prod** via `RUNBOOK.md`.
- **Phase 5 — First real schema migration:** the `sc.purchase_order` department/status index (`CREATE INDEX CONCURRENTLY` + `suppressTransaction`) from `DB_FINDINGS.md`, exercising the §6 PG-safety patterns through to Prod.
- **Phase 6 — Soft-delete global query filter:** isolated, with full regression (spec §7 Phase 6).
- **Demo environment policy:** wire a DB apply for `spacelinx-mes-demo` or document tolerated drift + rebuild.

---

## Self-Review (completed)

- **Spec coverage:** Phases −1→3 + seed (§6.5) + ownership/SET ROLE (§7.3) + 3-phase views (§5) + DDL-safety note (§6) + artifact promotion (§7.1) + drift-all-paths (§7.2) + Succeeded-gate/flag-rename (§7.3) all map to Tasks 1–17. Phases 4–6, Demo, and the audit-partition/PITR-disaster items are explicitly deferred with reasons.
- **Placeholder scan:** no TBD/TODO; raw SQL bodies that must be copied verbatim from existing SSDT files are called out as such (their canonical source exists in-repo), not invented.
- **Type/name consistency:** `applyEfMigrations` flag, `dbscript` artifact, `00_manifest.md` ordering, and `SET ROLE spacelinxadmin` are used consistently across Tasks 12–15. `has-pending-model-changes` is the single drift command in Tasks 7, 10, 11, 14, 16.
