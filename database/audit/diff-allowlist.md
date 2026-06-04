# Baseline-vs-UAT Diff Classification (Task 8)

Each delta from `baseline-vs-uat.diff` classified as:
- **STRUCTURAL** — a real schema difference that must be fixed in the EF model (BLOCKS).
- **COSMETIC** — formatting / ordering / owner-grant / naming-convention / storage-param / equivalent representation (acceptable).
- **EXPECTED** — one of the 7 intentionally-excluded tables (or objects that depend only on them).

Verdict: **MATCH** (Task 9, 2026-06-03). All 5 STRUCTURAL delta groups (S1–S5) have been
fixed in the EF model and re-validated against the local container; only the allow-listed
COSMETIC/EXPECTED items plus the intentional, documented S3 FKs + document.file_* NOT-NULL
relaxations remain (the latter captured in
`database/migrations/PLANNED_AddIntegrityConstraints.md`). The original DRIFT classification
is retained below for history. See `baseline-vs-uat.diff` for the updated MATCH verdict.

---

## EXPECTED (acceptable — intentional exclusions)

| Object | Why expected |
|---|---|
| `application.employee_department` | allow-listed excluded table |
| `mes.part_duplicate_analysis` | allow-listed excluded table |
| `mes.temp_parttype_import` | allow-listed excluded table (temp import) |
| `sc.item` | allow-listed excluded table |
| `sc.po_requisition_mapping` | allow-listed excluded table |
| `sc.temp_inventory_import` | allow-listed excluded table (temp import) |
| `sc.temp_tracking` | allow-listed excluded table (temp) |
| UNIQUE `application.employee_department (employee_id)` | unique key on an excluded table |
| any PK/index on the above | dependent on excluded tables |

`common.fcm_token` is present in BOTH dumps — requirement satisfied.

---

## COSMETIC (acceptable)

| Delta | Justification |
|---|---|
| PK names `PK_<table>` (baseline) vs `<table>_pkey` (UAT) | EF naming convention; same columns, same semantics. |
| Index names `IX_*`/EF-generated vs UAT `idx_*` | naming only; predicate+columns are what matter. |
| UNIQUE enforced as UNIQUE INDEX (baseline) vs UNIQUE CONSTRAINT (UAT) | functionally equivalent uniqueness enforcement; all 51+2 UAT unique keys present. |
| 287 baseline CREATE INDEX vs 77 UAT | EF auto-creates a btree index per FK; purely ADDITIVE perf indexes, no semantic loss. |
| 4 UAT indexes carry `WITH (fillfactor='100', deduplicate_items='true')`; baseline omits | storage/perf tuning params; do not change index shape or correctness. |
| `application."user"` (quoted) vs `application.user` | reserved-word quoting in pg_dump vs pg_indexes; same object. |
| `common.fcm_token.id` NOT NULL in baseline, nullable in UAT | `id` is NOT part of the PK (PK = email,device_id) in either; baseline merely declares an explicit NOT NULL default on a `gen_random_uuid()` column. Low-risk, no data-shape change. |
| statement ordering / formatting / owner / grant differences | `--no-owner --no-privileges` already strips ownership/grants; remaining order/format diffs are noise. |

---

## STRUCTURAL (real — must fix in the model; BLOCKS)

### S1. [CRITICAL] 12 standalone sequences missing
Missing: `pm.program_code_seq, pm.project_code_seq, pm.task_code_seq, sc.company_code_seq,
sc.customer_code_seq, sc.grn_seq, sc.partner_code_seq, sc.purchase_order_seq, sc.req_seq,
sc.scrap_number_seq, sc.vendor_code_seq, sc.vendor_return_number_seq`.
The `generate_*` functions embedded in the migration call `nextval()` on these. PROVEN failing:
`SELECT sc.generate_company_code()` -> `ERROR: relation "sc.company_code_seq" does not exist`.
FIX: add these 12 `CREATE SEQUENCE` statements to the Baseline migration (or to the procedures
manifest, created before the functions that use them).

### S2. 43 CHECK constraints missing (0 present in baseline)
e.g. `chk_purchase_order_status`, `part_status_check`, `part_version_check`,
`chk_document_storage_type`, `chk_manufacturer_details_required`, plus 38 more (full list in
`baseline-vs-uat.diff` §6). FIX: model these as `ToTable(t => t.HasCheckConstraint(...))` (or
raw SQL in the migration) so the data-integrity rules match UAT.

### S3. 5 extra FKs in baseline not in UAT
`mes.work_order.manager_id`, `mes.work_order.technician_id`, `mes.work_package.manager_id`,
`mes.work_package.technician_id` -> `application."user"(id)`; and
`sc.goods_receipt_note.vendor_reference_id` -> `common.document(id)`.
Baseline is STRICTER than UAT. FIX: decide policy — either remove these FK definitions from the
model to match UAT exactly, OR consciously accept them as an intended tightening (must be an
explicit, documented decision, not silent drift).

### S4. Column nullability / default drift
- `mes.part.part_number_suffix`: UAT NOT NULL -> baseline NULLABLE. FIX: make required.
- `mes.part.part_number` (GENERATED STORED): UAT NOT NULL -> baseline NULLABLE. FIX: add NOT NULL.
- `mes.part.weight`: UAT `DEFAULT 0 NOT NULL` -> baseline NOT NULL (no default). FIX: add `HasDefaultValue(0)`.
- `common.document.file_name` / `file_path` / `file_size`: UAT NULLABLE -> baseline NOT NULL.
  Baseline is STRICTER (would reject rows UAT accepts). FIX: make these optional to match UAT.

### S5. 17 partial indexes missing (non-unique / performance)
All filtered indexes, mostly `WHERE (deleted_at IS NULL)` plus one `WHERE (is_preferred = true)`;
full list in `baseline-vs-uat.diff` §5. For 3 `department_id` cases baseline has a plain (non-partial)
index but lacks the predicate. None are UNIQUE, so this is a performance gap, not a correctness gap —
but it IS real drift from UAT. FIX: add `HasFilter("deleted_at IS NULL")` (and the is_preferred filter)
to the corresponding `HasIndex(...)` calls.

---

## Summary
- TABLE set: MATCH (only 7 allow-listed exclusions; fcm_token in both).
- UNIQUE / GENERATED-expression / VIEW / generate_* function-name sets: MATCH.
- PARTIAL indexes: DRIFT (17 missing) — the #1 suspected drift, CONFIRMED.
- CHECK constraints: DRIFT (43 missing).
- Sequences: DRIFT (12 missing) — runtime-breaking for generate_* functions.
- FKs: DRIFT (5 extra in baseline).
- Column nullability/defaults: DRIFT (7 columns across mes.part + common.document).

Overall: **DRIFT** — 5 STRUCTURAL groups (S1–S5) block declaring the Baseline authoritative.
