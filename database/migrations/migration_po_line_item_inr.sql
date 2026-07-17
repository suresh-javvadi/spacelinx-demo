START TRANSACTION;
ALTER TABLE sc.po_line_item ADD total_amount_in_inr numeric(18,4) GENERATED ALWAYS AS (((((ordered_quantity)::numeric * unit_price) * conversion_rate))::numeric(18,4)) STORED;

ALTER TABLE sc.po_line_item ADD unit_price_in_inr numeric(18,4) GENERATED ALWAYS AS (((unit_price * conversion_rate))::numeric(18,4)) STORED;


COMMIT;

