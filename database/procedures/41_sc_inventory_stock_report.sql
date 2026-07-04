-- Inventory stock movement report for a date window.
--   opening_qty     = net signed on-hand accumulated STRICTLY BEFORE p_start
--   purchase_qty    = qty ACCEPTED into stock (post-QC) DURING [p_start, p_end]
--   consumption_qty = Consumed DURING [p_start, p_end]       (end inclusive)
--   closing_qty     = opening + purchase - consumption
-- Amounts use the current unit price from sc.inventory_part (collapsed to one
-- price per part via MAX so multi-location parts do not multiply rows).
-- p_part_id is optional: NULL = all parts, otherwise a single part.
CREATE OR REPLACE FUNCTION sc.inventory_stock_report(
    p_start   date,
    p_end     date,
    p_part_id uuid DEFAULT NULL
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
    WITH agg AS (
        SELECT
            l.part_id,
            MAX(l.part_number) AS part_number,
            MAX(l.part_name)   AS part_name,
            COALESCE(SUM(l.qty_delta)
                FILTER (WHERE l.transaction_date < p_start), 0) AS opening_qty,
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
        GROUP BY l.part_id
    ),
    priced AS (
        SELECT part_id, MAX(unit_price) AS unit_price
        FROM sc.inventory_part
        WHERE is_active = TRUE
          AND deleted_by IS NULL
        GROUP BY part_id
    )
    SELECT
        a.part_number AS part_no,
        a.part_name,
        a.opening_qty,
        a.purchase_qty,
        a.consumption_qty,
        (a.opening_qty + a.purchase_qty - a.consumption_qty) AS closing_qty,
        ROUND(a.consumption_qty * COALESCE(pr.unit_price, 0), 2) AS consumption_amount,
        ROUND((a.opening_qty + a.purchase_qty - a.consumption_qty)
              * COALESCE(pr.unit_price, 0), 2) AS closing_balance
    FROM agg a
    LEFT JOIN priced pr ON pr.part_id = a.part_id
    ORDER BY a.part_number;
$$;

ALTER FUNCTION sc.inventory_stock_report(date, date, uuid) OWNER TO spacelinxadmin;
GRANT EXECUTE ON FUNCTION sc.inventory_stock_report(date, date, uuid) TO spacelinxuser;
