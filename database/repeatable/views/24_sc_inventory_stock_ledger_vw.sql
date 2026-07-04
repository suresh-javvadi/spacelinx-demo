DROP VIEW IF EXISTS sc.inventory_stock_ledger_vw CASCADE;

-- One signed row per non-deleted inventory transaction.
-- Carries the part join (1:1 via mes.part) and the signed on-hand delta.
-- NOTE: unit price is intentionally NOT joined here. sc.inventory_part has one
-- row per part PER location/bin, so joining it at the transaction grain would
-- multiply rows and inflate quantities. Price is applied once-per-part in
-- sc.inventory_stock_report(...) instead.
--
-- Sign rule (verified against the GRN lifecycle in GoodsReceiptNoteService.cs
-- + GoodsReceiptNoteController.cs):
--   inward  = Received rows ACCEPTED into stock after QC
--   outward = Consumed
--   all other movement types contribute 0
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
            WHEN (it.transaction_type)::text = 'Received'::text THEN 'purchase'::text
            WHEN (it.transaction_type)::text = 'Consumed'::text THEN 'consumption'::text
            ELSE NULL::text
        END AS movement_type,
        CASE
            WHEN (it.transaction_type)::text = 'Received'::text
                 THEN it.transacted_quantity
            WHEN (it.transaction_type)::text = 'Consumed'::text
                 THEN -it.transacted_quantity
            ELSE 0
        END AS qty_delta
   FROM sc.inventory_transaction it
     JOIN mes.part p ON ((it.part_id = p.id) AND (p.deleted_by IS NULL))
  WHERE (it.deleted_by IS NULL)
    AND (it.notes IS NULL OR (it.notes)::text NOT LIKE '%pending Quality Check%');

ALTER VIEW sc.inventory_stock_ledger_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.inventory_stock_ledger_vw TO spacelinxuser;
