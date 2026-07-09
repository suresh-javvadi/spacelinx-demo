DROP VIEW IF EXISTS sc.inventory_stock_ledger_vw CASCADE;

-- One signed row per non-deleted inventory transaction.
-- Carries the part join (1:1 via mes.part) and the signed on-hand delta.
-- NOTE: unit price is intentionally NOT joined here. sc.inventory_part has one
-- row per part PER location/bin, so joining it at the transaction grain would
-- multiply rows and inflate quantities. Price is applied once-per-part in
-- sc.inventory_stock_report(...) instead.
--
-- Sign rule (keyed on reference_type + transaction_type, verified against
-- GoodsReceiptNoteService.cs + StockMovementService.cs):
--   inward  = reference_type 'GRN', EXCEPT QC-failed             (+transacted_quantity)
--   outward = reference_type 'StockMovement' AND transaction_type
--             IN ('Issued','Consumed')                           (-transacted_quantity)
--   everything else contributes 0
--
-- QC-FAILED IS EXCLUDED FROM INWARD. Rejected goods are written as
-- transaction_type 'QC Failed' (GoodsReceiptNoteService.cs ~L330) but share
-- reference_type 'GRN' with real receipts, so we add AND transaction_type
-- <> 'QC Failed' to keep failed qty out of purchase.
--
-- WHY OUTWARD IS NARROWED TO Issued/Consumed. StockMovementService writes ONE
-- inventory_transaction per line item with reference_type 'StockMovement' and an
-- unsigned, always-positive transacted_quantity (~L539-551); transaction_type
-- carries the movement type. Matching reference_type alone would subtract all
-- five kinds, three of them wrongly:
--   * Transfer   -- source QtyOnhand -= q, destination += q (~L119/L149). Nets to
--                   0 at part grain, which is the grain this view reports at.
--   * Adjustment -- signed: += q or -= q per line-item AdjustmentType (~L183-190).
--                   Always subtracting reverses every stock increase.
--   * Reserved   -- only QtyReserved += q (~L282). Goods never left the store.
-- Only Issued and Consumed represent goods leaving, so only they are outward.
--
-- KNOWN, ACCEPTED: Issued THEN Consumed for the same goods subtracts twice.
-- consumption_qty is a "how much did the floor draw" figure and closing_qty is
-- NOT expected to reconcile to sc.inventory_stock.qty_onhand. Do not "fix" this
-- by dropping Issued without changing what the report is meant to answer.
--
-- Adjustment is deliberately left contributing 0 rather than guessed at. Its
-- direction is not recoverable from transaction_type; a signed rule would have to
-- derive it (e.g. current_quantity - previous_quantity) and belongs in its own
-- change with its own backfill story.
--
-- A GRN writes a 'Received' row TWICE for the same goods: once on creation
-- (Notes '... pending Quality Check' -> QtyQcPending) and again on QC acceptance
-- (-> QtyOnhand). reference_type ('PO'/'GRN') does NOT separate these -- a non-PO
-- pending row is also tagged 'GRN' -- so filtering reference_type = 'GRN'
-- double-counts non-PO receipts and drops PO-pending receipts. We instead
-- exclude the pending-QC creation row by its Notes marker at the view level, so
-- everything remaining is an accepted-into-stock movement or a consumption.
-- COUPLING: keep '%pending Quality Check%' in sync with the creation Notes in
-- GoodsReceiptNoteService.cs (~L215).
CREATE VIEW sc.inventory_stock_ledger_vw AS
 SELECT it.part_id,
        p.part_number,
        p.name AS part_name,
        it.transaction_date,
        it.transaction_type,
        it.reference_type,
        it.transacted_quantity,
        CASE
            WHEN (it.reference_type)::text = 'GRN'::text
                 AND (it.transaction_type)::text <> 'QC Failed'::text  THEN 'purchase'::text
            WHEN (it.reference_type)::text = 'StockMovement'::text
                 AND (it.transaction_type)::text IN ('Issued', 'Consumed')  THEN 'consumption'::text
            ELSE NULL::text
        END AS movement_type,
        CASE
            WHEN (it.reference_type)::text = 'GRN'::text
                 AND (it.transaction_type)::text <> 'QC Failed'::text
                 THEN it.transacted_quantity
            WHEN (it.reference_type)::text = 'StockMovement'::text
                 AND (it.transaction_type)::text IN ('Issued', 'Consumed')
                 THEN -it.transacted_quantity
            ELSE 0
        END AS qty_delta
   FROM sc.inventory_transaction it
     JOIN mes.part p ON ((it.part_id = p.id) AND (p.deleted_by IS NULL))
  WHERE (it.deleted_by IS NULL)
    AND (it.notes IS NULL OR (it.notes)::text NOT LIKE '%pending Quality Check%');

ALTER VIEW sc.inventory_stock_ledger_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.inventory_stock_ledger_vw TO spacelinxuser;
