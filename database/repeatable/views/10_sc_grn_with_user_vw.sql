DROP VIEW IF EXISTS sc.grn_with_user_vw CASCADE;

CREATE VIEW sc.grn_with_user_vw AS
 SELECT grn.id AS grn_id,
    grn.grn_number,
    grn.purchase_order_id,
    grn.received_date,
    grn.received_by_id,
    grn.location_id,
    (((COALESCE(u.first_name, ''::character varying))::text || ' '::text) || (COALESCE(u.last_name, ''::character varying))::text) AS received_by_full_name,
    lower((u.email)::text) AS received_by_email,
    grn.description,
    grn.reference_number,
    grn.invoice_number,
    grn.invoice_date,
    grn.vendor_reference_id,
    grn.status,
    grn.vendor_id,
    grn.is_active,
    grn.created_at,
    grn.created_by,
    grn.updated_at,
    grn.updated_by,
    po.id AS po_id,
    po.number AS po_number,
    po.company_id,
    po.project_id,
    po.buyer_id,
    po.supply_chain_lead_id,
    po.requisition_id,
    po.payment_term_id,
    po.currency_id,
    po.order_date,
    po.actual_delivery_date AS delivery_date,
    po.expected_delivery_date,
    pt.name AS payment_term_name,
    pt.due_days AS payment_term_due_days,
        CASE
            WHEN (pt.id IS NULL) THEN NULL::date
            WHEN ((pt.name)::text ~~* '%po issued%'::text) THEN po.order_date
            ELSE (po.expected_delivery_date + COALESCE(pt.due_days, 0))
        END AS expected_payment_date,
    po.total_amount,
    po.status AS po_status,
    po.revision_history,
    po.billing_address_id,
    po.delivery_address_id,
    po.shipping_address_id,
    po.delivery_status,
    po.quotation_reference_id,
    po.approved_by,
    po.approved_date,
    loc.number AS location_number,
    loc.name AS location_name,
    vendor.vendor_code,
    vendor.name AS vendor_name
   FROM (((((sc.goods_receipt_note grn
     LEFT JOIN application."user" u ON ((((grn.received_by_id = u.id) OR (lower((grn.created_by)::text) = lower((u.email)::text))) AND (u.deleted_by IS NULL))))
     LEFT JOIN sc.purchase_order po ON ((grn.purchase_order_id = po.id)))
     LEFT JOIN sc.payment_term pt ON ((po.payment_term_id = pt.id)))
     LEFT JOIN mes.location loc ON ((grn.location_id = loc.id)))
     LEFT JOIN sc.company vendor ON ((grn.vendor_id = vendor.id)))
  WHERE (grn.deleted_by IS NULL);

ALTER VIEW sc.grn_with_user_vw OWNER TO spacelinxadmin;
GRANT SELECT ON sc.grn_with_user_vw TO spacelinxuser;
