# SpaceLinx Modernization — Execution Task List

> Strategy: **modernize in place** (strangler-fig within this repo) — see `MODERNIZATION_AND_REWRITE_PLAN.md` §3.
> Companion docs: `MODERNIZATION_AND_REWRITE_PLAN.md` (the 11-objective plan), `PERMISSION_CATALOG.md`, `DB_FINDINGS.md`.
>
> **How to use:** work top-to-bottom. Each task has an ID, acceptance criteria, and dependencies. Check the box when its acceptance is met and verified. Don't start a task whose `Depends on` isn't done. Phases ship independently — the app stays deployable throughout.
>
> Legend: `[ ]` todo · `[~]` in progress · `[x]` done · 🔴 security · ⚡ perf · 🏗️ foundation · 🎨 frontend · 🧩 module · 🏢 enterprise

---

## Phase 0 — Safety net & housekeeping (do first; unblocks everything)

- [ ] **T0.1** 🔴 Rotate the dev + UAT DB password (`spacelinxuser`) — it was shared in plaintext. Move secrets to **Azure Key Vault + Managed Identity**; remove connection strings from `appsettings`/chat history.
- [ ] **T0.2** 🏗️ Stand up an **automated-test harness** with ~0 → first tests: xUnit + **Testcontainers (Postgres)** for the API; **Vitest + Testing Library** for the frontend. Acceptance: one green integration test hitting a real endpoint + one component test run in CI.
- [ ] **T0.3** 🏗️ Add **characterization tests** for the highest-risk flows before refactoring them: BOM expansion, ECO/approval workflow, PO create+approve, stock movement. Acceptance: tests capture current behavior (golden master) so refactors can't silently change it.
- [ ] **T0.4** 🏗️ CI gates: build + lint (zero-warning ESLint already configured) + run the new test suites on PR. Acceptance: red CI blocks merge.

---

## Phase 1 — P0: Security exposure + quick perf wins (highest value, days not months)

### 1A. Server-side authorization (the live exposure)
- [x] **T1.1** 🔴 **Unify the permission catalog → single source of truth.** ✅ Done 2026-05-30. Built `tools/permission-catalog/permissions.catalog.json` (249 perms, 55 categories) + `generate.mjs` (zero-dep Node) emitting C# (`Permissions.Generated.cs`), TS (`permissions.generated.ts`, with `PermissionKey` union), and an idempotent SQL seed. `PagePermissions.js` now re-exports the generated TS (all 99 import sites unchanged; drift structurally impossible). Generated TS verified identical (249/249) to the prior hand-maintained file. **Follow-up:** add the CI guard (regenerate + fail on non-empty `git diff`).
- [~] **T1.2** 🔴 **Apply the permission seed** (review-then-run): `database/migrations/seed/permissions.seed.sql` (generated) inserts the missing permissions (`ON CONFLICT DO NOTHING`, existing untouched) and migrates the `VENDORS.DOC.DELETE` typo → `VENDORS.DOCUMENTS.DELETE` (incl. role grants). **✅ dev (2026-06-01): +88 perms, typo retired, 3 grants migrated; verified. ✅ UAT (2026-06-01): +86 perms → 249 active = full catalog, verified. ⏳ prod: pending.** Seed was hardened against the `UNIQUE(role_id, permission, deleted_at)` collision — confirmed real (all 3 typo-holding roles also held the canonical grant in both dev & UAT; bare rename would have rolled back). No capability lost in either env. **Follow-up:** dev has ~56 active perms NOT in the catalog — review for catalog gaps/legacy. Then normalize `category_name` semantics (it currently holds the description) in the code-first migration (T2.2). Acceptance: every UI-checked permission is grantable. **Must precede T1.4** (else those endpoints deny-all). *(Ref: `DB_FINDINGS.md`.)*
- [x] **T1.3** 🔴 Build the **authorization core**. ✅ Done 2026-05-30 (builds clean). Added `Security/Authorization/`: `RequirePermissionAttribute`, `PermissionRequirement`, `PermissionPolicyProvider` (per-permission policy on demand), `PermissionAuthorizationHandler`, `IPermissionResolver`/`PermissionResolver` (Redis-cached per (email, active-role) with O(1) version-counter invalidation + `Super Admin` god-mode bypass), `SpaceLinxAuthorizationOptions`. Registered via `AddSpaceLinxAuthorization` in `Program.cs`; config section in `appsettings.json`. **Closes the unverified role-switch hole**: the `RoleId` header is honored only if the user actually holds that role. Ships in **shadow mode** (`EnforcePermissions=false`) — handler logs would-be denials but allows, so adding attributes can't break anything until T1.4 flips enforcement. **Follow-up:** call `IPermissionResolver.InvalidateAsync` from RolePermission/UserRole writes.
- [ ] **T1.4** 🔴 **Enforce per endpoint behind a feature flag.** Apply `[RequirePermission]` to controllers/actions mapping to the catalog; add a **deny-by-default fallback policy**; verify the `roleId` role-switch header server-side (don't trust it). Roll out flag → log-only (shadow) → enforce. Depends on: T1.2, T1.3. Acceptance: a token without a permission gets 403 on the matching endpoint; shadow logs show no false denials first.
- [ ] **T1.5** 🔴 **Close the 16 unprotected controllers** — every controller requires auth unless explicitly `[AllowAnonymous]`. Depends on: T1.3.
- [ ] **T1.6** 🔴 **Validate JWT issuer** (set `ValidateIssuer = true` / adopt `Microsoft.Identity.Web`) and audience/signature/lifetime. Acceptance: tokens from other issuers are rejected.

### 1C. Seed & reference data — generalize the catalog pattern
> The permission catalog (T1.1) is one kind of managed seed data. Apply the **same source-of-truth + code-gen + idempotent-seed** approach to the other seed/reference data so environments stay consistent and nothing is hand-maintained per-DB.
- [ ] **T1.11** 🏗️ **Option Sets** — make `OptionSet` values a versioned seed (JSON/SQL) with an idempotent upsert; reconcile dev vs UAT vs prod. Acceptance: option sets reproducible from source, not ad-hoc DB edits.
- [ ] **T1.12** 🔴 **Roles + RolePermission** — seed the canonical role set (UAT has 23) and their permission grants as reviewable seed data; align with `JsonFiles/rolePermissions.json`. Note the 7 zero-permission roles and the **Super Admin god-mode** convention (preserve as policy, T1.3). Acceptance: a fresh DB gets the standard roles + grants from source.
- [ ] **T1.13** 🏗️ **Feature Bits** — seed the `FeatureBit` defaults per environment; document each flag's meaning/owner. Acceptance: feature flags reproducible from source.
- [ ] **T1.14** 🏗️ **Core reference data** — idempotent seed for the static lookups (Country, Currency, UnitOfMeasure, PartType/PartLevel/PartTypeCategory, NewsType, PaymentTerm, etc.). Acceptance: reference tables reproducible; one `seed/` folder is the source of truth.
- [ ] **T1.15** 🏗️ **Unified seed runner** — a single ordered, idempotent `database/migrations/seed/` set (permissions → reference → roles/grants → feature bits → option sets) runnable per environment in CI/CD. Acceptance: `seed all` brings any empty/old DB to the canonical baseline.

### 1B. Quick, measurable performance fixes
- [ ] **T1.7** ⚡ **Add pagination + server-side filter/sort** to the generic list endpoints (`GenericRestController.Get/GetActive`) — currently return whole tables. Keyset/offset + project to Read DTO via `.Select()`. Acceptance: list endpoints page; payloads bounded.
- [ ] **T1.8** ⚡ **Fix `sc.purchase_order` hotspot (24,276 seq scans):** push department filtering into SQL + index the dept/status columns; combine with T1.7. Acceptance: seq_scan/idx_scan ratio inverts in UAT telemetry.
- [ ] **T1.9** ⚡ **Index `common.document` (0 index scans, 3,843 rows)** on its owning-entity FK; audit the other 0-idx_scan tables (`eco_log`, `company_address`, `company_part`, `inventory_transaction`) for missing FK indexes. Acceptance: those lookups use index scans.
- [ ] **T1.10** ⚡ Fix `GenericRestController.GetAsync(id)` `SingleAsync` → `SingleOrDefaultAsync` (returns 404 instead of throwing); return `ProblemDetails`. Quick correctness win.

---

## Phase 2 — P1: Foundations (enterprise host, code-first EF, observability)

- [ ] **T2.1** 🏗️ Replace `Program.cs` with the **enterprise host** (`MODERNIZATION_AND_REWRITE_PLAN.md` §10): ProblemDetails, health checks (`/health/live`,`/health/ready`), rate limiting, API versioning, output cache, response compression, security headers, OpenTelemetry, deny-by-default fallback. Depends on: T1.3.
- [ ] **T2.2** 🏗️ **EF → code-first (against existing DB).** Add `BaseEntity` (UUIDv7 PK, `DateTimeOffset`, `xmin` rowversion), extract `OnModelCreating` (2,374 calls) into `IEntityTypeConfiguration<T>` files, generate a **baseline migration** matching current schema, go code-first forward. Depends on: T0.3.
- [ ] **T2.3** 🏗️ **Soft-delete + audit via interceptors.** Global query filter for soft delete (fix `DeletedBy` vs `DeletedAt` inconsistency); `SaveChangesInterceptor` that stamps audit fields and writes a **platform-wide change log** (generalize the existing `hr.audit_log` shape: entity/entityId/action/changedFields jsonb/by/at). Depends on: T2.2.
- [ ] **T2.4** 🏗️ **Optimistic concurrency** via the `xmin` rowversion; handle `DbUpdateConcurrencyException` → 409. Depends on: T2.2.
- [ ] **T2.5** 🏗️ Replace string-projection lookup (`System.Linq.Dynamic.Core` in `GetForLookupAsync`) with compiled selectors. ⚡ perf + safety.
- [ ] **T2.6** 🏗️ Server-side **validation** (FluentValidation) wired into the pipeline; consistent error model (ProblemDetails everywhere; retire `throw new ApplicationException`).
- [ ] **T2.7** 🏗️ Enable **Swagger/OpenAPI in all environments** (behind auth) and publish a versioned doc + generated typed client. Depends on: T2.1.

---

## Phase 3 — P2: Frontend modernization (incremental, continuous ship)

- [ ] **T3.1** 🎨 Turn on **TypeScript** (`allowJs`, strict incrementally); add `tsconfig`, ts-eslint, Prettier. Acceptance: build compiles mixed JS/TS.
- [ ] **T3.2** 🎨 Generate the **typed API client** from OpenAPI (T2.7) and introduce **RTK Query** (or TanStack Query) to replace hand-rolled `services/*.js` + `react-axios`. Migrate read-heavy screens first.
- [ ] **T3.3** 🎨 **Consolidate to one UI kit** (recommend MUI v6/v7 + MUI X; retire Ant Design) component-by-component; build a tokenized design system in `shared/ui`.
- [ ] **T3.4** 🎨 **Drop redundant libraries:** standardize DnD on `@dnd-kit` (remove deprecated `react-beautiful-dnd`), one date lib (MUI X pickers), 1–2 chart libs, replace CVE-prone `xlsx` with `exceljs`/server export.
- [ ] **T3.5** 🎨 Convert files `.jsx`→`.tsx` module-by-module, typing props/state and the new API types. Track % migrated.
- [ ] **T3.6** 🎨 **A11y pass** (WCAG 2.2 AA) + route-level code splitting + virtualized grids + skeleton/empty/error states. Add **i18n** (react-i18next).

---

## Phase 4 — P3: Module strangle + standard feature gaps (per `PLAN` §6)

> Order by coupling/usage. **Skip heavy PM investment** — `pm` has 14 rows (unused). Each module: CQRS handlers → tests → feature-gap fills.

- [ ] **T4.1** 🧩 **Inventory** (`sc`): lot/serial/expiry, cycle counting, ABC, reservations/ATP, reorder points/safety stock, valuation (FIFO/avg/std), multi-warehouse transfers, barcode, UoM conversions.
- [ ] **T4.2** 🧩 **Procurement** (`sc`): 3-way match (PO/GRN/Invoice) + AP, blanket/contract POs, partial receipts & tolerances, supplier qualification/scorecards (SRM), budget/commitment checks.
- [ ] **T4.3** 🧩 **PLM** (`mes`): revision & effectivity control, ECR→ECN→ECO chain, where-used / BOM compare (redline), lifecycle states, alternates/substitutes, compliance attrs.
- [ ] **T4.4** 🧩 **MES** (`mes`): as-built genealogy & traceability, end-to-end serialization, per-step data collection + e-signoff, NCR at point of use, OEE/downtime/scrap analytics, finite scheduling/dispatch.
- [ ] **T4.5** 🧩 **PM** (`pm`): minimal — only if usage grows (critical path/EVM, baselines, resource leveling). Deprioritized.

---

## Phase 5 — P4: New modules (per `PLAN` §4; add as in-repo modules)

- [ ] **T5.1** 🧩 **Quality Management (QMS):** NCR/CAPA, inspection plans, FAI (AS9102), calibration, SPC. *(Note: `QUALITYCHECK(S)` permissions already exist — consolidate the duplicate category.)*
- [ ] **T5.2** 🧩 **Maintenance (CMMS):** machine maintenance schedules, downtime, OEE (extends `Machine`).
- [ ] **T5.3** 🧩 **Document & Configuration Management:** controlled revisions, e-signatures (21 CFR Part 11-style), effectivity.
- [ ] **T5.4** 🧩 **Supplier/Vendor Management (SRM):** qualification, AVL/AML, CoC capture (overlaps T4.2).
- [ ] **T5.5** 🧩 **Planning / MRP / capacity**, **Reporting/BI builder**, **unified Notifications (email + in-app + webhooks)**.

---

## Phase 6 — P5: Enterprise hardening & scale

- [ ] **T6.1** 🏢 Promote audit (T2.3) to **full forensic change-log** across all modules + an in-app Audit viewer (`AUDIT.VIEW` perm exists).
- [ ] **T6.2** 🏢 **E-signatures** for ECO, work-order steps, quality dispositions.
- [ ] **T6.3** 🏢 **Multi-tenancy enforcement** server-side (tenant query filter; today `SPACELINX-TENANT-ID` is trusted/unused). Implement `RoleFilter` row-level security generically **only when needed** (UAT usage = 0).
- [ ] **T6.4** 🏢 **Durable background jobs** (Hangfire/Quartz) replacing the custom queue; dashboard + retries.
- [ ] **T6.5** 🏢 **Idempotency keys** on POST (orders/approvals/stock movements); **domain events/outbox** for side effects (email, cache, notifications).
- [ ] **T6.6** 🏢 Data retention/archival of closed records; PII handling; localization (currency/UoM/timezone).
- [ ] **T6.7** 🧹 Remove staging tables from prod schema (`sc.temp_inventory_import`, `sc.temp_tracking`).

---

## Decision log
- **2026-05-30:** Modernize **in place** (not greenfield). Rationale: stack already current, live 422-user system, active daily dev, all defects fixable incrementally. (`PLAN` §3.)
- **2026-05-30:** `hr`/`payroll`/`expense` schemas = **separate product, out of scope.**
- **2026-05-30:** UAT `application.permission` (164) is the **canonical** permission catalog; seed 86 frontend-only perms before enabling server-side enforcement; preserve Super Admin bypass.
- **2026-05-30:** **Seed-data delivery = migration/pipeline step, NOT app startup.** Reference/control data (permissions, roles, feature bits, option sets, lookups) is applied as idempotent scripts in the **release pipeline** (after schema migration, before the app serves traffic), per environment. Rationale: multi-instance App Service makes startup-seeding race-prone, couples data to app lifecycle, and would require the app runtime to hold write/DDL rights. App startup seeding is acceptable only for single-instance/dev or behind a distributed lock / one-shot init job. Demo/sample data → dev/demo only, never prod.

## Next action
➡️ **Start T1.1** (unify permission catalog) — it unblocks the entire P0 authorization track. T0.1 (rotate password) can happen in parallel.
