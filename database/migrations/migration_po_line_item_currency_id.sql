START TRANSACTION;
ALTER TABLE sc.po_line_item ADD currency_id uuid;

UPDATE sc.po_line_item pli 
SET currency_id = c.id
FROM common.currency c 
WHERE c.code = pli.currency;

ALTER TABLE sc.po_line_item DROP COLUMN currency;

CREATE INDEX "IX_po_line_item_currency_id" ON sc.po_line_item (currency_id);

ALTER TABLE sc.po_line_item ADD CONSTRAINT po_line_item_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency (id) ON DELETE SET NULL;


COMMIT;

