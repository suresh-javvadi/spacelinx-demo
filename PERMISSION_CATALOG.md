# SpaceLinx — Permission Catalog & Authorization Enforcement Map

> Source: `src/spacelinx-mes/src/constants/PagePermissions.js` (the client-side source of truth), cross-checked against the API.
> Pulled: 2026-05-30. **249 unique permission strings** across **55 categories**, using a `CATEGORY[.SUBCATEGORY].ACTION` convention.
>
> **Live reconciliation (authoritative): see [`DB_FINDINGS.md`](./DB_FINDINGS.md).** UAT (production-close) `application.permission` holds **164** rows — the canonical SpaceLinx catalog. **163 overlap** the frontend; **86 frontend permissions have no DB row** (ungrantable, must be seeded before server-side enforcement); **1 DB typo** (`VENDORS.DOC.DELETE`). `Super Admin` is god-mode-by-role-name (1 perm) and needs an explicit bypass policy. The HR/Payroll/Expense permissions seen in dev are a **separate product — out of scope.**

## Enforcement reality (verified)

| Layer | Behavior |
|-------|----------|
| **Frontend** | Defines all 249 permissions; `hasPermission()` gates UI + routes |
| **API — serves them** | `UserService`, `UserController`, `PermissionController`, `RolePermissionController` **read** `RolePermission` rows only to return them to the client |
| **API — enforces them** | **None.** 0 occurrences of permission-based gating before an action (no `RequirePermission`, no policy check). `[SpaceLinxAuthroize]` only verifies the email exists in the DB. |

**Conclusion:** 249 permissions are defined and shipped to the browser but enforced **0%** server-side. The catalog below is therefore also the *work list* for the server-side authorization layer — each entry becomes an ASP.NET authorization policy, and the `*_ALL_DEPARTMENTS` / department-scoped entries become EF row-level (`RoleFilter`) filters.

---

## Action-verb taxonomy

| Verb | Meaning | Count (approx) |
|------|---------|------|
| `VIEW` | read/list | ~55 |
| `MODIFY` | create + update | ~50 |
| `DELETE` | soft delete | ~40 |
| `APPROVER` / `APPROVE` | workflow approval gate | 6 (ECO, PURCHASEORDERS, GOODSRECEIPTS, REQUISITIONS, QUALITYCHECKS, VENDORRETURNS, SCRAP) |
| `CREATE` | explicit create (ROLES, ApprovalsConfig) | 2 |
| `REVISE` | PLM revision bump (PARTS) | 1 |
| `PUBLISH` / `PRINT` / `CLONE` | guide/work-order/BOM lifecycle | GUIDES, WORKORDERS, PURCHASEORDERS, PARTS.BOM |
| `ASSIGN*` | assignment ops (TASKS, WORKORDERS, MATERIALKITS) | 5 |
| `CONFIGURE` | settings (KANBAN, DASHBOARDS) | 2 |
| `LOG_OWN` / `LOG_ANY` / `REPORTS` | time tracking scope | 3 |
| `PRICE` | field-level (PARTS.INVENTORY.PRICE) | 1 |
| `VIEW_ALL_DEPARTMENTS` | **row-scope override** (PURCHASEORDERS, REQUISITIONS) | 2 |

> Two scope-modifier permissions — `PURCHASEORDERS.VIEW_ALL_DEPARTMENTS` and `REQUISITIONS.VIEW_ALL_DEPARTMENTS` — confirm that **department-level row filtering is intended**. These are exactly what the `RoleFilter` table (`Entity/Key/Operator/Value`) drives and must be enforced via EF global query filters server-side.

---

## Catalog by domain

### Program / Project Management (PM) — 34
- **PROGRAMS** (5): VIEW, MODIFY, DELETE, LINKEDPROJECTS.VIEW, MILESTONES.VIEW
- **PROJECTS** (3): VIEW, MODIFY, DELETE
- **TASKS** (11): VIEW, MODIFY, DELETE, ASSIGN, SUBTASKS.{VIEW,MODIFY}, DEPENDENCIES.{VIEW,MODIFY}, COMMENTS.{VIEW,MODIFY,DELETE}
- **TIMETRACKING** (4): VIEW, LOG_OWN, LOG_ANY, REPORTS
- **GANTT** (2): VIEW, MODIFY
- **KANBAN** (3): VIEW, MODIFY, CONFIGURE
- **RESOURCES** (2): VIEW, ALLOCATE
- **DASHBOARDS** (2): VIEW, CONFIGURE
- **SUBSYSTEMS** (3): VIEW, MODIFY, DELETE

### PLM — 36
- **PARTS** (16): VIEW, MODIFY, DELETE, REVISE, INVENTORY.{VIEW,MODIFY,PRICE}, TRANSACTIONS.VIEW, BOM.{VIEW,MODIFY,DELETE,CLONE}, WHEREUSED.VIEW, DOCUMENTS.{VIEW,MODIFY,DELETE}
- **BOM** (1): VIEW
- **ECO** (10): VIEW, MODIFY, DELETE, APPROVER, EFFECTEDPARTS.{VIEW,MODIFY,DELETE}, DOCUMENTS.{VIEW,MODIFY,DELETE}
- **PARTTYPES** (3), **PARTTYPECATEGORIES** (3), **PARTLEVELS** (3): VIEW, MODIFY, DELETE each

### MES — 40
- **PRODUCTS** (7): VIEW, MODIFY, DELETE, WORKORDERS.VIEW, BOM.{VIEW,MODIFY,DELETE}
- **GUIDES** (6): VIEW, MODIFY, DELETE, PUBLISH, PRINT, CLONE
- **WORKORDERS** (10): VIEW, MODIFY, DELETE, ASSIGNTECHNICIAN, ASSIGNKIT, ASSIGNPRODUCT, PRINT, DOCUMENTS.{VIEW,MODIFY,DELETE}
- **MATERIALKITS** (4): VIEW, MODIFY, DELETE, ASSIGNWORKORDER
- **TOOLS** (3), **MACHINES** (3): VIEW, MODIFY, DELETE each
- **ASSEMBLYLOCATIONS** (3): VIEW, MODIFY, DELETE
- **QUALITYCHECK** (3): VIEW, MODIFY, DELETE
- **QUALITYCHECKS** (7): VIEW, MODIFY, DELETE, APPROVER, DOCUMENTS.{VIEW,MODIFY,DELETE}  *(note: QUALITYCHECK and QUALITYCHECKS are duplicate/overlapping categories — consolidate)*

### Procurement — 41
- **PURCHASEORDERS** (9): VIEW, MODIFY, DELETE, PRINT, APPROVER, VIEW_ALL_DEPARTMENTS, DOCUMENTS.{VIEW,MODIFY,DELETE}
- **REQUISITIONS** (8): VIEW, MODIFY, DELETE, APPROVER, VIEW_ALL_DEPARTMENTS, DOCUMENTS.{VIEW,MODIFY,DELETE}
- **GOODSRECEIPTS** (7): VIEW, MODIFY, DELETE, APPROVER, DOCUMENTS.{VIEW,MODIFY,DELETE}
- **VENDORS** (18): VIEW, MODIFY, DELETE, ADDRESS.{VIEW,MODIFY,DELETE}, CONTACTS.{VIEW,MODIFY,DELETE}, BANKS.{VIEW,MODIFY,DELETE}, PARTS.{VIEW,MODIFY,DELETE}, DOCUMENTS.{VIEW,MODIFY,DELETE}
- **PAYMENTTERMS** (3): VIEW, MODIFY, DELETE
- **VENDORRETURNS** (3): VIEW, MODIFY, APPROVE

### Inventory — 18
- **GOODS** (4): VIEW, MODIFY, DELETE, TRANSACTIONS.VIEW
- **SERVICES** (4): VIEW, MODIFY, DELETE, TRANSACTIONS.VIEW
- **STOCKMOVEMENTS** (2): VIEW, MODIFY
- **SCRAP** (3): VIEW, MODIFY, APPROVE
- **BINMANAGEMENT** (3): VIEW, MODIFY, DELETE
- **LOCATIONS** (3): VIEW, MODIFY, DELETE

### Contact Hub / Master Data — 18
- **COMPANIES** (6): VIEW, MODIFY, DELETE, DOCUMENTS.{VIEW,MODIFY,DELETE}
- **CUSTOMERS** (3), **CONTACTS** (3): VIEW, MODIFY, DELETE each
- **PARTNERS** (6): VIEW, MODIFY, DELETE, DOCUMENTS.{VIEW,MODIFY,DELETE}

### Admin / Security / Platform — 42
- **USERS** (2): VIEW, MODIFY
- **ROLES** (4): VIEW, CREATE, MODIFY, DELETE
- **PERMISSIONS** (3): VIEW, MODIFY, DELETE
- **STAFF** (3): VIEW, MODIFY, DELETE
- **DEPARTMENTS** (3): VIEW, MODIFY, DELETE
- **ORGANIZATION** (6): VIEW, MODIFY, DELETE, ADDRESS.{VIEW,MODIFY,DELETE}
- **ApprovalsConfig** (4): VIEW, CREATE, MODIFY, DELETE
- **ADDITIONALRECIPIENTS** (3): VIEW, MODIFY, DELETE
- **EMAILTEMPLATES** (3): VIEW, MODIFY, DELETE
- **EMAILLOGS** (1): VIEW
- **FEATURES** (3): VIEW, MODIFY, DELETE
- **NEWS** (3): VIEW, MODIFY, DELETE
- **ISSUES** (3): VIEW, MODIFY, DELETE
- **BULKUPLOAD** (2): VIEW, MODIFY
- **REPORTS** (4): VIEW, MODIFY, DELETE, BOMCONSOLIDATED.VIEW

---

## Mapping to server-side enforcement

1. **Generate typed constants** (`Permissions.Parts.Modify = "PARTS.MODIFY"`) from this catalog so API and client share one source (ideally code-gen the TS + C# from one JSON).
2. **Each permission string → an authorization policy** via a custom `IAuthorizationPolicyProvider` + `PermissionAuthorizationHandler` that resolves the caller's enabled `RolePermission`s (cached in Redis, invalidated on role change).
   ```csharp
   [HttpPost]              [RequirePermission(Permissions.Requisitions.Modify)]
   [HttpPost("{id}/approve")] [RequirePermission(Permissions.Requisitions.Approver)]
   ```
3. **Row-level (`RoleFilter`) → EF global query filters.** `VIEW_ALL_DEPARTMENTS` becomes a policy that, when absent, applies the department `RoleFilter` to PO/Requisition queries server-side.
4. **Field-level** (`PARTS.INVENTORY.PRICE`) → strip/forbid the field in the DTO mapping when the permission is absent.
5. **Data hygiene to resolve:** `QUALITYCHECK` vs `QUALITYCHECKS` appear to be duplicate categories — consolidate during migration.

---

## Live verification — RESOLVED (see `DB_FINDINGS.md`)

✅ Ran against dev + UAT (read-only). Results in [`DB_FINDINGS.md`](./DB_FINDINGS.md): UAT catalog = 164 (canonical), 86 frontend-only/ungrantable, 1 typo, `role_filter` unused (0 rows UAT), `Super Admin` = god-mode bypass. The queries used (for reference / re-run):

```sql
-- 1. Which permissions are actually enabled, per role (vs. the 249 defined)
SELECT r.role_name, rp.permission, rp.enable
FROM application.role_permission rp
JOIN application.role r ON r.id = rp.role_id
WHERE rp.deleted_at IS NULL
ORDER BY r.role_name, rp.permission;

-- 2. Is row-level filtering actually used? (drives EF query-filter design)
SELECT r.role_name, rf.entity, rf.key, rf.operator, rf.value
FROM application.role_filter rf
JOIN application.role r ON r.id = rf.role_id
WHERE rf.deleted_at IS NULL;

-- 3. Permission catalog as stored in DB (compare against the 249 client-side)
SELECT category_name, name FROM application.permission
WHERE deleted_at IS NULL ORDER BY category_name, name;

-- 4. Data volumes for pagination/index prioritization
SELECT relname AS table, n_live_tup AS approx_rows
FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 25;
```
```
