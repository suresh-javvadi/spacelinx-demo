CREATE OR REPLACE PROCEDURE mes.guide_mbom_refresh()
    LANGUAGE plpgsql
    AS $$
BEGIN
    WITH new_data AS (
        -- 1. First, prepare all the new values
        SELECT
            gm.guide_id,
            gm.part_id,
            p.weight AS part_weight,
            -- Use a LEFT JOIN to the aggregated data to ensure we keep all rows from guide_mbom
            COALESCE(gse_agg.total_quantity, 0) AS new_quantity
        FROM
            mes.guide_mbom gm
        INNER JOIN
            mes.part p ON gm.part_id = p.id
        LEFT JOIN (
            SELECT
                gse.guide_id,
                gse.part_id,
                SUM(gse.quantity) AS total_quantity
            FROM
                mes.guide_step_equipment gse
            GROUP BY
                gse.guide_id,
                gse.part_id
        ) AS gse_agg ON gm.guide_id = gse_agg.guide_id AND gm.part_id = gse_agg.part_id
    )
    -- 2. Then, update the target table from the prepared data
    UPDATE mes.guide_mbom gm
    SET
        quantity = nd.new_quantity,
        weight = nd.new_quantity * nd.part_weight -- Calculate weight using the new quantity
    FROM
        new_data nd
    WHERE
        -- Connect the target table (gm) to the source data (nd) here
        gm.guide_id = nd.guide_id
        AND gm.part_id = nd.part_id;
END;
$$;

ALTER PROCEDURE mes.guide_mbom_refresh() OWNER TO spacelinxadmin;
GRANT EXECUTE ON PROCEDURE mes.guide_mbom_refresh() TO spacelinxuser;
