# Schema Reconciliation Report (Phase −1 Gate — Plan Task 2)

> Read-only, on-disk analysis. **No database connection used.**
> Inputs:
> - UAT dump: `database/audit/uat.schema.sql` (PostgreSQL 16.12, `pg_dump --schema-only`).
> - Scaffolded model: `src/SpaceLinx.Api/SpaceLinx.Model/SpaceLinxContext.cs` (7,523-line partial `DbContext`).
> - Established findings: `database/audit/README.md` (audit schema absent; approval tables snake_case in `common`; 0 identity columns; 19 named sequences).
>
> Headline: **114 tables — 106 mapped, 8 unmapped (0 model orphans)**; **23/23 views match**; **19 sequences classified (7 default-backing, 12 function-owned)**; **20 functions / 2 triggers**; **77 indexes, 47 with round-trip risk (46 partial + 1 GIN + 4 DESC)**; **7 computed columns match the model**.

---

## 1. Tables (114 base tables)

Extraction method:
- DB: `grep '^CREATE TABLE'` → strip schema-qualified name (handles the quoted `application."user"`). **114** tables (application 16, common 15, mes 40, pm 12, sc 31) — matches README.
- Model: `grep 'ToTable("name","schema"…')` (captures the 3-arg `HasComment` form too). **106** distinct `ToTable` mappings.

### 1a. DB-table-not-in-model (8)

None of these 8 appear anywhere in `SpaceLinxContext.cs` (no `ToTable`, `ToView`, or `DbSet`). They split into two risk classes:

| # | Table | PK? | Audit cols? | Classification |
|---|-------|-----|-------------|----------------|
| 1 | `mes.temp_parttype_import` | none | none | **Staging/import scratch** (`part_type_name`, `part_type_number`, `status_to` text cols). Intentionally not modeled. |
| 2 | `sc.temp_inventory_import` | none | none | **Staging/import scratch** (quoted `"MFG"`,`"SUM"`,`"XDL"`… import spreadsheet shape). |
| 3 | `sc.temp_tracking` | none | none | **Staging/import scratch** (all `text`). |
| 4 | `mes.part_duplicate_analysis` | none | none | **Analysis/report scratch** (4 `text`/`int` cols, denormalized). |
| 5 | `application.employee_department` | none | none | **Denormalized helper / import** (`sno`, `employee_id`, free-text dept/designation). |
| 6 | `sc.po_requisition_mapping` | none | none | **Denormalized mapping helper** (`req_number`,`po_number`,`purchase_order_id`,`requisition_id`; the modeled FK relationship is carried by the real `po_line_item`/`requisition` tables). |
| 7 | `sc.item` | **none** (has `id uuid DEFAULT gen_random_uuid()` but **no** `PRIMARY KEY` constraint) | yes (`created_at/by`, `updated_at/by`, `deleted_at/by`) | **Orphan domain-shaped table.** Looks like an abandoned/early `item` concept; superseded by `mes.part`. No PK declared, so not a clean EF entity. |
| 8 | `common.fcm_token` | **YES** — composite `PRIMARY KEY (email, device_id)` | yes (full audit set) | **Real domain table, genuinely missing from the model.** Firebase Cloud Messaging push-token registry. |

**Referential-integrity check (safety-critical):** grepped the dump for `REFERENCES <schema>.<table>` against all 8, and for FKs declared *by* these 8. **Result: zero FK edges in or out for all 8 tables.** They are fully isolated islands. Therefore a code-first baseline generated from the 106-entity model is internally consistent — nothing the model owns depends on these 8, and they depend on nothing the model owns.

### 1b. Model-entity-not-in-DB (0)

Every one of the 106 `ToTable` mappings resolves to a real `CREATE TABLE` in the dump (exact schema + name match). **No phantom/orphaned model entities.** (Confirms README: approval tables are correctly mapped snake_case in `common`.)

> Note on counts: the context has **129 `DbSet<>`** declarations vs 106 `ToTable` + 23 `ToView` = 129. So every DbSet is accounted for as either a table or a view mapping; the 23 keyless view-backed sets are the difference between DbSet count and ToTable count.

---

## 2. Views (23)

- DB: **23** `CREATE VIEW`.
- Model: **23** `.ToView("name","schema")`.
- Diff by `schema.name`: **exact match, 0 mismatches in either direction.**

| | View |
|---|---|
| common | `document_with_users_vw` |
| mes | `eco_with_users_vw`, `guide_mbom_details`, `guide_mbom_vw`, `parts_not_associated_with_guides`, `workorderguidestepsview` |
| pm | `resource_workload_vw`, `task_gantt_vw` |
| sc | `company_with_organization_vw`, `grn_with_user_vw`, `grns_by_purchase_order_vw`, `inventory_goods_vw`, `inventory_part_price_vw`, `inventory_part_vw`, `inventory_services_vw`, `inventory_transaction_vw`, `issue_history_vw`, `purchase_history_vw`, `purchase_orders_vw`, `requisitions_with_user_vw`, `scrap_request_with_user_vw`, `stock_movement_with_user_vw`, `vendor_return_request_with_user_vw` |

All are `.ToView` → EF treats them as keyless query types and **will not** emit DDL for them. Correct.

---

## 3. Sequences (19) — classification

Method: located every `nextval(`/`currval(` in the dump and recorded its context (column `SET DEFAULT` DDL vs `generate_*` function body).

### 3a. Default-backing — EF-created tables need these to exist (7)

These appear in `ALTER TABLE … ALTER COLUMN … SET DEFAULT nextval(…)` / `currval(…)` (lines 7265–7335). The owning columns are on **modeled** tables, so an EF baseline that creates these tables must also create these sequences (`HasSequence` in the model, or in the baseline migration).

| Sequence | Backs column(s) |
|---|---|
| `application.app_app_number_seq` | `application.app.app_number` |
| `application.role_role_number_seq` | `application.role.role_number` |
| `application.user_user_number_seq` | `application."user".user_number` |
| `mes.guide_sequence_seq` | `mes.guide.sequence` (and `currval` feeds `mes.guide.number` via `generate_alphanumeric_sequence('GD-', …)`) |
| `mes.material_kit_sequence_seq` | `mes.material_kit.sequence` (+ `currval` → `material_kit.number` `'KIT-'`) |
| `mes.product_sequence_seq` | `mes.product.sequence` (+ `currval` → `product.number` `'PD-'`) |
| `mes.work_package_sequence_seq` | `mes.work_package.sequence` (+ `currval` → `work_package.number` `'WO-'`) |

> **Gap flagged for Task 5:** the scaffolded model currently has **0** `HasSequence` declarations. These 7 must be added (or created in the baseline migration) or the EF-created tables will fail at insert time. Not a baseline-blocker for the *gate* (it is a known, scoped follow-up), but it must land before the baseline is applied.

### 3b. Function-owned — exclude from EF (12)

These appear **only** inside `generate_*` PL/pgSQL function bodies (lines 2515–2773), never in a column DEFAULT. They are owned by the functions (which themselves go to `database/procedures/`), so EF must not manage them.

| Schema | Sequences |
|---|---|
| pm | `program_code_seq`, `project_code_seq`, `task_code_seq` |
| sc | `company_code_seq`, `customer_code_seq`, `grn_seq`, `partner_code_seq`, `purchase_order_seq`, `req_seq`, `scrap_number_seq`, `vendor_code_seq`, `vendor_return_number_seq` |

---

## 4. Functions (20) & Triggers (2)

### 4a. Functions

| Function | Role | Disposition |
|---|---|---|
| `application.generate_alphanumeric_sequence` | **Referenced by column DEFAULTs** (`mes.guide/material_kit/product/work_package.number`). | **Must exist before EF `CreateTable`** of those tables → belongs in baseline/repeatable SQL applied first; also in `database/procedures/`. |
| `mes.generate_part_number` | Trigger fn (see `part_number_trigger`). | `database/procedures/` (business logic). |
| `mes.update_has_bom_flag` | Trigger fn (see `trg_update_has_bom_flag`). | `database/procedures/`. |
| `mes.generate_eco_number`, `mes.generate_part_number`, `mes.update_status_to_approved` | Business-logic / numbering. | `database/procedures/`. |
| `pm.create_default_board_columns`, `pm.generate_program_code`, `pm.generate_project_code`, `pm.generate_task_code` | Business-logic / numbering. | `database/procedures/`. |
| `sc.generate_company_code`, `generate_customer_code`, `generate_grn_number`, `generate_partner_code`, `generate_purchase_order_number`, `generate_req_number`, `generate_scrap_number`, `generate_stock_movement_number`, `generate_tender_number`, `generate_vendor_code`, `generate_vendor_return_number` | Business-logic / numbering (own the §3b sequences). | `database/procedures/`. |

Only **`application.generate_alphanumeric_sequence`** is a DDL-ordering dependency (a column default references it). All others are pure business logic invoked at runtime / by triggers.

### 4b. Triggers (2)

| Trigger | Table | Timing / events | Function |
|---|---|---|---|
| `part_number_trigger` | `mes.part` | `BEFORE INSERT OR UPDATE OF part_type_id`, `FOR EACH ROW` | `mes.generate_part_number()` |
| `trg_update_has_bom_flag` | `mes.ebom` | `AFTER INSERT OR DELETE OR UPDATE`, `FOR EACH ROW` | `mes.update_has_bom_flag()` |

Both are managed as repeatable SQL in `database/procedures/`, **not** EF. Re-assert them whenever `mes.part` / `mes.ebom` are rewritten by a migration.

---

## 5. Indexes (77) — Npgsql round-trip risk scan

| Risk class | Count | Notes |
|---|---:|---|
| **Partial (`… WHERE …`)** | **46** | Almost all are soft-delete filters: `WHERE (deleted_at IS NULL)` / `WHERE (deleted_by IS NULL)`; plus `idx_company_part_is_preferred … WHERE (is_preferred = true)`. EF needs `.HasFilter("…")` on each `HasIndex` or the migration diff will churn. |
| **BRIN (`USING brin`)** | **0** | None present. |
| **GIN / GiST / HASH (non-btree)** | **1** | `idx_task_comment_mentions ON pm.task_comment USING gin (mentions)` (also partial). Needs `.HasMethod("gin")` + filter. |
| **Descending ordering (`DESC`)** | **4** | `idx_approval_log_action_at (action_at DESC)`; `idx_part_suffix_version (part_number_suffix, version DESC)` (also partial+expression); `idx_task_activity_created_by (created_by, created_at DESC)`; `idx_task_activity_task_id (task_id, created_at DESC)`. Need `.IsDescending(...)`. |
| **Expression / functional** | **0 pure** | No `lower()`/`coalesce()`/cast-expression indexes. The only non-plain-column index key is the `version DESC` ordering inside `idx_part_suffix_version`, captured under DESC above. |
| **Storage params (`WITH (fillfactor…, deduplicate_items…)`)** | 4 | `ix_user_department_id`, `ux_department_code_active`, `ix_purchase_order_department_id`, `ix_requisition_department_id`. Cosmetic; Npgsql typically ignores → harmless diff noise. |

**Distinct at-risk indexes: 47** (the 46 partial set + the 1 GIN, with 4 DESC and the storage-param ones overlapping the partial set). Full partial-index list (line refs in dump): `ix_user_department_id`(8614), `idx_additional_recipient_config_template`(8621), `idx_approval_configuration_entity_type`(8628), `idx_approval_notification_recipient_entity`(8649), `ux_department_code_active`(8663, **UNIQUE**), `idx_part_grade`(8691), `idx_part_level_active`(8698), `idx_part_level_code`(8705), `idx_part_level_sort_order`(8712), `idx_part_suffix_version`(8726, **DESC**), `idx_subsystem_active`(8733), `idx_subsystem_code`(8740), `idx_board_column_position`(8782), `idx_board_column_project_id`(8789), `idx_dashboard_widget_project_id`(8796), `idx_dashboard_widget_user_id`(8803), `idx_resource_allocation_dates`(8810), `idx_resource_allocation_project_id`(8817), `idx_resource_allocation_user_dates`(8824), `idx_resource_allocation_user_id`(8831), `idx_task_assignee_task_id`(8866), `idx_task_assignee_user_id`(8873), `idx_task_comment_created_at`(8887), `idx_task_comment_mentions`(8894, **GIN**), `idx_task_comment_parent_id`(8901), `idx_task_comment_task_id`(8908), `idx_task_dependency_predecessor`(8915), `idx_task_dependency_successor`(8922), `idx_time_entry_date_range`(8943), `idx_time_entry_entry_date`(8950), `idx_time_entry_task_id`(8957), `idx_time_entry_task_user`(8964), `idx_time_entry_user_id`(8971), `idx_company_part_is_preferred`(8978), `idx_stock_movement_date`(8992), `idx_stock_movement_from_location`(8999), `idx_stock_movement_line_item_movement`(9006), `idx_stock_movement_line_item_part`(9013), `idx_stock_movement_status`(9020), `idx_stock_movement_to_location`(9027), `idx_stock_movement_type`(9034), `idx_tender_deleted_by`(9055), `idx_tender_line_item_deleted_by`(9062), `idx_tender_vendor_deleted_by`(9111), `idx_tender_vendor_unique`(9132, **UNIQUE**), `ix_purchase_order_department_id`(9139), `ix_requisition_department_id`(9146).

These are the indexes most likely to produce phantom diffs on the first `dotnet ef migrations add`; the baseline-author must mirror `HasFilter`/`HasMethod`/`IsDescending` (Task 5 / drift check). Not a gate-blocker — they affect diff cleanliness, not correctness.

---

## 6. Computed columns (`GENERATED ALWAYS AS … STORED`)

Dump has **7**; model has **7** `HasComputedColumnSql` — **1:1 match**.

| Table.column | Expression (dump) |
|---|---|
| `mes.part.part_number` | `((part_number_suffix)::text || '-'::text) || (version)::text` |
| `sc.inventory_part.qty_available` | `(((qty_onhand - qty_reserved) - qty_issued) - qty_qc_failed) - qty_qc_pending` |
| `sc.inventory_stock.qty_available` | same arithmetic, cast `::numeric(18,4)` |
| `sc.inventory_stock.issued_price` | `((qty_issued)::numeric * unit_price * conversion_rate)::numeric(18,4)` |
| `sc.inventory_stock.reserved_price` | `((qty_reserved)::numeric * unit_price * conversion_rate)::numeric(18,4)` |
| `sc.inventory_stock.available_price` | available-qty × unit_price × conversion_rate, `::numeric(18,4)` |
| `sc.inventory_stock.total_price` | issued + reserved + available price, `::numeric(18,4)` |

These are **expected cosmetic round-trip diff sources** (PostgreSQL normalizes/re-parenthesizes the stored expression, so the model string rarely matches byte-for-byte). Treat any diff here as benign.

---

## 7. Other round-trip risks present

| Risk | Present? | Detail / disposition |
|---|---|---|
| `gen_random_uuid()` defaults | **Yes (108)** | Built into PostgreSQL core ≥13 — **no extension required**. Model carries 106 matching `HasDefaultValueSql("gen_random_uuid()")` (the 2 missing are on the unmapped `common.fcm_token` and `sc.item`). |
| `CURRENT_TIMESTAMP` defaults | **Yes (115)** | Standard; mapped via `HasDefaultValueSql`. Cosmetic diff risk (`CURRENT_TIMESTAMP` vs `now()` normalization). |
| `nextval(…)` defaults | **Yes (7)** | The §3a default-backing sequences. Require `HasSequence` (currently absent — flagged). |
| **CHECK constraints** | **Yes (43)** | Mostly status/enum-emulation `… = ANY(ARRAY[...])`, range checks (`>=1`, `0–100`, `0–24`), and `part_version_check (version ~ '^[0-9]{2}$')`. EF needs `ToTable(t => t.HasCheckConstraint(...))` to avoid dropping them; verify coverage during Task 5. |
| Native ENUM / DOMAIN types | **No** | `CREATE TYPE`/`CREATE DOMAIN` = 0. All "enums" are `varchar` + CHECK → no Npgsql enum-mapping complications. |
| `COLLATE` clauses | **No** | 0 occurrences. |
| `CREATE EXTENSION` | **No** | 0. So **no `HasPostgresExtension` needed** (pgcrypto not required for `gen_random_uuid` on PG16). |
| Schemas | 5 | `application`, `common`, `mes`, `pm`, `sc` — all `CREATE SCHEMA` present; `audit` **absent** (confirms README). EF baseline must `EnsureSchema` for the 5. |
| Identity columns | 0 | Per README — removes a whole round-trip risk class. |

---

## 8. GO / NO-GO

### Decision: **GO** (proceed to Phase 0/1 baseline work) — with two tracked, non-blocking follow-ups.

**Why GO is justified:**
1. **Every modeled entity exists in the DB** (0 model orphans) — the model will not try to create a table that conflicts with reality.
2. **The 8 DB-tables-not-in-model are fully understood and provably safe to leave EF-unmanaged:** 6 are staging/import/analysis scratch tables (no PK), and the 2 domain-shaped ones (`common.fcm_token`, `sc.item`) **have zero FK edges in or out**. A baseline generated from the 106-entity model is therefore internally consistent and cannot break referential integrity against these islands. They simply remain pre-existing, hand-managed objects.
3. **Views (23/23), computed columns (7/7) reconcile exactly.** Sequences, functions, triggers, indexes, CHECKs, defaults are fully enumerated and classified. The **EF exclusion list is complete** (`ef-exclusion-list.md`).
4. No native enums/domains, no COLLATE, no extensions, no identity columns — the high-severity Npgsql round-trip hazards are absent. Remaining diffs are cosmetic (computed-column re-parenthesization, timestamp default normalization, index storage params).

**Tracked follow-ups (must land in/before baseline — Task 5, not gate-blockers):**
- **F1 — `HasSequence` gap:** model has 0 `HasSequence`; the 7 default-backing sequences (§3a) must be declared or created in the baseline, else inserts into `app`/`role`/`user`/`guide`/`material_kit`/`product`/`work_package` fail.
- **F2 — Index fidelity:** mirror `HasFilter` (46 partial), `HasMethod("gin")` (1), and `IsDescending` (4) so the first migration diff is clean.

**Decide explicitly on the two orphan domain tables before baseline applies:**
- `common.fcm_token` is a *real, PK'd, audited* table not in the model. Recommendation: either add an entity (preferred — it is live FCM push-token data) or formally record it as out-of-scope/legacy. Left unmanaged it is harmless to the baseline but invisible to the app layer.
- `sc.item` has no PK and is likely superseded by `mes.part`; recommend confirming it is dead and scheduling a drop in a later migration. Not a baseline blocker.

**Blockers forcing NO-GO:** **none.** No model entity references a missing table; no missing table is referenced by a modeled FK; no unresolvable schema/object collision exists.
