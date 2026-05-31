# SpaceLinx — Modernization, Rewrite & Gap-Analysis Plan

> Status: Draft v1 — grounded in a full pass of the current codebase (API, Frontend, Database) on 2026-05-30.
> Scope: addresses the 11 objectives: (1) tech modernization, (2) EF Core code-first, (3) rewrite in a new repo, (4) new/extended modules, (5) UI/UX, (6) missing standard module features, (7) general improvements, (8) enterprise features (auditing etc.), (9) performance, (10) new `Program.cs`, (11) missing auth/authZ.

---

## 0. Where the code actually is today (baseline)

| Area | Current state (verified) | Implication |
|------|--------------------------|-------------|
| Backend framework | **.NET 10**, EF Core **10.0.5**, Npgsql **10.0.1** | Already latest — *not* a version problem |
| Backend shape | 110 controllers (most inherit `GenericRestController<T,T1,T2,T3,T4>`), 36 services, 106 entity folders | Heavy generic-CRUD pattern |
| ORM approach | **Database-first / scaffolded** — `SpaceLinxContext.cs` is **7,523 lines**, 2,374 fluent-API calls in `OnModelCreating`; migrations are **hand-written SQL** in `database/migrations/EFMigrations/` | Objective #2: move to code-first |
| DTO pattern | 4 DTOs per entity (`Write/Read/Update/Ref`) + AutoMapper 14 | Verbose but consistent |
| Frontend | **React 18.3**, Vite 5, MUI v5, Ant Design 5, Redux Toolkit 1.9 | Latest React/Vite; mixed UI kits |
| Frontend language | **100% JavaScript** — 283 `.jsx` + 104 `.js`, **0 TypeScript files** | Objective #1: TS migration |
| Frontend state | Redux Toolkit **1.9** + 7 React Contexts | RTK is 2.x now; context sprawl |
| Auth | Azure AD JWT Bearer, `ValidateIssuer = false` | Token issuer not validated |
| AuthZ | `[SpaceLinxAuthroize]` = *"user exists in DB"* only; **no role/permission enforcement server-side**; 16/110 controllers have **no** auth attribute | Critical gap (#11) |
| Observability | Serilog + App Insights sink + `GlobalExceptionMiddleware` | Good start; no metrics/tracing |
| Caching | Redis (`IDistributedCache`) + in-memory fallback; BOM/Part cache refresh hosted services | Solid |
| Tests | **0 API test projects**, 2 frontend test files | Effectively untested |
| Enterprise features present | Serilog, App Insights, Redis, background queue, soft delete, audit columns | — |
| Enterprise features **absent** | Health checks, rate limiting, API versioning, FluentValidation, ProblemDetails, OpenTelemetry, OutputCache, pagination, optimistic concurrency, idempotency | Objectives #8/#9/#10 |

**Re-frame of the request:** the headline "upgrade to latest .NET/React" is largely already satisfied. The high-value work is: **TypeScript + code-first EF + a real authorization layer + enterprise/operational hardening + pagination/performance + filling module feature gaps.**

---

## 1. Technology Modernization

### 1.1 Backend (.NET) — already current, tighten the edges
The framework is .NET 10 / EF Core 10 — keep it. Modernize *patterns*, not versions:

- **Replace AutoMapper-by-singleton** (`new MapperConfiguration(...)` in `Program.cs`) with DI registration, or move to **Mapperly** (source-generated, AOT-friendly, no reflection). AutoMapper 14 is also moving to a commercial license — a reason to switch.
- **Replace `System.Linq.Dynamic.Core`** string-based projections in `GenericRestController.GetForLookupAsync()` (`Select($"new ({columnSelector})")`) with compiled expression selectors — the dynamic string path is slow and injection-adjacent.
- **Adopt `ProblemDetails`** (RFC 9457) for all error responses instead of throwing `ApplicationException("Not Found")`.
- **Validation**: add **FluentValidation** (or DataAnnotations + a validation filter) — currently validation lives only on Write/Update DTO annotations and isn't consistently enforced.
- Consider **Minimal APIs + endpoint filters** or keep MVC controllers; either is fine, but the generic-CRUD base class should be replaced by a thin generic endpoint/handler (see §2/§10).

### 1.2 Frontend — the real modernization
| Item | From | To |
|------|------|----|
| Language | JavaScript (387 files) | **TypeScript** (strict) — incremental via `allowJs`, file-by-file |
| Build | Vite 5 | Vite 6/7 |
| UI kit | MUI v5 **+** Ant Design 5 (two systems) | **Consolidate on one** (recommend MUI v6/v7 + MUI X) to cut bundle + cognitive load |
| Data grid | `@mui/x-data-grid` 8 (already new) | keep; standardize all tables on it |
| State | Redux Toolkit 1.9 + 7 contexts | **RTK 2.x + RTK Query** (replaces hand-written axios services & most contexts) |
| Data fetching | `react-axios`, hand-rolled `services/*.js` (94 files) | **RTK Query** or **TanStack Query** (caching, dedupe, retries, optimistic updates) |
| Drag & drop | `react-beautiful-dnd` (**deprecated/unmaintained**) + `@dnd-kit` | Standardize on **@dnd-kit** |
| Date pickers | `react-datepicker` + `react-calendar` + `@mui/x-date-pickers` | One: **MUI X date pickers** |
| Charts | `@mui/x-charts` + `recharts` + `react-google-charts` + `d3` | Consolidate to 1–2 |
| Excel | `xlsx` (**known CVEs / prototype-pollution**) | `exceljs` or server-side export |
| Forms | ad hoc | **React Hook Form + Zod** |
| Auth | MSAL React 2.x | keep, upgrade to 3.x |
| Tests | none | **Vitest + Testing Library + Playwright** |

> Library-rationalization alone removes ~6–8 redundant dependencies (two DnD libs, three date libs, four chart libs, two UI kits), shrinking bundle size and maintenance surface.

---

## 2. Entity Framework — Code-First Migration

**Today:** database-first. `SpaceLinxContext` is scaffolded (7.5k lines, partial class), entities are POCOs under `SpaceLinx.Model/{Entity}/`, and schema changes are applied through **hand-written SQL** (`database/migrations/EFMigrations/*.sql`) — EF migration *tooling is not used* despite the folder name.

**Target:** code-first with EF migrations as the single source of truth.

### Strategy (low-risk, incremental)
1. **Split the god-context** by bounded context / schema (mes, sc, pm, etc.) or keep one context but **move configuration out of `OnModelCreating`** into `IEntityTypeConfiguration<T>` classes (one per entity). This converts 2,374 inline calls into ~106 reviewable config files.
2. **Introduce a `BaseEntity`** with proper conventions:
   ```csharp
   public abstract class BaseEntity
   {
       public Guid Id { get; set; } = Guid.CreateVersion7();   // sortable UUIDv7 PK
       public bool IsActive { get; set; } = true;
       public DateTimeOffset CreatedAt { get; set; }
       public string CreatedBy { get; set; } = default!;
       public DateTimeOffset? UpdatedAt { get; set; }
       public string? UpdatedBy { get; set; }
       public DateTimeOffset? DeletedAt { get; set; }
       public string? DeletedBy { get; set; }
       [Timestamp] public uint Version { get; set; }            // xmin → optimistic concurrency
   }
   ```
   (Current `BaseModel` uses nullable `Guid?` PK and `DateTime` — switch to non-null UUIDv7 + `DateTimeOffset`.)
3. **Global query filter** for soft delete: `modelBuilder.Entity<T>().HasQueryFilter(e => e.DeletedAt == null)` — removes the repeated `.Where(x => x.DeletedAt == null)` scattered through `GenericRestController` and fixes the **`DeletedBy` vs `DeletedAt` inconsistency** (the lookup query filters on `DeletedBy`, others on `DeletedAt`).
4. **Audit + soft-delete via `SaveChangesInterceptor`** (see §8) instead of setting `CreatedBy`/`UpdatedBy` by hand in every method.
5. **Baseline migration**: scaffold once from the existing prod DB, generate an initial migration that matches current schema (`--no-emit`/baseline), then all future changes are code-first `dotnet ef migrations add`.
6. **Keep raw SQL** only for data backfills and Postgres-specific objects (views `Vw*`, functions, triggers) via `migrationBuilder.Sql(...)` or `HasDbFunction`.

### Concurrency & correctness fixes to fold in
- `GenericRestController.GetAsync(id)` uses `SingleAsync` → **throws** when the row is missing instead of returning 404. Use `SingleOrDefaultAsync`.
- No optimistic concurrency today → add the `xmin` rowversion above and handle `DbUpdateConcurrencyException`.
- `CreateAsync` returns `record.Id.Value` (nullable) — non-null PK removes the `.Value`.

---

## 3. Repo Strategy — Modernize IN PLACE (decision)

**Decision: modernize in place using a strangler-fig refactor inside the existing repo. Do NOT create a greenfield repo or rewrite from scratch.**

> This supersedes an earlier draft of this section that leaned greenfield. The recommendation changed once three facts were confirmed: (1) the stack is **already on the latest majors** (.NET 10 / EF Core 10 / React 18.3 / Vite 5), so the usual #1 reason to rewrite — escaping a dead stack — does not apply; (2) this is a **live system with 422 users and production-close UAT data** under **active daily development**; (3) every real defect is fixable incrementally. A from-scratch rewrite would freeze feature delivery, force dual-maintenance, discard embedded domain logic (BOM expansion, ECO/approval workflows), and leave the live server-side-authZ gap open until cutover.

### Why in-place (expert consensus)
- **Joel Spolsky — "Things You Should Never Do":** a from-scratch rewrite is "the single worst strategic mistake" — it throws away accumulated bug fixes and domain knowledge.
- **Martin Fowler — Strangler Fig:** grow the new around the old, retire the old incrementally; value delivered continuously, reversible at each step.
- **Michael Feathers — *Working Effectively with Legacy Code*:** characterize with tests, then refactor behind them. The test net is identical work either way — building it in place protects a *running* system.

### Decision criteria
| Factor | In-place (chosen) | Greenfield rewrite (rejected) |
|--------|-------------------|-------------------------------|
| Stack already current | ✅ leverages it | ❌ rebuilds on same versions |
| Live system, 422 users | ✅ stays shippable | ❌ risky big-bang cutover |
| Active daily development | ✅ no freeze | ❌ freeze / chase moving target |
| Domain logic preserved | ✅ kept | ❌ must re-derive |
| Time-to-first-value (authZ fix) | ✅ days | ❌ months |
| Git history / blame | ✅ kept | ❌ lost |

### What "in place" looks like — strangler *within* the repo
Every modernization goal has a proven incremental path; none needs a new repo:
- **JS → TypeScript:** enable `allowJs`, convert file-by-file (rename `.jsx`→`.tsx`, tighten types), ship continuously.
- **EF db-first → code-first:** scaffold a baseline migration from the current DB, extract the 2,374-line `OnModelCreating` into `IEntityTypeConfiguration<T>` files, go code-first forward.
- **UI kits (MUI + Ant Design) → one:** migrate component-by-component behind existing routes.
- **Generic CRUD → CQRS/clean handlers:** strangle one controller at a time; the new `Program.cs`/middleware (§10) drops into the existing host.
- **New modules:** add as folders/projects now; promote to an independently-deployed service later *only if* one genuinely needs separate scaling/ownership.

### Optional structural tidy (in place, history-preserving)
The clean layout below can be reached **inside this repo** with `git mv` (no rewrite, no lost history) if/when desired — it is not a prerequisite:
```
src/SpaceLinx.Api/        →  Domain / Application / Infrastructure / Api / Contracts (+ tests/)
src/spacelinx-mes/        →  app / shared(ui,hooks,api) / features/{plm,mes,procurement,inventory,pm}
```

### Guardrails (apply in the existing repo)
- **Test safety net first** (characterization tests) before refactoring any module.
- **ADRs** under `docs/adr/` for cross-cutting decisions.
- **Architecture tests** (NetArchTest) to enforce layer boundaries as they're introduced.
- **Feature-flag** risky swaps (e.g. server-side authZ enforcement) for safe rollout/rollback.
- Keep the existing **branch + squash-merge** policy.

### When to revisit (none currently apply)
Move a piece to its own repo only if: the architecture model changes fundamentally (microservices / different runtime), the git history becomes a liability, or a **new** bounded context needs independent deployment from day one — in which case only *that* service leaves; SpaceLinx core stays.

➡️ **The ordered, do-not-forget execution plan lives in [`TASKS.md`](./TASKS.md).**

---

## 4. New / Extended Modules

Current modules (from entities + frontend features): **PLM** (Parts, BOM/EBOM/MBOM, ECO), **MES** (Guides, Work Orders/Steps/Tasks, Material Kits, Machines/Tools), **Procurement** (Requisitions, POs, GRN, Tenders/RFQ, Vendor Returns, Payment Terms), **Inventory** (Inventory Parts/Stock, Stock Movements, Bin Management, Scrap), **Program Management** (Programs, Projects, Subsystems, Milestones, Tasks, Time Entries, Kanban/Board), plus **Contact Hub**, **Approvals**, **Dashboards**, **Roles/Permissions**.

### Net-new modules to add
| Module | Why |
|--------|-----|
| **Quality Management (QMS)** | NCR/CAPA, inspection plans, FAI (AS9102), SPC, calibration records — essential for MES/aerospace. Entirely absent. |
| **Maintenance (CMMS / TPM)** | Machine maintenance schedules, downtime tracking, OEE — `Machine` exists but no maintenance lifecycle. |
| **Supplier/Vendor Management (SRM)** | Supplier scorecards, qualification, AVL/AML, certificates of conformance. Partial (Tenders) only. |
| **Document & Configuration Management** | Controlled docs, revisions, e-signatures (21 CFR Part 11 / ITAR-style controls), effectivity. `Document` entity is bare. |
| **Planning / MRP / Capacity** | Demand → supply planning, MRP runs, finite scheduling/APS. None today. |
| **Costing & Finance hooks** | Standard vs actual cost rollups, landed cost, GL/ERP integration. |
| **Sales / Customer Orders** | `Customer` exists but no sales-order → demand linkage. |
| **Reporting & Analytics** | A real BI/report builder + scheduled exports (today: ad-hoc dashboards). |
| **Notifications/Inbox** | Unify email + in-app notifications + webhooks (today: email + ad-hoc). |

### Extensions to existing modules
- **PLM**: full revision/effectivity control, where-used, BOM compare/redline, ECN→ECO→ECR chain, part classification.
- **MES**: electronic work instructions with data collection, genealogy/traceability, serialization end-to-end, e-signoff per step.
- **Procurement**: 3-way match (PO/GRN/Invoice), blanket/contract POs, supplier portal, RFQ scoring automation.
- **Inventory**: lot/serial/expiry tracking, cycle counting, ABC analysis, multi-warehouse transfers, barcode/RFID, reservations/allocations.
- **PM**: resource leveling, baselines, EVM (earned value), critical path on the existing Gantt.

---

## 5. UI/UX Improvements

- **One design system.** Today MUI v5 *and* Ant Design 5 coexist — pick one (MUI v6/v7 + MUI X recommended), build a tokenized theme, and a shared component library (`frontend/src/shared/ui`). Removes visual inconsistency and ~1 full UI framework from the bundle.
- **Design tokens & theming**: centralize color/spacing/typography; current dark/light toggle stored in `localStorage` is fine — formalize with CSS variables + MUI theme tokens.
- **Accessibility (a11y)**: audit to WCAG 2.2 AA — keyboard nav, focus states, ARIA on the data grids and custom DnD boards, color-contrast. (None evident today.)
- **Performance UX**: route-based code splitting (`React.lazy`), skeleton loaders, optimistic updates via RTK Query, virtualized tables/lists for large MES/inventory grids.
- **Consistent data grid**: standardize every list on MUI X DataGrid with server-side pagination/sort/filter (ties to §9).
- **Forms**: React Hook Form + Zod for consistent validation UX and error display.
- **Empty/error/loading states**: standardized components instead of `sweetalert2` ad hoc.
- **Responsive + mobile**: shop-floor MES screens benefit from tablet-first layouts; `@ionic/react` is currently a stray dependency — decide in or out.
- **Navigation/IA**: role-aware nav, breadcrumbs, command palette (⌘K) for power users, saved views/filters.
- **Internationalization**: add i18n (react-i18next) — none today.
- **Notifications**: in-app notification center (ties to §4).

---

## 6. Missing Standard Features by Module

> Baseline: features confirmed present from entities/controllers; "missing" = standard for the domain but absent or only partially modeled.

### Project / Program Management
Present: Programs, Projects, Subsystems, Milestones, Tasks, dependencies, assignees, time entries, Kanban board, Gantt.
**Missing:** baselines & schedule variance, **critical path / EVM**, resource capacity & leveling, budget/cost tracking & burn-down, risk & issue register (Issues exist but not a risk matrix), portfolio roll-ups, timesheet approval workflow, billing/utilization, dependency types (FS/SS/FF/SF) with lag, calendars/holidays.

### PLM
Present: Parts, Part Types/Levels, BOM/EBOM/MBOM, ECO, ECO logs/parts, Guides as work instructions, Documents.
**Missing:** formal **revision & effectivity control**, **ECR→ECN→ECO** full change chain, **where-used / BOM compare (redline)**, part classification taxonomy, approval-gated lifecycle states (concept→released→obsolete), **CAD/PDM integration**, document control with e-signatures & controlled revisions, item master cross-plant, alternate/substitute parts, compliance (RoHS/REACH/ITAR) attributes.

### MES
Present: Guides/Steps/Tasks, Work Orders/Steps/Tasks, Work Packages, Material Kits, Machines/Tools, Assembly Locations, Time Entry.
**Missing:** **as-built genealogy & full traceability**, **serialization end-to-end**, electronic data collection per step (measurements, pass/fail), **e-signature sign-off** per operation, **non-conformance (NCR) at point of use**, **OEE / downtime / scrap analytics**, scheduling/dispatch (finite capacity), operator certification/skill gating, andon/alerting, label/barcode printing, rework routing, SPC/quality gates.

### Procurement
Present: Requisitions + line items, Purchase Orders + line items, GRN + line items, Tenders/RFQ (quotations, vendors), Vendor Returns, Payment Terms, multi-level Approvals, DigiKey integration.
**Missing:** **3-way match (PO ↔ GRN ↔ Invoice)** & invoice/AP, blanket/contract/scheduled POs, **supplier qualification & scorecards (SRM)**, AVL/AML, **budget checking / commitment accounting**, catalog/punch-out, drop-ship, partial receipts & over/under tolerance rules, currency/exchange-rate handling at PO level, supplier portal, certificate-of-conformance capture.

### Inventory
Present: Inventory Parts/Stock, Stock Movements + line items, Bin Management, Scrap requests, Inventory Transactions, Kits/Kit Serials.
**Missing:** **lot/batch & expiry tracking**, **full serial tracking**, **cycle counting & physical inventory**, **ABC classification**, **reservations/allocations & ATP**, multi-warehouse with transfer orders & in-transit, **reorder points / min-max / safety stock / auto-replenishment**, valuation methods (FIFO/LIFO/weighted-avg/standard), barcode/RFID scanning, quarantine/hold status, consignment/VMI, kitting/de-kitting workflows, unit-of-measure conversions (UoM entity exists — wire conversions).

---

## 7. General Improvements (cross-cutting)

- **Pagination everywhere.** `GenericRestController.Get()` returns the **entire table** (`ToListAsync()` with no paging). Add cursor/offset pagination, server-side filter & sort as a first-class contract. *(Highest-impact single change.)*
- **Replace the magic generic CRUD base** with explicit, testable use-case handlers (CQRS) — the 5-type-parameter generic controller is hard to extend, reason about, and secure.
- **Consistent error model**: `ProblemDetails` + a global exception handler that maps domain exceptions → status codes (replace `throw new ApplicationException("Not Found")`).
- **Idempotency keys** on POST (orders, approvals, stock movements) to prevent duplicate submissions.
- **Domain events / outbox** for side effects (emails, cache invalidation, notifications) instead of inline calls — improves reliability and testability.
- **API contract & docs**: keep Swagger but enable it in all environments (currently dev-only) behind auth; publish a versioned OpenAPI + generated TS client.
- **Config & secrets**: move connection strings/secrets to **Azure Key Vault** + Managed Identity (today they're in `appsettings`/env).
- **Testing**: introduce unit + integration (Testcontainers) + e2e (Playwright); gate CI on coverage. Currently ~0 tests.
- **Code quality gates**: `.editorconfig`, analyzers, `dotnet format`, ESLint→TS-ESLint, Prettier, pre-commit hooks, SonarCloud/CodeQL.

---

## 8. Enterprise Features (Auditing & co.)

| Feature | Today | Target |
|---------|-------|--------|
| **Audit trail** | Audit *columns* on `BaseModel` set manually in each method | **`SaveChangesInterceptor`** that stamps Created/Updated/Deleted automatically **+ a full change-log table** (entity, PK, field, old→new, user, timestamp, correlation id) for forensic/compliance audit |
| **Soft delete** | Manual + inconsistent (`DeletedBy` vs `DeletedAt`) | Global query filter + interceptor (one place) |
| **E-signatures** | None | Sign-off records (who/when/why hash) for ECO, work-order steps, quality dispositions (21 CFR Part 11-style) |
| **Multi-tenancy** | Header `SPACELINX-TENANT-ID` exists; no enforcement seen | Tenant query filter + per-tenant data isolation, enforced server-side |
| **Feature flags** | `FeatureBit` entity / context | Keep; consider a managed flag service (LaunchDarkly/OpenFeature) |
| **Background jobs** | Hosted services + custom queue | Consider **Hangfire/Quartz** for durable, observable, retryable jobs + dashboard |
| **Notifications** | Email (Graph + SMTP fallback) | Unified notification service (email + in-app + webhooks) with templates (EmailTemplate exists) |
| **Reporting/exports** | ClosedXML/ExcelDataReader ad hoc | Centralized export service + scheduled reports |
| **Data retention / archival** | None | Retention policies, archival of closed orders, GDPR/PII handling |
| **Localization/i18n** | None | Resource-based localization, currency/UoM/timezone awareness |

### Audit interceptor sketch
```csharp
public sealed class AuditSaveChangesInterceptor(IUserContext user, TimeProvider clock)
    : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData e, InterceptionResult<int> result, CancellationToken ct = default)
    {
        var ctx = e.Context!;
        var now = clock.GetUtcNow();
        foreach (var entry in ctx.ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now; entry.Entity.CreatedBy = user.Email; break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now; entry.Entity.UpdatedBy = user.Email; break;
                case EntityState.Deleted:                 // convert hard delete → soft delete
                    entry.State = EntityState.Modified;
                    entry.Entity.DeletedAt = now; entry.Entity.DeletedBy = user.Email;
                    entry.Entity.IsActive = false; break;
            }
            // emit field-level change records into an AuditLog set here
        }
        return base.SavingChangesAsync(e, result, ct);
    }
}
```

---

## 9. Performance Improvements

1. **Pagination + projection on all list endpoints** — eliminates full-table `ToListAsync()` in `GenericRestController.Get()`/`GetActive()`. Project straight to the Read DTO with `.Select()` so EF fetches only needed columns instead of `Include`-ing whole graphs then mapping.
2. **`AsNoTrackingWithIdentityResolution`** for read graphs; reads already use `AsNoTracking` — good.
3. **Compiled queries** for hot paths (BOM expansion, lookups).
4. **Replace `System.Linq.Dynamic.Core` string projection** in `GetForLookupAsync` with compiled selectors (faster + safer).
5. **Cursor pagination** (keyset) for large MES/inventory grids instead of offset.
6. **Output caching** (`AddOutputCache`) for reference/lookup data (countries, currencies, UoM, part types) with tag-based invalidation.
7. **Redis**: already in place; add cache-aside for read-heavy reference data and tag invalidation via the existing background queue.
8. **DB**: review indexes for soft-delete + tenant + common filters; partial indexes `WHERE deleted_at IS NULL`; connection pooling already via `AddDbContextPool` (good) — verify `PoolSize` and Npgsql multiplexing.
9. **N+1 audit** across services (BOM, ECO, approvals) — use `.Include`/projection deliberately; add EF query logging in non-prod.
10. **Async all the way**, `CancellationToken` plumbed from controllers → services → EF (currently many calls ignore cancellation).
11. **Frontend**: route-level code splitting, RTK Query caching/dedupe, virtualized grids, image/asset optimization, drop redundant chart/date/DnD libraries (smaller bundle), HTTP/2 + compression.
12. **Response compression** (`AddResponseCompression`, Brotli) — not enabled today.
13. **Server-side filtering/sorting contract** so the client never over-fetches.

---

## 10. New `Program.cs` with Enterprise Features

The current `Program.cs` has Serilog, App Insights, JWT, CORS, Swagger (dev-only), a global exception middleware, and manual AutoMapper. Below is a hardened target adding **authorization policies, health checks, rate limiting, API versioning, ProblemDetails, OpenTelemetry, output caching, response compression, and security headers**.

```csharp
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Identity.Web;            // proper Azure AD validation
using Serilog;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ---- Configuration & secrets (Key Vault via Managed Identity in non-dev) ----
builder.Configuration.AddEnvironmentVariables();

// ---- Logging / Telemetry ----
builder.Host.UseSerilog((ctx, cfg) => cfg.ReadFrom.Configuration(ctx.Configuration));
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t.AddAspNetCoreInstrumentation()
                       .AddHttpClientInstrumentation()
                       .AddEntityFrameworkCoreInstrumentation()
                       .AddNpgsql())
    .WithMetrics(m => m.AddAspNetCoreInstrumentation().AddRuntimeInstrumentation());

// ---- AuthN: validate issuer AND audience via Microsoft.Identity.Web ----
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));
// (Microsoft.Identity.Web validates issuer, audience, lifetime, signature by default.)

// ---- AuthZ: real permission-based policies (see §11) ----
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()   // deny-by-default everywhere
        .RequireAuthenticatedUser().Build());
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();

// ---- App services, EF (code-first + interceptors), caching, etc. ----
builder.Services.AddSpaceLinxInfrastructure(builder.Configuration); // DbContext + interceptors + Redis + Blob + email
builder.Services.AddSpaceLinxApplication();                         // handlers + validators (FluentValidation)
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, HttpUserContext>();

// ---- API surface ----
builder.Services.AddControllers();
builder.Services.AddProblemDetails();                              // RFC 9457 errors
builder.Services.AddApiVersioning(o => { o.ReportApiVersions = true; o.AssumeDefaultVersionWhenUnspecified = true; })
                .AddApiExplorer();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();                                 // + OAuth + bearer

// ---- Resilience / performance ----
builder.Services.AddOutputCache();
builder.Services.AddResponseCompression(o => o.EnableForHttps = true);
builder.Services.AddRateLimiter(o =>
{
    o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.User.Identity?.Name ?? ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 100, Window = TimeSpan.FromSeconds(10) }));
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// ---- Health & readiness ----
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration["PostgreSql:ConnectionString"]!, name: "postgres")
    .AddRedis(builder.Configuration["Redis:ConnectionString"]!, name: "redis", failureStatus: HealthStatus.Degraded);

// ---- CORS (explicit origins from config) ----
builder.Services.AddCors(o => o.AddPolicy("default", p => p
    .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
    .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

var app = builder.Build();

// ---- Pipeline (order matters) ----
app.UseSerilogRequestLogging();
app.UseExceptionHandler();           // + IExceptionHandler → ProblemDetails
app.UseStatusCodePages();
app.UseHsts();
app.UseHttpsRedirection();
app.UseResponseCompression();
app.UseSecurityHeaders();            // CSP, X-Content-Type-Options, Referrer-Policy, etc. (NetEscapades.AspNetCore.SecurityHeaders)
app.UseCors("default");
app.UseRateLimiter();
app.UseOutputCache();
app.UseAuthentication();
app.UseAuthorization();              // fallback policy → deny-by-default

if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("Swagger:Enabled"))
    app.UseSwagger().UseSwaggerUI();

app.MapControllers().RequireRateLimiting("default");
app.MapHealthChecks("/health/live",  new() { Predicate = _ => false });
app.MapHealthChecks("/health/ready");

app.Run();
```

Key deltas vs. today: **issuer validation on, deny-by-default fallback policy, permission policies, health checks, rate limiting, API versioning, ProblemDetails, OpenTelemetry, output cache, response compression, security headers, Key Vault secrets.**

---

## 11. Missing Authentication & Authorization Features

### 11.1 What's wrong today (verified)
- **AuthZ is essentially absent server-side.** `[SpaceLinxAuthroize]` only checks *"this email exists in the DB"* (and caches that for 1 day). It does **not** check roles or permissions. The real permission model (`PagePermissions.js`, `hasPermission()`) lives **only in the React client** → any authenticated user can call any endpoint they can reach. **Authorization is client-side and bypassable.**
- **16 of 110 controllers carry no auth attribute at all** (and the `GenericRestController` base has none) → those endpoints are effectively anonymous to any valid token holder.
- **`ValidateIssuer = false`** — the API accepts tokens from *any* issuer as long as the audience matches. Should validate issuer (or use `Microsoft.Identity.Web`, which does so by default).
- **Permission/role entities exist** (`Role`, `Permission`, `RolePermission`, `UserRole`, `RoleFilter`) but are **not enforced** in the API authorization pipeline — they're read by the frontend.
- **Role passed via `roleId` header** for role-switching, trusted without verification that the user actually holds that role.
- No `AddAuthorization`, no policies, no `[Authorize(Roles=...)]`, no `IAuthorizationHandler` anywhere (grep: 0 hits).

### 11.2 Target authorization model
Move the existing `ENTITY.ACTION` permission scheme (already defined client-side) **into the server** as the source of truth:

1. **Permission-based policies** (`PARTS.MODIFY`, `PO.APPROVE`, …) enforced via a custom `IAuthorizationPolicyProvider` + `PermissionAuthorizationHandler` that reads the user's effective permissions (from `Role`/`RolePermission`/`UserRole`) — cached in Redis.
   ```csharp
   [HttpPut("{id}")]
   [RequirePermission(Permissions.Parts.Modify)]
   public Task<IActionResult> Update(Guid id, PartUpdateRequest r) => ...;
   ```
2. **Deny-by-default** via a fallback authorization policy (every endpoint requires auth unless explicitly `[AllowAnonymous]`).
3. **Verify role-switch**: when `roleId` is supplied, confirm server-side the user is actually assigned that role before applying its permissions.
4. **Row/tenant-level security**: enforce `SPACELINX-TENANT-ID` server-side via a tenant query filter (currently header is trusted/unused for isolation). `RoleFilter` suggests row filtering intent — implement it in EF query filters, not the client.
5. **Validate issuer + audience + signature** (Microsoft.Identity.Web).
6. **Scopes/roles in token**: prefer app roles/groups in the Azure AD token for coarse gating, DB permissions for fine-grained.

### 11.3 Additional authN/authZ hardening
- **Token caching** of *permissions*, not just "user exists", with explicit invalidation on role change (today the 1-day cache would mask permission revocation).
- **Audit authorization decisions** (who accessed/changed what) — ties to §8.
- **Rate-limit auth-sensitive endpoints** and add anti-automation on approvals.
- **Service-to-service auth** (managed identity / client credentials) for background services & integrations (DigiKey, Graph, Jira).
- **Refresh-token & session handling** reviewed on the SPA (MSAL already refreshes < 5 min — good).
- **CORS** is already config-driven (good) — keep origins explicit, never `*` with credentials.
- **Secrets** out of config into Key Vault (DigiKey, SMTP, Jira, blob, Redis, DB).

---

## Prioritized Roadmap (suggested)

| Phase | Theme | Headline items |
|-------|-------|----------------|
| **P0 — Security hotfix (in current repo)** | Stop the bleeding | Server-side authorization (permission policies), validate issuer, add auth to the 16 unprotected controllers, deny-by-default, pagination on generic GET |
| **P1 — Foundations (new repo)** | Greenfield skeleton | Solution layout, code-first EF + interceptors (audit/soft-delete), Program.cs from §10, ProblemDetails, health checks, OpenAPI + TS client, CI with tests |
| **P2 — Frontend modernization** | TS + RTK Query | TypeScript migration, consolidate UI kit, RTK Query, design system, a11y |
| **P3 — Module parity (strangler)** | Migrate modules | Inventory → Procurement → PLM → MES → PM, each with tests + feature-gap fills |
| **P4 — New modules** | Expand | QMS, CMMS, SRM, Planning/MRP, Document/Config control |
| **P5 — Enterprise hardening** | Scale & comply | Full audit log, e-signatures, multi-tenancy enforcement, observability, durable jobs, reporting |

---

*Generated from a structural review of the SpaceLinx mono-repo. File/line references and counts reflect the repository state on 2026-05-30.*
