# PLANNED — Add Integrity Constraints (future forward migration)

Status: **SPEC ONLY — not yet implemented.** Do NOT create this migration as part of the
Baseline reconciliation work. This document records the integrity constraints that the EF
model would *like* to enforce but which the live UAT schema does **not** currently have, so
that the Baseline migration can faithfully mirror UAT (per the "baseline mirrors UAT" decision).

When the team is ready to tighten the schema forward (after data clean-up in UAT/Prod), turn
each item below into a single forward migration (e.g. `AddIntegrityConstraints`).

Date recorded: 2026-06-03
Branch: feature/code-first-migrations
Source of truth for "current" state: `database/audit/uat.schema.sql`

---

## A. Foreign keys present in the EF model but intentionally NOT created in the Baseline (S3)

These five relationships are discovered by EF convention from navigation properties on the
entity classes. The navigations (`Manager`, `Technician`, `VendorReference`) are **kept** in the
model so application `.Include(...)` queries keep working; only the **database FK constraint** is
omitted from the Baseline migration (the `table.ForeignKey(...)` blocks were removed from
`Migrations/20260603164745_Baseline.cs`). The model snapshot still records the relationships, so
the model round-trips (probe-empty stays green).

UAT does not have these FKs, so the Baseline now matches UAT. A future migration may add them
once orphan rows are reconciled:

| # | Table | Column | References | Suggested FK name | On delete |
|---|-------|--------|------------|-------------------|-----------|
| 1 | `mes.work_order` | `manager_id` | `application."user"(id)` | `work_order_manager_id_fkey` | SET NULL |
| 2 | `mes.work_order` | `technician_id` | `application."user"(id)` | `work_order_technician_id_fkey` | SET NULL |
| 3 | `mes.work_package` | `manager_id` | `application."user"(id)` | `work_package_manager_id_fkey` | SET NULL |
| 4 | `mes.work_package` | `technician_id` | `application."user"(id)` | `work_package_technician_id_fkey` | SET NULL |
| 5 | `sc.goods_receipt_note` | `vendor_reference_id` | `common.document(id)` | `goods_receipt_note_vendor_reference_id_fkey` | SET NULL |

Note: `mes.work_order_step.manager_id`/`technician_id` FKs are NOT in this list — they exist in
both UAT and the Baseline and must stay.

Forward-migration sketch (run only after verifying no orphan rows exist):

```sql
ALTER TABLE mes.work_order
    ADD CONSTRAINT work_order_manager_id_fkey
    FOREIGN KEY (manager_id) REFERENCES application."user"(id) ON DELETE SET NULL,
    ADD CONSTRAINT work_order_technician_id_fkey
    FOREIGN KEY (technician_id) REFERENCES application."user"(id) ON DELETE SET NULL;

ALTER TABLE mes.work_package
    ADD CONSTRAINT work_package_manager_id_fkey
    FOREIGN KEY (manager_id) REFERENCES application."user"(id) ON DELETE SET NULL,
    ADD CONSTRAINT work_package_technician_id_fkey
    FOREIGN KEY (technician_id) REFERENCES application."user"(id) ON DELETE SET NULL;

ALTER TABLE sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_vendor_reference_id_fkey
    FOREIGN KEY (vendor_reference_id) REFERENCES common.document(id) ON DELETE SET NULL;
```

Pre-flight orphan check (must all return 0 before applying):

```sql
SELECT count(*) FROM mes.work_order wo
  LEFT JOIN application."user" u ON u.id = wo.manager_id
  WHERE wo.manager_id IS NOT NULL AND u.id IS NULL;        -- repeat for technician_id
SELECT count(*) FROM mes.work_package wp
  LEFT JOIN application."user" u ON u.id = wp.manager_id
  WHERE wp.manager_id IS NOT NULL AND u.id IS NULL;        -- repeat for technician_id
SELECT count(*) FROM sc.goods_receipt_note g
  LEFT JOIN common.document d ON d.id = g.vendor_reference_id
  WHERE g.vendor_reference_id IS NOT NULL AND d.id IS NULL;
```

---

## B. NOT NULL tightenings relaxed in the Baseline to match UAT (S4)

The EF model was stricter than UAT on `common.document`. To mirror UAT, these columns were made
**nullable** in the model (`Document.FileName`/`FilePath` → `string?`, `Document.FileSize` →
`long?`; configured via `.IsRequired(false)` in `SpaceLinxContext.Audit.cs`). UAT has them
nullable. A future migration may re-tighten them to NOT NULL once existing NULL rows are
back-filled:

| Table | Column | Current (UAT & Baseline) | Desired future |
|-------|--------|--------------------------|----------------|
| `common.document` | `file_name` | NULLABLE | NOT NULL |
| `common.document` | `file_path` | NULLABLE | NOT NULL |
| `common.document` | `file_size` | NULLABLE | NOT NULL |

Forward-migration sketch (after back-fill):

```sql
-- back-fill NULLs first, e.g.:
-- UPDATE common.document SET file_name = '' WHERE file_name IS NULL;  -- etc.
ALTER TABLE common.document
    ALTER COLUMN file_name SET NOT NULL,
    ALTER COLUMN file_path SET NOT NULL,
    ALTER COLUMN file_size SET NOT NULL;
```

Note: the `mes.part` S4 items (`part_number_suffix`/`part_number` → NOT NULL, `weight` →
DEFAULT 0) were tightenings that *match* UAT and are already enforced in the Baseline; they are
NOT deferred and are not listed here.
