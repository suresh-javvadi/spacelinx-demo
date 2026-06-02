# SpaceLinx Platform-Wide Audit Trail — Design & Implementation Plan

| | |
|---|---|
| **Version** | 1.0 (specialist-reviewed) |
| **Date** | 2026-06-02 |
| **Status** | For team review — no code written yet |
| **Goal** | Reliably capture **who created / modified / deleted what, and when**, across all entities — primarily to resolve and clarify production issues, and to serve as a security/compliance control. |
| **Reviewers** | Software Architect · Security & Compliance · PostgreSQL DBA / Data-platform (all consulted 2026-06-02) |

---

## 1. Problem & current state

The team needs a dependable audit trail to answer "who changed this record, to what, and when" when triaging production issues. Today the system has only **partial, inconsistent** coverage:

- `BaseModel` carries `CreatedAt/CreatedBy/UpdatedAt/UpdatedBy/DeletedAt/DeletedBy` — **row-level stamping only**, no field-level history (no before/after values).
- Stamping is set **manually and inconsistently**: `GenericRestController` sets it on its CRUD paths, but ~21 services call `SaveChangesAsync` directly and stamp ad-hoc; `Activate`/`DeActivate` don't stamp at all; `CreatedAt` relies on a DB default.
- **No EF Core `SaveChanges` override or interceptor** — nothing enforces stamping centrally.
- Only `pm.task_activity` has field-level history (Tasks only). `approval_log`/`eco_log` capture workflow-state transitions, not field changes.
- A **hard-delete endpoint exists on every entity** (`DELETE/{id}/hard`) and physically removes rows with **no audit** — the easiest evidence-destruction path.
- No correlation/trace id linking changes to requests or error logs; `HttpContext.TraceIdentifier` exists but isn't propagated to writes.

**Conclusion:** the gap is not "add a column" — it is a missing, centralized, tamper-resistant change-history mechanism. All three specialists independently reached the same core design.

> **Synergy:** the Program Management module (separate plan) has a "full audit trail" NFR and regulatory chain-of-custody / External-Auditor requirements. This platform audit trail is the foundation those build on.

---

## 2. Recommended design (specialist consensus)

### 2.1 Capture mechanism — **custom EF Core `ISaveChangesInterceptor` (primary)**

A single `ISaveChangesInterceptor` registered on the DbContext captures every `Added`/`Modified`/`Deleted` entity at `SavingChangesAsync`, reads field-level original vs current values from the EF `ChangeTracker`, and writes structured audit rows at `SavedChangesAsync`.

- **Why not Audit.NET** — it works, but adds an external dependency with an opaque, library-defined schema; a focused ~300-line interceptor gives full control and a directly queryable audit schema we own. (Audit.NET remains a reasonable fallback if we want to save build effort — flagged as a decision.)
- **Why not DB triggers as primary** — triggers can't see the application user identity without setting a session variable on every write path, and they duplicate ORM change-tracking.

**Two high-value secondary benefits of the interceptor:**
1. **Centralizes the inconsistent stamping** — one place sets `CreatedAt/By`, `UpdatedAt/By`, `DeletedAt/By` for all 122 entities through every code path (controllers, the 21 services, background jobs). Fixes the systemic inconsistency with zero controller/service changes.
2. **Closes the hard-delete gap** — converts `EntityState.Deleted` to an audited soft-delete (or, for entities explicitly marked `[HardDeletePermitted]`, writes a `HARD_DELETE` audit row before the physical delete). No row leaves the system unrecorded.

### 2.2 Complements (defense-in-depth)

- **DB triggers on a small "crown-jewels" shortlist** (roles, permissions, pricing, money/safety-critical tables) using a shared `audit.if_modified_func()` and `SET LOCAL app.user_id` set by the app per transaction. Catches changes made **outside the app** (DBA hotfix, raw SQL, other services). Writes the **same** audit schema with a `source` flag. Not all 122 tables — only the shortlist.
- **pgaudit** enabled on UAT/Prod Postgres for **DDL + role/privilege** activity → shipped to Azure log storage. Compliance-grade "who changed schema / granted roles"; not row-level history.

### 2.3 Audit data model — single, partitioned, in a dedicated `audit` schema

One central table (not per-entity) in a **separate `audit` schema** the application login does **not** own (tamper-resistance), time-partitioned by month.

```sql
CREATE SCHEMA audit;

CREATE TABLE audit.change_log (
    id             bigint GENERATED ALWAYS AS IDENTITY,     -- monotonic surrogate (insert locality)
    occurred_at    timestamptz NOT NULL DEFAULT clock_timestamp(),
    schema_name    text        NOT NULL,
    table_name     text        NOT NULL,
    entity_type    text        NOT NULL,                    -- CLR/entity name
    row_pk         uuid        NOT NULL,                    -- audited row's PK (source may later be deleted)
    operation      text        NOT NULL,                    -- INSERT|UPDATE|SOFT_DELETE|HARD_DELETE|ACTIVATE|DEACTIVATE|READ|EXPORT
    -- diff: changed columns only for UPDATE; full row for INSERT/DELETE; redacted
    old_values     jsonb       NULL,
    new_values     jsonb       NULL,
    changed_cols   text[]      NULL,
    -- actor & authority
    actor_email    text        NOT NULL,                    -- 'system@spacelinx.internal' for background jobs
    actor_role_id  uuid        NULL,                        -- active role at time of action
    authorized_by  text        NULL,                        -- permission that authorized it
    bypass         boolean     NOT NULL DEFAULT false,      -- super-admin override used
    app_name       text        NULL,                        -- SPACELINX-APP-NAME
    tenant_id      text        NULL,
    -- request context (prod-issue resolution)
    correlation_id text        NULL,                        -- W3C traceparent / X-Correlation-ID
    request_path   text        NULL,
    request_method text        NULL,
    source_ip      inet        NULL,
    user_agent     text        NULL,
    -- outcome & integrity
    success        boolean     NOT NULL DEFAULT true,
    source         char(1)     NOT NULL DEFAULT 'A',        -- 'A'=app interceptor, 'T'=db trigger
    prev_hash      bytea       NULL,                        -- hash chain (tamper-evidence)
    row_hash       bytea       NULL,
    PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

-- local indexes (auto-created per partition)
CREATE INDEX ix_changelog_row  ON audit.change_log (schema_name, table_name, row_pk, occurred_at DESC);
CREATE INDEX ix_changelog_actor ON audit.change_log (actor_email, occurred_at DESC);
CREATE INDEX ix_changelog_corr ON audit.change_log (correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX ix_changelog_brin ON audit.change_log USING BRIN (occurred_at) WITH (pages_per_range = 32);
-- NO GIN by default; add partial jsonb_path_ops GIN only if a search-by-value need is proven.
```

Design notes: `bigint` surrogate (not UUID) for append locality; **JSONB** for diffs with **changed columns only on UPDATE** (cuts size/WAL); BRIN on `occurred_at` makes time-range scans near-free on an append-only, time-ordered table; the two btrees make the two headline queries ("all changes to record R", "all changes by user U in window W") partition-pruned and index-backed. `lz4` TOAST compression on the JSONB.

### 2.4 Write path & tiering

**Default = same transaction** as the business write (forensic integrity: audit commits iff the business row commits; no gaps, no loss). Async is allowed **only via a durable outbox** (outbox row written in the business txn, relayed by a background `COPY` batch) for proven-hot tables — never an in-memory-only queue (it silently drops history on crash).

Tier the 122 tables (config-driven):

| Tier | Tables | Captured |
|---|---|---|
| **FULL** (field-level) | master data, config, approvals, the forensic core (~most) | old+new JSONB (changed cols), full context |
| **SNAPSHOT** | `TaskActivity`, `EmailLog` | operation + row_pk only (they're already logs) |
| **EXCLUDE** | `InventoryTransaction`, `StockMovement` | none at field level — they are immutable ledgers and **are** their own audit |

Per-entity control via `[AuditExclude(...)]` / `[HardDeletePermitted]` attributes (reflection cached). High-write exclusions are the main lever to keep write-amplification acceptable.

### 2.5 Security & integrity (Tier 2 baseline platform-wide; Tier 3 for regulated)

- **Append-only enforced at the DB**, not by convention: app connects as an **INSERT-only** role on `audit.*`; `REVOKE UPDATE, DELETE, TRUNCATE`; a `BEFORE UPDATE/DELETE/TRUNCATE` trigger raises an exception. App's normal CRUD role has **zero** access to `audit`.
- **Hash-chaining** (`prev_hash`, `row_hash`) computed in-DB + a periodic verifier job + **daily out-of-band anchoring** of the chain head to WORM storage (Azure Blob immutability/legal-hold) the DBA doesn't control — makes tampering *evident* even against privileged users.
- **Tier 3 (regulated PgM entities — ITU/ITAR-EAR/insurance/shipment cert):** offload audit rows / signed digests to **WORM storage with a retention lock**; optionally Azure Confidential Ledger for cryptographic chain-of-custody. Can land **with the PgM module**, not blocking the platform baseline.
- **Fail-closed redaction** at one serialization choke point: `[AuditRedact]/[Sensitive]` attribute (authoritative) + property-name denylist backstop (`password|secret|token|apikey|connectionstring|pwd|privatekey|clientsecret|authorization|cookie`) + a **secret-scanner tripwire** that redacts-and-alerts. If a field can't be classified, it is redacted. *Directly closes the recent plaintext-password-in-logs risk — the audit pipeline catches secrets, never stores them.*
- **No export-controlled payloads** in diffs — store metadata + a content hash, never the controlled content.
- **Access control:** new permissions `AUDIT.VIEW` and `AUDIT.VIEW.REGULATED` (the latter additionally export-control gated); **no `AUDIT.EDIT`/`AUDIT.DELETE` permission exists at all**; **SUPER ADMIN does not implicitly get audit read** and cannot write/delete audit (enforced at the DB role layer, below the app). **Audit reads are themselves audited.** Every super-admin/bypass action is logged with `bypass=true` and the permission it would have required.
- **Segregation of duties:** app-admin ≠ audit-reader ≠ DBA ≠ WORM-store-owner; no single human holds the combination that defeats the control.
- **Selective READ auditing:** not all reads — only reads/exports of regulated/sensitive records (`[AuditRead]`), since bulk export of sensitive data is the top exfiltration signal.

### 2.6 Identity & correlation at SaveChanges time

- A **`CorrelationMiddleware`** (early in the pipeline) reads/generates `X-Correlation-ID` (W3C `traceparent`), echoes it on the response, and stashes it in `HttpContext.Items` + `Activity`. **The same correlation id is written to both audit rows and error/Serilog logs** — the single highest-value lever for production triage.
- An **`IAuditContext`** (scoped, backed by `IHttpContextAccessor`) resolves actor email (JWT `preferred_username`), active role id, app name, tenant, source IP, user agent, request path/method. Background jobs (no `HttpContext`) → `actor_email = system@spacelinx.internal`, correlation from `Activity.Current`.
- **Pooling caveat:** `SpaceLinxContext` uses `AddDbContextPool`. Register the interceptor via the `IServiceProvider` overload of `AddDbContextPool`, keep per-save state in `AsyncLocal` keyed by the EF `ContextId` (cleared in `SavedChanges`/`SavedChangesFailed`/`finally` to prevent actor bleed between pooled requests), and write audit rows through a fresh child `IServiceScope` (the child save skips the interceptor for `change_log` rows).

### 2.7 Retention, partitioning & operations

- **Monthly RANGE partitions**; automate create-ahead (3 months) + drop via `pg_partman` + `pg_cron` (both supported on Azure PostgreSQL Flexible Server — must be allowlisted). **No DEFAULT partition** (a missing future partition should error loudly, not silently dump into a heap).
- **Tiered retention:** general operational 12–18 months hot then **DROP partition** (instant, bloat-free; export to Parquet/Blob first if longer history is needed); security events 2y+; **regulated ≥5y** (never touched by general purge).
- **Right-to-erasure vs immutability:** resolve via **crypto-shredding** — store PII encrypted per-subject; destroy the key to honor erasure while keeping the audit row and hash chain intact. Never delete audit rows. (Regulated records override erasure per statute.) Purge is an **automated, audited** job.
- **Append-only tuning:** `fillfactor=100`, `autovacuum_vacuum_insert_threshold≈100k` for FREEZE, `lz4` TOAST; optional separate tablespace so audit IO doesn't compete with OLTP.
- Delivered as **offline SQL migration scripts** (matches the repo's no-EF-migrations convention): audit schema + partitioned table + indexes + grants + trigger function/shortlist triggers + partman/cron config. Audit-table growth + partition pre-creation + write-amplification ratio are **monitored with alerts**.

### 2.8 Read / observability surface

- A secured **audit read API** (`AUDIT.VIEW`) for the two headline queries: record history (timeline of changes to one record) and actor activity (what user X did in a window), plus correlation-id lookup tying a change to its request and error logs.
- A lightweight **audit viewer UI** (record-history drawer + admin search) — directly serves "resolve production issues," and later powers the PgM External-Auditor view. (Scope decision: API-first vs UI-now — see §6.)
- App Insights custom events on audit write failures; alert on Serilog audit-failure warnings.

---

## 3. Risks & mitigations (top)

1. **Pooled-context actor bleed** → `AsyncLocal` keyed by `ContextId`, cleared in `finally`.
2. **Write amplification** on hot tables → tiering (exclude ledgers), changed-columns-only diffs, durable outbox + `COPY` for proven-hot tables.
3. **Audit insert failure rolling back business txn** → audit failure logs a warning but does **not** roll back business data (atomic audit-or-nothing is opt-in for critical entities like Approval/ECO).
4. **Hard-delete→soft-delete breaking FK/caller expectations** → `[HardDeletePermitted]` escape hatch that still writes a `HARD_DELETE` audit row.
5. **Service-account tokens lacking `preferred_username`** → never write null/empty actor; fall back to system actor + warn.
6. **Integrity vs privileged users** → tampering can only be made *evident* (hash-chain + out-of-band anchor + WORM), not impossible; documented with SoD.

---

## 4. Consolidated sign-off conditions

**Architect:** systematic coverage via interceptor (controller + service + background all audited, non-null actor); hard-delete produces an audit row (no silent physical delete); stamping consistent on all 122 entities; p99 of top-5 write endpoints regresses ≤10ms under load; audit-insert failure does not roll back business txn; redaction unit-tested; migration deployed to Dev/UAT.

**Security:** DB-enforced append-only (INSERT-only role + immutability trigger); hash-chain + verifier + daily out-of-band anchor; fail-closed centralized redaction + secret tripwire (regression test for the password incident); no export-controlled payloads in diffs; `AUDIT.VIEW`/`AUDIT.VIEW.REGULATED` exist, no edit/delete permission, super-admin cannot read/write/delete audit, audit reads audited; SoD documented; mandatory capture fields incl. correlation id + bypass flag; hard delete disabled for auditable entities, deletes carry before-snapshot, bulk ops audited per-row with batch id; tiered retention (regulated ≥5y), crypto-shred erasure, automated audited purge; coverage systematic not opt-in.

**DBA:** tiering committed (ledgers excluded, logs snapshot-only); changed-columns-only on UPDATE; partitioning live before go-live (monthly, auto create/drop, no DEFAULT, drop-not-delete); INSERT-only grants verified; BRIN + two btrees, no GIN unless justified; same-transaction default / durable outbox only for async (no-loss on crash drill); insert-freeze autovacuum + lz4; load test at 2× peak shows <10–15% p99 impact; monitoring/alerting deployed; forensics drill proves both headline queries are partition-pruned + index-backed.

Hard blockers: no partitioning · mutable audit · in-memory-only async.

---

## 5. Implementation plan (phased)

| Phase | Scope | Key deliverables |
|---|---|---|
| **P0 — Foundation** | Correlation + audit schema | `CorrelationMiddleware` (W3C traceparent → audit + logs); `IAuditContext`/`HttpAuditContext` (incl. system-actor fallback); offline SQL migration for `audit` schema, partitioned `change_log`, indexes, INSERT-only grants, immutability trigger, monthly partitions + partman/cron; `ChangeLog` entity + DbSet. |
| **P1 — Interceptor (stamping, shadow)** | Centralize stamping | `AuditDiffBuilder` (changed-cols, fail-closed redaction, attribute + denylist + secret tripwire); `SpaceLinxAuditInterceptor` doing **stamping only** first; register on `AddDbContextPool` via `IServiceProvider`; apply `[AuditExclude]`/tiering attributes; integration test: all 122 entities get consistent `CreatedAt/By`/`UpdatedAt/By` via every path. |
| **P2 — Audit write + hard-delete capture** | Turn on history | Enable `SavedChanges`/`SavedChangesFailed` audit writes (child scope); convert hard-delete → audited soft-delete (+`[HardDeletePermitted]` path); hash-chain compute; **shadow mode** to a shadow table for 2 weeks, reconcile vs `task_activity`/`approval_log`. |
| **P3 — Integrity, complements & retention** | Tamper-evidence + coverage gaps | Hash-chain verifier job + daily out-of-band WORM anchor; DB triggers on crown-jewels shortlist (`SET LOCAL app.user_id`, same schema, `source='T'`); enable pgaudit (DDL/role) on UAT/Prod; retention/partition-drop job; crypto-shred plumbing for PII. |
| **P4 — Access, read API & viewer** | Make it usable | `AUDIT.VIEW`/`AUDIT.VIEW.REGULATED` permissions (super-admin excluded from implicit grant; audit reads audited); secured audit read API (record history, actor activity, correlation lookup); audit viewer UI; App Insights alerts; load test + forensics drill; **then** remove now-redundant manual stamping from `GenericRestController` + the 21 services (staggered). |
| **P5 — Regulated Tier-3 (with PgM)** | Chain-of-custody | WORM/retention-lock offload (and optional Confidential Ledger) for regulated PgM entities; selective READ/EXPORT auditing for controlled records. Lands alongside the Program Management module. |

---

## 6. Open decisions for the team

1. **Capture library:** custom interceptor (recommended — control/queryability) vs Audit.NET (less build effort, external dependency).
2. **Tamper-evidence tier now:** Tier 2 (INSERT-only + hash-chain + out-of-band anchor) platform-wide now, Tier 3 WORM with PgM (recommended) — or defer hash-chain to a later phase to ship the basic trail faster.
3. **Complements timing:** DB-trigger crown-jewels shortlist + pgaudit in P3 (recommended) vs later.
4. **Read surface:** ship the **viewer UI** in P4, or API-first and add UI later.
5. **Retention windows:** confirm general (12–18 mo) / security (2y+) / regulated (≥5y) with compliance/counsel.
6. **Hard delete:** confirm OK to disable hard-delete for auditable entities (soft-delete default), keeping `[HardDeletePermitted]` only where truly needed.

---

_After team review, this becomes an Azure DevOps backlog (Epic → Features → Stories) mirroring the phased plan, in the same style as the PgM backlog. No work items created yet._
