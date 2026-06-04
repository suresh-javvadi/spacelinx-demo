# EF Migrations Exclusion List (feeds Plan Task 5)

> Every database object that EF Core migrations must **NOT** create, own, or diff against.
> Derived from `reconciliation-report.md`. Source dump: `database/audit/uat.schema.sql` (PostgreSQL 16.12).
> Anything **not** on this list is owned by the code-first model and may be created/altered by EF.

---

## 0. Out-of-scope schemas — HR / Payroll / Expense (separate product)

Per `DB_FINDINGS.md`, `hr`/`payroll`/`expense` are a **separate product co-located on the same server**, not part of SpaceLinx. **Verified 2026-06-03:** they are **absent from `spacelinx_uat_v1`** (only `application`, `common`, `mes`, `pm`, `sc`, `public` exist here).

**Permanent guard — SpaceLinx owns exactly these 5 schemas:** `mes`, `sc`, `common`, `application`, `pm` (plus `vm`, `dap`, `imagery` if/when they materialize per the SSDT project).

- **Every `pg_dump` and CI build-from-scratch MUST use an explicit schema allow-list** (`-n mes -n sc -n common -n application -n pm …`) — never a whole-database dump — so HR/Payroll/Expense can never be swept in even if co-located.
- The EF model maps only SpaceLinx-schema entities; the baseline's `CreateTable`s are confined to the schemas above.
- If HR/Payroll/Expense ever appear in a SpaceLinx environment, they are **ignored**, not migrated.

## A. Views (23) — auto-excluded via `.ToView(...)`

Already mapped as keyless query types in `SpaceLinxContext.cs`; EF emits no DDL for them. Listed for completeness.

| Schema | Views |
|---|---|
| common | `document_with_users_vw` |
| mes | `eco_with_users_vw`, `guide_mbom_details`, `guide_mbom_vw`, `parts_not_associated_with_guides`, `workorderguidestepsview` |
| pm | `resource_workload_vw`, `task_gantt_vw` |
| sc | `company_with_organization_vw`, `grn_with_user_vw`, `grns_by_purchase_order_vw`, `inventory_goods_vw`, `inventory_part_price_vw`, `inventory_part_vw`, `inventory_services_vw`, `inventory_transaction_vw`, `issue_history_vw`, `purchase_history_vw`, `purchase_orders_vw`, `requisitions_with_user_vw`, `scrap_request_with_user_vw`, `stock_movement_with_user_vw`, `vendor_return_request_with_user_vw` |

**Action:** none (EF already ignores). Manage view DDL as repeatable SQL in `database/procedures/` (or `database/views/`).

---

## B. Functions (20) — manage as `database/procedures/` + repeatable SQL

EF never manages functions. **Ordering note:** `application.generate_alphanumeric_sequence` is referenced by column DEFAULTs on `mes.guide/material_kit/product/work_package.number`, so it must be **applied before** the EF baseline `CreateTable` of those tables (run the function script first in the deploy sequence). All others are runtime/trigger business logic.

| Schema | Functions |
|---|---|
| application | `generate_alphanumeric_sequence` *(DDL-ordering dependency — create before baseline tables)* |
| mes | `generate_eco_number`, `generate_part_number`, `update_has_bom_flag`, `update_status_to_approved` |
| pm | `create_default_board_columns`, `generate_program_code`, `generate_project_code`, `generate_task_code` |
| sc | `generate_company_code`, `generate_customer_code`, `generate_grn_number`, `generate_partner_code`, `generate_purchase_order_number`, `generate_req_number`, `generate_scrap_number`, `generate_stock_movement_number`, `generate_tender_number`, `generate_vendor_code`, `generate_vendor_return_number` |

---

## C. Triggers (2) — manage as `database/procedures/` + repeatable SQL

| Trigger | Table | Events | Function |
|---|---|---|---|
| `part_number_trigger` | `mes.part` | `BEFORE INSERT OR UPDATE OF part_type_id`, row-level | `mes.generate_part_number()` |
| `trg_update_has_bom_flag` | `mes.ebom` | `AFTER INSERT OR DELETE OR UPDATE`, row-level | `mes.update_has_bom_flag()` |

**Action:** re-assert via repeatable SQL after any migration that rewrites `mes.part` or `mes.ebom`.

---

## D. Sequences (19)

### D1. Function-owned → **EXCLUDE from EF** (12)

Referenced only inside `generate_*` function bodies. Owned by those functions (Section B); ship with the function scripts.

| Schema | Sequences |
|---|---|
| pm | `program_code_seq`, `project_code_seq`, `task_code_seq` |
| sc | `company_code_seq`, `customer_code_seq`, `grn_seq`, `partner_code_seq`, `purchase_order_seq`, `req_seq`, `scrap_number_seq`, `vendor_code_seq`, `vendor_return_number_seq` |

### D2. Default-backing → **DECLARE in the model via `HasSequence`** (7) — NOT excluded

Backed by column DEFAULTs on modeled EF tables; EF-created tables require them. Currently **0 `HasSequence`** in `SpaceLinxContext.cs` → **add these in Task 5** (or create in the baseline migration).

| Sequence | Column default it backs |
|---|---|
| `application.app_app_number_seq` | `application.app.app_number` |
| `application.role_role_number_seq` | `application.role.role_number` |
| `application.user_user_number_seq` | `application."user".user_number` |
| `mes.guide_sequence_seq` | `mes.guide.sequence` (+ `currval` → `guide.number`) |
| `mes.material_kit_sequence_seq` | `mes.material_kit.sequence` (+ `currval` → `material_kit.number`) |
| `mes.product_sequence_seq` | `mes.product.sequence` (+ `currval` → `product.number`) |
| `mes.work_package_sequence_seq` | `mes.work_package.sequence` (+ `currval` → `work_package.number`) |

---

## E. Extensions — `HasPostgresExtension`

**None.** Dump contains **0 `CREATE EXTENSION`**. `gen_random_uuid()` is PostgreSQL-core (≥13), so **no `HasPostgresExtension("pgcrypto")` or similar is needed.**

---

## F. Tables present in DB but intentionally NOT EF-managed (8)

Not in the model and must **not** be created/dropped by EF (they pre-exist; baseline ignores them). All have **zero FK edges in or out**, so omitting them is safe. See `reconciliation-report.md` §1a.

| Schema.table | Reason |
|---|---|
| `mes.temp_parttype_import` | staging/import scratch (no PK) |
| `sc.temp_inventory_import` | staging/import scratch (no PK) |
| `sc.temp_tracking` | staging/import scratch (no PK) |
| `mes.part_duplicate_analysis` | analysis/report scratch (no PK) |
| `application.employee_department` | denormalized helper/import (no PK) |
| `sc.po_requisition_mapping` | denormalized mapping helper (no PK) |
| `sc.item` | orphan domain-shaped table, **no PK**, likely superseded by `mes.part` — confirm dead, drop later |
| `common.fcm_token` | **real PK'd + audited domain table** (FCM push tokens) — decide: add entity or formally mark legacy/out-of-scope |

---

## G. Schemas

EF baseline must `EnsureSchema` for the 5 application schemas: `application`, `common`, `mes`, `pm`, `sc`.
The **`audit`** schema is **absent in UAT** — N/A, nothing to exclude or create.

---

## Summary

| Category | EF must NOT own | EF SHOULD own |
|---|---:|---|
| Views | 23 (`.ToView`) | — |
| Functions | 20 | — |
| Triggers | 2 | — |
| Sequences | 12 (function-owned) | 7 (default-backing → `HasSequence`) |
| Extensions | n/a | none required |
| Tables | 8 (unmanaged pre-existing) | 106 (modeled) |
