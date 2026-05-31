# SpaceLinx — Database Findings (UAT = production-close, read-only)

> Sources: `spacelinx_uat` (authoritative, production-close) and `spacelinx` (dev), read-only sessions, 2026-05-30.
> **Scope note:** the `hr`, `payroll`, and `expense` schemas are a **separate product co-located on the same server** — **out of scope for SpaceLinx** and excluded from everything below. SpaceLinx schemas: `mes`, `sc`, `common`, `application`, `pm` (+ `imagery`, `vm`, `dap` in the SSDT project).

## Schema map (UAT)

| Schema | Tables | Rows | Domain |
|--------|------:|-----:|--------|
| `mes` | 40 | 33,244 | MES/PLM — parts, BOM/EBOM, ECO, guides, work orders |
| `sc` | 31 | 21,368 | Supply Chain — procurement + inventory |
| `common` | 15 | 12,878 | documents, images, approvals, addresses |
| `application` | 16 | 2,187 | identity, roles, permissions |
| `pm` | 12 | **14** | Program Management — **effectively unused** |

## Performance — concrete hotspots at production-close scale

UAT volumes are real (parts **10,138**; PO line items **9,217**; documents **3,843**; approvals **2,452**). The "generic `GET` returns the whole table, no pagination" pattern is now a **genuine** concern, not just readiness. The `pg_stat_user_tables` scan counters expose specific problems:

| Table | Rows | seq_scan | idx_scan | Diagnosis |
|-------|-----:|---------:|---------:|-----------|
| **`sc.purchase_order`** | 1,804 | **24,276** | 420 | 🔴 Worst hotspot. ~24K full-table scans on 1.8K rows — almost certainly the generic GET pulling all POs + **in-memory department filtering** (`VIEW_ALL_DEPARTMENTS`) on every call. Add indexed, server-side dept filter + pagination. |
| **`common.document`** | 3,843 | 158 | **0** | 🔴 Zero index usage — every document lookup is a full scan. Missing index on the FK it's queried by (entity/owner id). |
| `mes.guide_step_equipment` | 3,014 | 115 | 3 | 🟠 Almost all full scans. |
| `sc.inventory_part` | 1,988 | 87 | 5 | 🟠 Mostly full scans. |
| `mes.eco_log`, `sc.company_address`, `sc.company_part`, `sc.inventory_transaction` | 522–745 | — | **0** | 🟠 No index usage. |
| `mes.part` | 10,138 | 691 | 58,170 | 🟢 Healthy — well-indexed (reference for the rest). |

**Action (performance, objective #9):** prioritize in this order — (1) pagination + server-side filter/sort on the generic list endpoints, (2) index `purchase_order` department/status columns and push dept filtering into SQL, (3) index `common.document` by owning-entity id, (4) audit the 0-idx_scan tables for missing FK indexes. `mes.part` shows the schema *can* be well-indexed — the gaps are specific, not systemic.

**Tech-debt:** `sc.temp_inventory_import` (1,305 rows) and `sc.temp_tracking` (636 rows) are **staging/temp tables living in the production schema** — move to a transient process or separate schema.

## Identity & authorization (UAT)

- **23 roles, 422 users, 593 user-role assignments** (~170 users hold multiple roles). Production-scale.
- Roles are SpaceLinx-focused: *Admin (120 perms), Supply Chain Admin (49), Manager (46), Manufacturing Admin (45), Procurement Admin (39), PLM Admin (37), SCM Manager (34), … Eco Approver (5), QC (3)*.
- **`Super Admin` has only 1 enabled permission** → confirms a **god-mode-by-role-name** bypass (the client treats "Super Admin" as all-access regardless of the permission list, per `rolePermissions.json`). The server-side authorization layer **must preserve an explicit Super Admin bypass policy**, or Super Admins lose access the moment enforcement is added.
- **Row-level security (`role_filter`) is COMPLETELY UNUSED in UAT — 0 rows** (dev had 1). → The mechanism is aspirational. Build it generically when needed, but it is **not** a current requirement. Lowest priority.

## Permission catalog (UAT is the canonical SpaceLinx catalog)

| | count |
|---|---:|
| Frontend `PagePermissions.js` | 249 |
| UAT `application.permission` | **164** |
| In **both** | 163 |
| **Client-only** (UI checks it, no DB row → ungrantable) | **86** |
| **UAT-only** | **1** → `VENDORS.DOC.DELETE` (typo of `VENDORS.DOCUMENTS.DELETE`) |

The UAT catalog is **clean** — no HR/payroll/expense or test-junk permissions (those were only in dev). So:

- **86 of the 249 UI permissions (35%) have no DB row** → the role-permission admin screen literally cannot grant them. Today that's harmless (nothing is enforced server-side), but **the instant server-side enforcement is added, those 86 endpoints deny-by-default for everyone** because their permission can't be assigned. **These 86 must be seeded before/with the authorization rollout.**
- Fix the one typo (`VENDORS.DOC.DELETE` → `VENDORS.DOCUMENTS.DELETE`).
- Establish **one source of truth** (recommend a JSON catalog code-genned into both C# constants and the TS `PERMISSIONS` object) so client and DB can never drift again.

## What this changes in the plan

1. **Performance moves from "readiness" to "do it"** — but **surgically**: pagination on list endpoints + ~4 specific index/query fixes (PO, document, and the 0-idx tables), not a blanket rewrite. `purchase_order` (24K seq scans) is the headline.
2. **De-prioritize Program Management feature work** (#6) — `pm` has 14 rows; it's not in real use. Don't over-invest there.
3. **Authorization rollout has a hard prerequisite**: seed the 86 missing permissions + preserve Super Admin bypass, or enforcement will lock people out.
4. **Catalog reconciliation is small and clean** (UAT 164 is canonical; seed 86; fix 1 typo; single source of truth).
5. **Drop the HR/payroll/expense storyline entirely** — separate product.
