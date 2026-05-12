-- Migration: Establish Department <-> User <-> PurchaseOrder <-> Requisition relationship model
-- Work Item: 2401
-- Date: 2026-05-11
-- Description:
--   1. Extend common.department with parent_department_id, head_of_department_user_id, unique code index
--   2. Add department_id FK to application.user (keep legacy free-text department column for one release)
--   3. Add department_id FK to sc.purchase_order
--   4. Add department_id FK to sc.requisition
--   5. Backfill application.user.department_id from legacy text column where a case-insensitive name match exists
--
-- All changes are additive and idempotent (IF NOT EXISTS guards) so the script is safe to re-run
-- and so existing rows with no department continue to load.

DO $$
BEGIN
    -- =========================================================================
    -- 1. common.department: hierarchy + head of department
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='common' AND table_name='department' AND column_name='parent_department_id') THEN
        ALTER TABLE common.department ADD COLUMN parent_department_id UUID;
        ALTER TABLE common.department
            ADD CONSTRAINT fk_department_parent
            FOREIGN KEY (parent_department_id) REFERENCES common.department(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='common' AND table_name='department' AND column_name='head_of_department_user_id') THEN
        ALTER TABLE common.department ADD COLUMN head_of_department_user_id UUID;
        ALTER TABLE common.department
            ADD CONSTRAINT fk_department_head
            FOREIGN KEY (head_of_department_user_id) REFERENCES application."user"(id) ON DELETE SET NULL;
    END IF;

    -- =========================================================================
    -- 2. application.user: department_id FK (legacy free-text 'department' column, if present, is left in place)
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='application' AND table_name='user' AND column_name='department_id') THEN
        ALTER TABLE application."user" ADD COLUMN department_id UUID;
        ALTER TABLE application."user"
            ADD CONSTRAINT fk_user_department
            FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;
    END IF;

    -- =========================================================================
    -- 3. sc.purchase_order: department_id FK
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='sc' AND table_name='purchase_order' AND column_name='department_id') THEN
        ALTER TABLE sc.purchase_order ADD COLUMN department_id UUID;
        ALTER TABLE sc.purchase_order
            ADD CONSTRAINT fk_purchase_order_department
            FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;
    END IF;

    -- =========================================================================
    -- 4. sc.requisition: department_id FK
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='sc' AND table_name='requisition' AND column_name='department_id') THEN
        ALTER TABLE sc.requisition ADD COLUMN department_id UUID;
        ALTER TABLE sc.requisition
            ADD CONSTRAINT fk_requisition_department
            FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- =========================================================================
-- 5. Unique active department code (partial index — only active rows)
-- =========================================================================
CREATE UNIQUE INDEX IF NOT EXISTS ux_department_code_active
    ON common.department (code)
    WHERE deleted_at IS NULL;

-- =========================================================================
-- 6. Lookup indexes for the new department_id columns
-- =========================================================================
CREATE INDEX IF NOT EXISTS ix_user_department_id
    ON application."user" (department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_purchase_order_department_id
    ON sc.purchase_order (department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_requisition_department_id
    ON sc.requisition (department_id) WHERE deleted_at IS NULL;

-- =========================================================================
-- 7. Backfill application.user.department_id from legacy text column.
--    Only runs if the legacy 'department' column actually exists (it is in the
--    EF model but may or may not exist in the live schema due to drift).
-- =========================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='application' AND table_name='user' AND column_name='department') THEN
        EXECUTE $sql$
            UPDATE application."user" u
               SET department_id = d.id
              FROM common.department d
             WHERE u.department_id IS NULL
               AND u.department IS NOT NULL
               AND u.department <> ''
               AND d.deleted_at IS NULL
               AND LOWER(TRIM(d.name)) = LOWER(TRIM(u.department))
        $sql$;
    END IF;
END
$$;
