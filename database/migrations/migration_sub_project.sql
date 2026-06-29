-- Migration: Add pm.sub_project table + sc.stock_movement.sub_project_id
-- Date: 2026-06-29
-- Sub-project (child of pm.project) recorded on stock movements for finer
-- consumption/issue tracking. pm.sub_project mirrors pm.project's fields plus a
-- required parent project_id (ON DELETE CASCADE). The stock_movement reference
-- is nullable (ON DELETE SET NULL). Idempotent — safe to re-run.
-- NOTE: the EF migration (SpaceLinx.Model/Migrations/*_AddSubProject) is the
-- authoritative deploy artifact; this script mirrors it for the legacy path.

CREATE TABLE IF NOT EXISTS pm.sub_project (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_project_code varchar(255) NOT NULL DEFAULT pm.generate_project_code(),
    name varchar(255) NOT NULL,
    description text,
    project_id uuid NOT NULL,
    program_id uuid,
    project_manager_id uuid,
    start_date timestamptz,
    end_date timestamptz,
    status varchar(255),
    budget numeric(18,4),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(255) NOT NULL,
    updated_at timestamptz,
    updated_by varchar(255),
    deleted_at timestamptz,
    deleted_by varchar(255),
    CONSTRAINT sub_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE CASCADE,
    CONSTRAINT sub_project_program_id_fkey FOREIGN KEY (program_id) REFERENCES pm.program(id) ON DELETE SET NULL,
    CONSTRAINT sub_project_project_manager_id_fkey FOREIGN KEY (project_manager_id) REFERENCES application."user"(id) ON DELETE SET NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='stock_movement' AND column_name='sub_project_id') THEN
        ALTER TABLE sc.stock_movement ADD COLUMN sub_project_id uuid;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='stock_movement_sub_project_id_fkey') THEN
        ALTER TABLE sc.stock_movement
            ADD CONSTRAINT stock_movement_sub_project_id_fkey FOREIGN KEY (sub_project_id) REFERENCES pm.sub_project(id) ON DELETE SET NULL;
    END IF;
END
$$;
