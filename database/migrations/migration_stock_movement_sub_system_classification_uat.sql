-- UAT migration: Add sub_system, classification and platform_payload_sdr to sc.stock_movement
-- Date: 2026-07-16
-- One-time manual run against UAT. Plain ALTER TABLE statements (no idempotent guard) --
-- do not re-run once applied. For the idempotent, safe-to-re-run version applied by the
-- pipeline (Dev -> UAT -> Prod), see migration_stock_movement_sub_system_classification.sql.
--
-- Columns:
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
-- Mirrors EF migration 20260716091117_AddSubSystemClassificationToStockMovement.

ALTER TABLE sc.stock_movement ADD COLUMN sub_system VARCHAR(100);
ALTER TABLE sc.stock_movement ADD COLUMN classification VARCHAR(50);
ALTER TABLE sc.stock_movement ADD COLUMN platform_payload_sdr VARCHAR(100);