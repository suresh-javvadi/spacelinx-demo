-- Inventory stock movement report for a date window, on a perpetual-inventory
-- rollforward from a FROZEN fiscal-year opening anchor (default 2026-04-01).
--
--   seed            = SUM(sc.inventory_stock.opening_qty) per part -- the frozen
--                     fiscal-year opening balance, filled once at the anchor and
--                     NEVER mutated afterwards (the GRN flow no longer touches it,
--                     see GoodsReceiptNoteService.cs). This is the ONLY snapshot.
--   opening_qty     = seed + net movements from the anchor UP TO (but excluding)
--                     p_start  ==  the closing balance of the day before p_start.
--   purchase_qty    = qty ACCEPTED into stock (post-QC) DURING [p_start, p_end]
--   consumption_qty = 'Issued' + 'Consumed' stock movements DURING [p_start, p_end]
--                     (end inclusive). Transfer/Reserved/Adjustment do not count --
--                     see the sign rule in 24_sc_inventory_stock_ledger_vw.sql.
--   closing_qty     = opening_qty + purchase_qty - consumption_qty
--                  ==  seed + net movements from the anchor up to p_end.
--
-- closing_qty is a rollforward of the report's own ledger, NOT a mirror of
-- sc.inventory_stock.qty_onhand: goods that are Issued and later Consumed are
-- drawn down twice here, on purpose. See the ledger view header.
--
-- WHY the anchor lower-bounds the movement sums: the seed already embeds every
-- transaction that happened before the anchor. Summing ledger movements only from
-- p_anchor forward keeps pre-anchor rows from being counted twice. A window whose
-- p_start <= p_anchor therefore has opening_qty == seed (no prior movements).
--
-- Worked example (part with seed 100, anchor 2026-04-01):
--   Apr 01 -> Apr 01 : opening 100, +10 purchase, -20 consumption -> closing  90
--   Apr 02 -> Apr 10 : opening  90 (=100+10-20), +50, -10          -> closing 130
--   Apr 25 -> Jun 25 : opening = closing of Apr 24 (100 + all Apr01..Apr24 net)
--
-- SOURCE SPLIT (deliberate): the opening anchor is read from the sc.inventory_stock
-- snapshot (opening_qty), while all movement is transaction-derived from
-- sc.inventory_stock_ledger_vw (GRN / StockMovement). A part can exist in one source
-- but not the other, so the two are FULL OUTER JOINed and part identity is pulled
-- from mes.part (not from either aggregate) so no part is dropped.
--
-- Amounts use the current unit price from sc.inventory_part (collapsed to one price
-- per part via MAX so multi-location parts do not multiply rows).
-- p_part_id is optional: NULL = all parts, otherwise a single part.
-- p_anchor is the fiscal-year opening date; callers may override for a different year.

-- Drop the previous 3-arg signature so the new 4-arg overload is unambiguous when
-- called with 3 args (p_anchor defaulted).
DROP FUNCTION IF EXISTS sc.inventory_stock_report(date, date, uuid);

CREATE OR REPLACE FUNCTION sc.inventory_stock_report(
    p_start   date,
    p_end     date,
    p_part_id uuid DEFAULT NULL,
    p_anchor  date DEFAULT DATE '2026-04-01'
)
RETURNS TABLE (
    part_no            text,
    part_name          text,
    opening_qty        numeric,
    purchase_qty       numeric,
    consumption_qty    numeric,
    closing_qty        numeric,
    consumption_amount numeric,
    closing_balance    numeric
)
LANGUAGE sql
STABLE
AS $$
    WITH seed AS (
        SELECT
            s.part_id,
            COALESCE(SUM(s.opening_qty), 0) AS seed_qty
        FROM sc.inventory_stock s
        WHERE s.deleted_by IS NULL
          AND (p_part_id IS NULL OR s.part_id = p_part_id)
        GROUP BY s.part_id
    ),
    movement AS (
        SELECT
            l.part_id,
            -- Net movement from the anchor up to (excluding) p_start: the carry-in
            -- that turns the frozen seed into this window's opening balance.
            COALESCE(SUM(l.transacted_quantity) FILTER (
                WHERE l.movement_type = 'purchase'
                  AND l.transaction_date >= p_anchor
                  AND l.transaction_date <  p_start
            ), 0) AS prior_purchase,
            COALESCE(SUM(l.transacted_quantity) FILTER (
                WHERE l.movement_type = 'consumption'
                  AND l.transaction_date >= p_anchor
                  AND l.transaction_date <  p_start
            ), 0) AS prior_consumption,
            -- Movement inside the reporting window [p_start, p_end] (end inclusive).
            COALESCE(SUM(l.transacted_quantity) FILTER (
                WHERE l.movement_type = 'purchase'
                  AND l.transaction_date >= p_start
                  AND l.transaction_date <  p_end + INTERVAL '1 day'
            ), 0) AS purchase_qty,
            COALESCE(SUM(l.transacted_quantity) FILTER (
                WHERE l.movement_type = 'consumption'
                  AND l.transaction_date >= p_start
                  AND l.transaction_date <  p_end + INTERVAL '1 day'
            ), 0) AS consumption_qty
        FROM sc.inventory_stock_ledger_vw l
        WHERE (p_part_id IS NULL OR l.part_id = p_part_id)
          AND l.transaction_date < p_end + INTERVAL '1 day'
        GROUP BY l.part_id
    ),
    agg AS (
        SELECT
            COALESCE(s.part_id, m.part_id) AS part_id,
            -- opening = frozen seed + net carry-in from anchor to p_start-1
            COALESCE(s.seed_qty, 0)
                + COALESCE(m.prior_purchase, 0)
                - COALESCE(m.prior_consumption, 0) AS opening_qty,
            COALESCE(m.purchase_qty, 0)    AS purchase_qty,
            COALESCE(m.consumption_qty, 0) AS consumption_qty
        FROM seed s
        FULL OUTER JOIN movement m ON m.part_id = s.part_id
    ),
    priced AS (
        SELECT part_id, MAX(unit_price) AS unit_price
        FROM sc.inventory_part
        WHERE is_active = TRUE
          AND deleted_by IS NULL
        GROUP BY part_id
    )
    SELECT
        p.part_number AS part_no,
        p.name        AS part_name,
        a.opening_qty,
        a.purchase_qty,
        a.consumption_qty,
        (a.opening_qty + a.purchase_qty - a.consumption_qty) AS closing_qty,
        ROUND(a.consumption_qty * COALESCE(pr.unit_price, 0), 2) AS consumption_amount,
        ROUND((a.opening_qty + a.purchase_qty - a.consumption_qty)
              * COALESCE(pr.unit_price, 0), 2) AS closing_balance
    FROM agg a
    JOIN mes.part p ON p.id = a.part_id AND p.deleted_by IS NULL
    LEFT JOIN priced pr ON pr.part_id = a.part_id
    ORDER BY p.part_number;
$$;

ALTER FUNCTION sc.inventory_stock_report(date, date, uuid, date) OWNER TO spacelinxadmin;
GRANT EXECUTE ON FUNCTION sc.inventory_stock_report(date, date, uuid, date) TO spacelinxuser;
