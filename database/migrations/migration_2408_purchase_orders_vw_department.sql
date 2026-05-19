-- Migration: Update sc.purchase_orders_vw to include department and manager details
-- Date: 2026-05-19
-- Description:
--   Recreates sc.purchase_orders_vw to:
--   1. Add department_id
--   2. Add department_name
--   3. Add manager_full_name

CREATE OR REPLACE VIEW sc.purchase_orders_vw
 AS
 SELECT po.id,
    po.number,
    c.name AS vendor_name,
    c.vendor_code,
    c.contact_name AS vendor_contact,
    c.phone_number AS vendor_phone,
    po.order_date,
    po.expected_delivery_date AS delivery_date,
    po.status,
    po.total_amount,
    po.approved_by,
    po.approved_date,
    po.created_by,
    po.created_at,
    po.description,
    po.customer_instructions,
    po.delivery_terms,
    po.terms_and_conditions,
    pt.name AS payment_term,
    pr.project_code,
    pr.name AS project_name,
    bill_addr.city AS billing_city,
    ship_addr.city AS shipping_city,
    req.req_number AS requisition_number,
    po.department_id,
    d.name AS department_name,
    u.first_name || ' ' || COALESCE(u.last_name, '') AS manager_full_name
   FROM sc.purchase_order po
     LEFT JOIN sc.company c ON c.id = po.company_id AND c.deleted_by IS NULL
     LEFT JOIN sc.payment_term pt ON pt.id = po.payment_term_id
     LEFT JOIN pm.project pr ON pr.id = po.project_id
     LEFT JOIN common.address bill_addr ON bill_addr.id = po.billing_address_id
     LEFT JOIN common.address ship_addr ON ship_addr.id = po.shipping_address_id
     LEFT JOIN sc.requisition req ON req.id = po.requisition_id AND req.deleted_by IS NULL
     LEFT JOIN common.department d ON po.department_id = d.id
     LEFT JOIN application."user" u ON d.head_of_department_user_id = u.id
  WHERE po.is_active = true AND po.deleted_by IS NULL;

ALTER TABLE sc.purchase_orders_vw
    OWNER TO spacelinxadmin;

GRANT ALL ON TABLE sc.purchase_orders_vw TO spacelinxadmin;
GRANT ALL ON TABLE sc.purchase_orders_vw TO spacelinxuser;
