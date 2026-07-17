-- Migration: Add sub_system, classification and platform_payload_sdr to sc.stock_movement
-- Date: 2026-07-16
-- Adds three nullable columns to the stock movement header, populated by the
-- Create/Edit Stock Movement (Issue) dialog:
--   sub_system            : VARCHAR(100), nullable. Replaces the old "Sub Project" field with a
--                            fixed category list (Payload / ADCS / Propulsion / Structures /
--                            Solar panels / SDR / RF COMMS / GNSS / GPS / Avionics Stack / EPS
--                            Stack), stored as free text like the existing `department` column.
--   classification         : VARCHAR(50), nullable. One of Payload / SDR / Platform.
--   platform_payload_sdr   : VARCHAR(100), nullable. Cascading option depending on
--                            `classification` (e.g. VISLINX-M, XDSAT-M200, SDR Development).
--                            Values are only unique in combination with `classification`
--                            (e.g. "VISLINX-M" exists under both Payload and Platform).
--
-- The legacy sub_project_id FK column is left untouched; it is no longer written by the
-- frontend but existing data is preserved.
--
-- Mirrors EF migration 20260716091117_AddSubSystemClassificationToStockMovement,
-- which is what the pipeline actually applies (see database/migrations/README.md).
-- Keep in sync. Idempotent -- safe to re-run.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='stock_movement' AND column_name='sub_system') THEN
        ALTER TABLE sc.stock_movement ADD COLUMN sub_system VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='stock_movement' AND column_name='classification') THEN
        ALTER TABLE sc.stock_movement ADD COLUMN classification VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='stock_movement' AND column_name='platform_payload_sdr') THEN
        ALTER TABLE sc.stock_movement ADD COLUMN platform_payload_sdr VARCHAR(100);
    END IF;
END
$$;