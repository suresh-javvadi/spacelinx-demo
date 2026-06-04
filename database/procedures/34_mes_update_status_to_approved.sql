CREATE OR REPLACE FUNCTION mes.update_status_to_approved(eco_entity_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    eco_record RECORD;
    eco_part RECORD;
    latest_part RECORD;
    part RECORD;
BEGIN
    -- Fetch the ECO record
    SELECT * INTO eco_record
    FROM ecos
    WHERE id = eco_entity_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ECO record not found';
    END IF;

    -- Update ECO status to Approved
    UPDATE ecos
    SET status = 'Approved'
    WHERE id = eco_entity_id;

    -- Start transaction
    BEGIN
        -- Fetch ECO parts
        FOR eco_part IN
            SELECT *
            FROM eco_parts
            WHERE eco_id = eco_entity_id
        LOOP
            -- Group parts by PartId and order by Version and PartNumberSuffix
            FOR part IN
                SELECT *
                FROM eco_parts
                WHERE part_id = eco_part.part_id
                ORDER BY version DESC, part_number_suffix DESC
            LOOP
                -- Update the latest part to Released
                IF part = eco_part THEN
                    UPDATE eco_parts
                    SET status = 'Released'
                    WHERE id = part.id;
                ELSE
                    -- Update previous parts to Obsolete
                    UPDATE eco_parts
                    SET status = 'Obsolete'
                    WHERE id = part.id;
                END IF;
            END LOOP;
        END LOOP;

        -- Update ECO status to Completed
        UPDATE ecos
        SET status = 'Completed'
        WHERE id = eco_entity_id;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE EXCEPTION 'Internal server error: %', SQLERRM;
    END;
END;
$$;

ALTER FUNCTION mes.update_status_to_approved(uuid) OWNER TO spacelinxadmin;
GRANT EXECUTE ON FUNCTION mes.update_status_to_approved(uuid) TO spacelinxuser;
