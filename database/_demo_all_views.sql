-- ============================================================================
-- DEMO bundle: (1) ensure inventory_stock opening-balance columns exist, then
-- (2) (re)create all repeatable views from current source.
-- Safe to re-run. OWNER/GRANT lines stripped (those roles don't exist on Neon).
-- ============================================================================

-- (1) Columns the inventory_part_price_vw depends on
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='opening_qty') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN opening_qty INT NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='sc' AND table_name='inventory_stock' AND column_name='opening_price') THEN
        ALTER TABLE sc.inventory_stock ADD COLUMN opening_price NUMERIC(18,4) DEFAULT 0;
    END IF;
END
$$;

-- DEMO: all repeatable views, regenerated from current source. OWNER/GRANT lines stripped (those roles don't exist on Neon).

-- ===== 01_common_document_with_users_vw.sql =====
DROP VIEW IF EXISTS common.document_with_users_vw CASCADE;

CREATE VIEW common.document_with_users_vw AS
 SELECT d.id,
    d.title,
    d.description,
    d.document_type,
    d.entity_type,
    d.entity_id,
    d.file_name,
    d.file_extension,
    d.file_size,
    d.file_path,
    d.file_relative_path,
    d.mime_type,
    d.document_storage_type,
    d.external_url,
    d.tags,
    d.metadata,
    d.is_active,
    d.created_at,
    d.created_by,
    TRIM(BOTH FROM (((COALESCE(cu.first_name, ''::character varying))::text || ' '::text) || (COALESCE(cu.last_name, ''::character varying))::text)) AS created_by_full_name
   FROM (common.document d
     LEFT JOIN application."user" cu ON ((lower((cu.email)::text) = lower((d.created_by)::text))))
  WHERE (d.deleted_at IS NULL);


-- ===== 02_mes_eco_with_users_vw.sql =====
DROP VIEW IF EXISTS mes.eco_with_users_vw CASCADE;

CREATE VIEW mes.eco_with_users_vw AS
 SELECT eco.id,
    eco.number,
    eco.name,
    eco.reason_for_change,
    eco.description,
    eco.change_type,
    eco.impact_analysis,
    eco.priority,
    eco.requestor,
    eco.approver,
    eco.planned_implementation_date,
    eco.approved_by,
    eco.approved_date,
    eco.status,
    eco.is_active,
    eco.created_at,
    eco.created_by,
    eco.updated_at,
    eco.updated_by,
    req_user.id AS requestor_id,
    (((req_user.first_name)::text || ' '::text) || (req_user.last_name)::text) AS requestor_full_name,
    req_user.email AS requestor_email,
    json_agg(json_build_object('approval_id', appr.id, 'approver_id', appr.approver_id, 'status', appr.status, 'comment', appr.comment, 'full_name', (((appr_user.first_name)::text || ' '::text) || (appr_user.last_name)::text), 'email', appr_user.email)) FILTER (WHERE (appr.id IS NOT NULL)) AS approvers
   FROM (((mes.eco eco
     LEFT JOIN application."user" req_user ON ((((eco.requestor)::text = (req_user.email)::text) AND (req_user.deleted_by IS NULL))))
     LEFT JOIN common.approval appr ON (((appr.entity_id = eco.id) AND (appr.deleted_by IS NULL))))
     LEFT JOIN application."user" appr_user ON (((appr.approver_id = appr_user.id) AND (appr_user.deleted_by IS NULL))))
  WHERE (eco.deleted_by IS NULL)
  GROUP BY eco.id, eco.number, eco.name, eco.reason_for_change, eco.description, eco.change_type, eco.impact_analysis, eco.priority, eco.requestor, eco.approver, eco.planned_implementation_date, eco.approved_by, eco.approved_date, eco.status, eco.is_active, eco.created_at, eco.created_by, eco.updated_at, eco.updated_by, req_user.id, req_user.first_name, req_user.last_name, req_user.email;


-- ===== 03_mes_guide_mbom_vw.sql =====
DROP VIEW IF EXISTS mes.guide_mbom_vw CASCADE;

CREATE VIEW mes.guide_mbom_vw AS
 SELECT g.id AS guide_id,
    g.part_id AS guide_part_id,
    gp.part_number AS guide_part_number,
    gp.name AS guide_part_name,
    gp.part_number_suffix AS guide_part_number_suffix,
    e.id AS ebom_id,
    e.child_part_id AS ebom_part_id,
    ep.part_number,
    ep.name,
    ep.part_number_suffix,
    ep.is_serial_number_required,
    e.quantity AS quantity_e,
    gse.part_id AS gse_part_id,
    gm.weight AS guide_mbom_weight,
    COALESCE(sum(gse.quantity), (0)::bigint) AS quantity_m,
    cp.weight AS child_part_weight
   FROM ((((((mes.guide g
     LEFT JOIN mes.part gp ON (((g.part_id = gp.id) AND (gp.deleted_by IS NULL))))
     LEFT JOIN mes.ebom e ON (((g.part_id = e.part_id) AND (e.deleted_by IS NULL))))
     LEFT JOIN mes.part ep ON (((e.child_part_id = ep.id) AND (ep.deleted_by IS NULL))))
     LEFT JOIN mes.guide_step_equipment gse ON (((g.id = gse.guide_id) AND (e.child_part_id = gse.part_id) AND (gse.deleted_by IS NULL))))
     LEFT JOIN mes.guide_mbom gm ON (((g.id = gm.guide_id) AND (gm.part_id = e.child_part_id) AND (gm.deleted_by IS NULL))))
     LEFT JOIN mes.part cp ON (((e.child_part_id = cp.id) AND (cp.deleted_by IS NULL))))
  WHERE (g.deleted_by IS NULL)
  GROUP BY g.id, g.part_id, gp.part_number, gp.name, gp.part_number_suffix, e.id, e.child_part_id, ep.part_number, ep.name, ep.part_number_suffix, ep.is_serial_number_required, gse.part_id, e.quantity, gm.weight, cp.weight
 HAVING ((gse.part_id IS NOT NULL) OR (e.child_part_id IS NOT NULL));


-- ===== 04_mes_guide_mbom_details.sql =====
DROP VIEW IF EXISTS mes.guide_mbom_details CASCADE;

CREATE VIEW mes.guide_mbom_details AS
 SELECT g.id AS guideid,
    ge.child_part_id AS partid,
    COALESCE(gmv.quantity_m, (ge.quantity)::bigint) AS quantity
   FROM ((mes.guide g
     JOIN mes.guide_ebom ge ON (((g.part_id = ge.part_id) AND (ge.deleted_by IS NULL))))
     LEFT JOIN mes.guide_mbom_vw gmv ON (((g.id = gmv.guide_id) AND (gmv.ebom_part_id = ge.child_part_id))))
  WHERE (((g.status)::text = 'Published'::text) AND (g.deleted_by IS NULL))
UNION
 SELECT g.id AS guideid,
    e.child_part_id AS partid,
    COALESCE(gmv.quantity_m, (e.quantity)::bigint) AS quantity
   FROM ((mes.guide g
     JOIN mes.ebom e ON (((g.part_id = e.part_id) AND (e.deleted_by IS NULL))))
     LEFT JOIN mes.guide_mbom_vw gmv ON (((g.id = gmv.guide_id) AND (gmv.ebom_part_id = e.child_part_id))))
  WHERE (((g.status)::text = 'Draft'::text) AND (g.deleted_by IS NULL));


-- ===== 05_mes_parts_not_associated_with_guides.sql =====
DROP VIEW IF EXISTS mes.parts_not_associated_with_guides CASCADE;

CREATE VIEW mes.parts_not_associated_with_guides AS
 SELECT id,
    part_number,
    name,
    description,
    part_type_id,
    unit_of_measure_id,
    make_buy,
    is_active,
    is_serial_number_required,
    status,
    reference_number,
    short_description,
    created_at,
    created_by,
    updated_at,
    updated_by
   FROM mes.part p
  WHERE ((deleted_by IS NULL) AND ((status)::text = ANY (ARRAY[('Release'::character varying)::text, ('Draft'::character varying)::text])) AND (id IN ( SELECT DISTINCT eb.part_id
           FROM mes.ebom eb
          WHERE ((eb.deleted_by IS NULL) AND (NOT (EXISTS ( SELECT 1
                   FROM mes.guide g
                  WHERE ((g.part_id = eb.part_id) AND (g.deleted_by IS NULL)))))))));


-- ===== 06_mes_workorderguidestepsview.sql =====
DROP VIEW IF EXISTS mes.workorderguidestepsview CASCADE;

CREATE VIEW mes.workorderguidestepsview AS
 SELECT wo.id AS workorderid,
    gs.sequence AS guidestepsequence,
    gs.title AS guidestepname,
    count(DISTINCT wost.id) AS numberofworkordertasks,
    count(DISTINCT gst.id) AS numberofguidesteptasks,
    wos.captured_time AS capturedtime,
    wos.status AS workorderstepstatus
   FROM ((((mes.work_order wo
     JOIN mes.guide_step gs ON (((wo.guide_id = gs.guide_id) AND (gs.deleted_by IS NULL))))
     LEFT JOIN mes.work_order_step wos ON (((wo.id = wos.work_order_id) AND (gs.id = wos.guide_step_id) AND (wos.deleted_by IS NULL))))
     LEFT JOIN mes.guide_step_task gst ON (((gs.id = gst.guide_step_id) AND (gst.deleted_by IS NULL))))
     LEFT JOIN mes.work_order_task wost ON (((wo.id = wost.work_order_id) AND (wost.guide_step_task_id = gst.id) AND (wost.deleted_by IS NULL))))
  GROUP BY wo.id, gs.sequence, gs.title, wos.captured_time, wos.id, wos.status
  ORDER BY wo.id, gs.sequence;


-- ===== 07_pm_resource_workload_vw.sql =====
DROP VIEW IF EXISTS pm.resource_workload_vw CASCADE;

CREATE VIEW pm.resource_workload_vw AS
 SELECT id AS user_id,
    first_name,
    last_name,
    email,
    image_url,
    department,
    job_title,
    ( SELECT COALESCE(json_agg(json_build_object('id', ra.id, 'projectId', ra.project_id, 'projectName', p.name, 'taskId', ra.task_id, 'taskName', t.name, 'startDate', ra.start_date, 'endDate', ra.end_date, 'allocatedHoursPerDay', ra.allocated_hours_per_day, 'allocationPercent', ra.allocation_percent, 'allocationType', ra.allocation_type)), '[]'::json) AS "coalesce"
           FROM ((pm.resource_allocation ra
             LEFT JOIN pm.project p ON ((ra.project_id = p.id)))
             LEFT JOIN pm.task t ON ((ra.task_id = t.id)))
          WHERE ((ra.user_id = s.id) AND (ra.deleted_at IS NULL) AND (ra.end_date >= CURRENT_DATE))) AS current_allocations,
    ( SELECT COALESCE(sum(ra.allocation_percent), (0)::bigint) AS "coalesce"
           FROM pm.resource_allocation ra
          WHERE ((ra.user_id = s.id) AND (ra.deleted_at IS NULL) AND (CURRENT_DATE >= ra.start_date) AND (CURRENT_DATE <= ra.end_date))) AS today_allocation_percent,
    ( SELECT count(*) AS count
           FROM pm.task t
          WHERE ((t.assigned_to_id = s.id) AND (t.deleted_at IS NULL) AND ((t.status)::text <> 'Completed'::text))) AS active_tasks_count,
    ( SELECT count(*) AS count
           FROM pm.task_assignee ta
          WHERE ((ta.user_id = s.id) AND (ta.deleted_at IS NULL) AND ((ta.assignee_role)::text = 'Primary'::text) AND (EXISTS ( SELECT 1
                   FROM pm.task t
                  WHERE ((t.id = ta.task_id) AND (t.deleted_at IS NULL) AND ((t.status)::text <> 'Completed'::text)))))) AS primary_assignments_count,
    ( SELECT COALESCE(sum(te.hours_worked), (0)::numeric) AS "coalesce"
           FROM pm.time_entry te
          WHERE ((te.user_id = s.id) AND (te.deleted_at IS NULL) AND (te.entry_date >= date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone)))) AS hours_logged_this_week,
    ( SELECT COALESCE(sum(te.hours_worked), (0)::numeric) AS "coalesce"
           FROM pm.time_entry te
          WHERE ((te.user_id = s.id) AND (te.deleted_at IS NULL) AND (te.entry_date >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)))) AS hours_logged_this_month,
    ( SELECT count(*) AS count
           FROM pm.task t
          WHERE ((t.assigned_to_id = s.id) AND (t.deleted_at IS NULL) AND ((t.status)::text <> ALL (ARRAY[('Completed'::character varying)::text, ('Logged'::character varying)::text])) AND (t.due_date < CURRENT_DATE))) AS overdue_tasks_count
   FROM application."user" s
  WHERE ((deleted_at IS NULL) AND (is_active = true));


-- ===== 08_pm_task_gantt_vw.sql =====
DROP VIEW IF EXISTS pm.task_gantt_vw CASCADE;

CREATE VIEW pm.task_gantt_vw AS
 SELECT t.id,
    t.task_code,
    t.name,
    t.description,
    t.project_id,
    t.parent_task_id,
    t.status,
    t.priority,
    t.task_type,
    t.start_date,
    t.due_date,
    t.progress_percent,
    t.estimated_hours,
    t.actual_hours,
    t.sort_order,
    t.assigned_to_id,
    t.is_active,
    t.created_at,
    t.created_by,
    p.name AS project_name,
    p.project_code,
    s.first_name AS assignee_first_name,
    s.last_name AS assignee_last_name,
    s.email AS assignee_email,
    pt.name AS parent_task_name,
    pt.task_code AS parent_task_code,
    ( SELECT COALESCE(json_agg(json_build_object('id', td.id, 'predecessorTaskId', td.predecessor_task_id, 'predecessorTaskName', pred.name, 'predecessorTaskCode', pred.task_code, 'dependencyType', td.dependency_type, 'lagDays', td.lag_days)), '[]'::json) AS "coalesce"
           FROM (pm.task_dependency td
             JOIN pm.task pred ON ((td.predecessor_task_id = pred.id)))
          WHERE ((td.successor_task_id = t.id) AND (td.deleted_at IS NULL))) AS dependencies,
    ( SELECT count(*) AS count
           FROM pm.task st
          WHERE ((st.parent_task_id = t.id) AND (st.deleted_at IS NULL))) AS subtask_count,
    ( SELECT count(*) AS count
           FROM pm.task st
          WHERE ((st.parent_task_id = t.id) AND (st.deleted_at IS NULL) AND ((st.status)::text = 'Completed'::text))) AS completed_subtask_count,
    ( SELECT COALESCE(json_agg(json_build_object('id', ta.id, 'userId', ta.user_id, 'firstName', tas.first_name, 'lastName', tas.last_name, 'role', ta.assignee_role)), '[]'::json) AS "coalesce"
           FROM (pm.task_assignee ta
             JOIN application."user" tas ON ((ta.user_id = tas.id)))
          WHERE ((ta.task_id = t.id) AND (ta.deleted_at IS NULL))) AS assignees
   FROM (((pm.task t
     LEFT JOIN pm.project p ON ((t.project_id = p.id)))
     LEFT JOIN application."user" s ON ((t.assigned_to_id = s.id)))
     LEFT JOIN pm.task pt ON ((t.parent_task_id = pt.id)))
  WHERE (t.deleted_at IS NULL);


-- ===== 09_sc_company_with_organization_vw.sql =====
DROP VIEW IF EXISTS sc.company_with_organization_vw CASCADE;

CREATE VIEW sc.company_with_organization_vw AS
 SELECT c.id,
    c.name,
    c.is_active,
    c.created_at,
    c.created_by,
    c.updated_at,
    c.updated_by,
    'Company'::text AS entity_type
   FROM sc.company c
UNION ALL
 SELECT o.id,
    o.name,
    o.is_active,
    o.created_at,
    o.created_by,
    o.updated_at,
    o.updated_by,
    'Organization'::text AS entity_type
   FROM application.organization o
  WHERE (o.deleted_by IS NULL);


-- ===== 10_sc_grn_with_user_vw.sql =====
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
   FROM ((((sc.goods_receipt_note grn
     LEFT JOIN application."user" u ON ((((grn.received_by_id = u.id) OR (lower((grn.created_by)::text) = lower((u.email)::text))) AND (u.deleted_by IS NULL))))
     LEFT JOIN sc.purchase_order po ON ((grn.purchase_order_id = po.id)))
     LEFT JOIN mes.location loc ON ((grn.location_id = loc.id)))
     LEFT JOIN sc.company vendor ON ((grn.vendor_id = vendor.id)))
  WHERE (grn.deleted_by IS NULL);


-- ===== 11_sc_grns_by_purchase_order_vw.sql =====
DROP VIEW IF EXISTS sc.grns_by_purchase_order_vw CASCADE;

CREATE VIEW sc.grns_by_purchase_order_vw AS
 SELECT grn.id AS grn_id,
    grn.grn_number,
    grn.purchase_order_id,
    grn.received_date,
    grn.received_by_id,
    (((u.first_name)::text || ' '::text) || (u.last_name)::text) AS received_by_full_name,
    u.email AS received_by_email,
    grn.location_id,
    loc.number AS location_number,
    loc.name AS location_name,
    grn.description,
    grn.reference_number,
    grn.invoice_number,
    grn.invoice_date,
    grn.vendor_reference_id,
    grn.status,
    grn.vendor_id,
    vendor.vendor_code,
    vendor.name AS vendor_name,
    grn.is_active,
    grn.created_at,
    grn.created_by,
    grn.updated_at,
    grn.updated_by,
    json_agg(jsonb_build_object('grn_line_item_id', li.id, 'part_id', li.part_id, 'part_name', p.name, 'part_number', p.part_number, 'received_quantity', li.received_quantity)) FILTER (WHERE (li.id IS NOT NULL)) AS grn_line_items
   FROM (((((sc.goods_receipt_note grn
     LEFT JOIN application."user" u ON ((grn.received_by_id = u.id)))
     LEFT JOIN mes.location loc ON ((grn.location_id = loc.id)))
     LEFT JOIN sc.grn_line_item li ON (((li.grn_id = grn.id) AND (li.deleted_by IS NULL))))
     LEFT JOIN mes.part p ON ((p.id = li.part_id)))
     LEFT JOIN sc.company vendor ON ((grn.vendor_id = vendor.id)))
  WHERE (grn.deleted_by IS NULL)
  GROUP BY grn.id, grn.grn_number, grn.purchase_order_id, grn.received_date, grn.received_by_id, u.first_name, u.last_name, u.email, grn.location_id, loc.number, loc.name, grn.description, grn.vendor_reference_id, grn.status, grn.vendor_id, vendor.vendor_code, vendor.name, grn.is_active, grn.created_at, grn.created_by, grn.updated_at, grn.updated_by;


-- ===== 12_sc_inventory_goods_vw.sql =====
DROP VIEW IF EXISTS sc.inventory_goods_vw CASCADE;

CREATE VIEW sc.inventory_goods_vw AS
 SELECT ip.id AS inventory_id,
    ip.part_id AS inventory_part_id,
    ip.sku_code,
    ip.reorder_level,
    ip.unit_price AS inventory_unit_price,
    ip.qty_onhand,
    ip.qty_reserved,
    ip.qty_available,
    ip.consumed_quantity,
    ip.is_active AS inventory_is_active,
    ip.created_at AS inventory_created_at,
    ip.created_by AS inventory_created_by,
    ip.updated_at AS inventory_updated_at,
    ip.updated_by AS inventory_updated_by,
    p.id AS part_id,
    p.part_number,
    p.part_type_id,
    p.part_number_suffix,
    p.version,
    p.name AS part_name,
    p.description,
    p.weight,
    p.unit_price AS part_unit_price,
    p.status,
    p.manufacturing_part_number,
    p.is_serial_number_required,
    p.is_active AS part_is_active,
    p.item_type
   FROM (mes.part p
     LEFT JOIN sc.inventory_part ip ON (((ip.part_id = p.id) AND (ip.deleted_by IS NULL))))
  WHERE (((p.item_type)::text = 'Goods'::text) AND (p.deleted_by IS NULL));


-- ===== 13_sc_inventory_part_price_vw.sql =====
DROP VIEW IF EXISTS sc.inventory_part_price_vw CASCADE;

CREATE VIEW sc.inventory_part_price_vw AS
 SELECT i.id AS inventory_id,
    i.id AS inventory_part_id,
    i.location_id,
    i.bin_id,
    i.sku_code,
    i.reorder_level,
    i.unit_price AS inventory_unit_price,
    sum(ins.qty_onhand) AS qty_onhand,
    sum(ins.qty_reserved) AS qty_reserved,
    sum(ins.qty_issued) AS qty_issued,
    sum(ins.qty_qc_pending) AS qty_qc_pending,
    sum(ins.qty_qc_failed) AS qty_qc_failed,
    sum(ins.qty_scrapped) AS qty_scrapped,
    sum(ins.qty_returned) AS qty_returned,
    sum(ins.qty_available) AS qty_available,
    sum(ins.issued_price) AS issued_price,
    sum(ins.reserved_price) AS reserved_price,
    sum(ins.available_price) AS available_price,
    sum(ins.total_price) AS total_price,
    sum(ins.opening_qty) AS opening_qty,
    sum(ins.opening_price) AS opening_price,
    i.consumed_quantity,
    i.is_active AS inventory_is_active,
    i.created_at AS inventory_created_at,
    i.created_by AS inventory_created_by,
    i.updated_at AS inventory_updated_at,
    i.updated_by AS inventory_updated_by,
    p.id AS part_id,
    p.part_number,
    p.part_type_id,
    p.part_number_suffix,
    p.version,
    p.name AS part_name,
    p.description,
    p.weight,
    p.unit_price AS part_unit_price,
    p.status,
    p.manufacturing_part_number,
    p.is_serial_number_required,
    p.is_active AS part_is_active
   FROM ((sc.inventory_part i
     LEFT JOIN mes.part p ON ((i.part_id = p.id)))
     LEFT JOIN sc.inventory_stock ins ON (((ins.part_id = i.part_id) AND (ins.is_active = true))))
  WHERE ((i.deleted_at IS NULL) AND (p.item_type IS NULL))
  GROUP BY i.id, i.location_id, i.bin_id, i.sku_code, i.reorder_level, i.unit_price, i.consumed_quantity, i.is_active, i.created_at, i.created_by, i.updated_at, i.updated_by, p.id, p.part_number, p.part_type_id, p.part_number_suffix, p.version, p.name, p.description, p.weight, p.unit_price, p.status, p.manufacturing_part_number, p.is_serial_number_required, p.is_active;


-- ===== 14_sc_inventory_part_vw.sql =====
DROP VIEW IF EXISTS sc.inventory_part_vw CASCADE;

CREATE VIEW sc.inventory_part_vw AS
 SELECT i.id AS inventory_id,
    i.id AS inventory_part_id,
    i.location_id,
    i.bin_id,
    i.sku_code,
    i.reorder_level,
    i.unit_price AS inventory_unit_price,
    i.qty_onhand,
    i.qty_reserved,
    i.qty_available,
    i.qty_issued,
    i.qty_qc_pending,
    i.qty_qc_failed,
    i.qty_scrapped,
    i.consumed_quantity,
    i.qty_returned,
    i.is_active AS inventory_is_active,
    i.created_at AS inventory_created_at,
    i.created_by AS inventory_created_by,
    i.updated_at AS inventory_updated_at,
    i.updated_by AS inventory_updated_by,
    p.id AS part_id,
    p.part_number,
    p.part_type_id,
    p.part_number_suffix,
    p.version,
    p.name AS part_name,
    p.description,
    p.weight,
    p.unit_price AS part_unit_price,
    p.status,
    p.manufacturing_part_number,
    p.is_serial_number_required,
    p.is_active AS part_is_active
   FROM (sc.inventory_part i
     LEFT JOIN mes.part p ON ((i.part_id = p.id)))
  WHERE (i.deleted_at IS NULL);


-- ===== 15_sc_inventory_services_vw.sql =====
DROP VIEW IF EXISTS sc.inventory_services_vw CASCADE;

CREATE VIEW sc.inventory_services_vw AS
 SELECT ip.id AS inventory_id,
    ip.part_id AS inventory_part_id,
    ip.sku_code,
    ip.reorder_level,
    ip.unit_price AS inventory_unit_price,
    ip.qty_onhand,
    ip.qty_reserved,
    ip.qty_available,
    ip.consumed_quantity,
    ip.is_active AS inventory_is_active,
    ip.created_at AS inventory_created_at,
    ip.created_by AS inventory_created_by,
    ip.updated_at AS inventory_updated_at,
    ip.updated_by AS inventory_updated_by,
    p.id AS part_id,
    p.part_number,
    p.part_type_id,
    p.part_number_suffix,
    p.version,
    p.name AS part_name,
    p.description,
    p.weight,
    p.unit_price AS part_unit_price,
    p.status,
    p.manufacturing_part_number,
    p.is_serial_number_required,
    p.is_active AS part_is_active,
    p.item_type
   FROM (mes.part p
     LEFT JOIN sc.inventory_part ip ON (((ip.part_id = p.id) AND (ip.deleted_by IS NULL))))
  WHERE (((p.item_type)::text = 'Services'::text) AND (p.deleted_by IS NULL));


-- ===== 16_sc_inventory_transaction_vw.sql =====
DROP VIEW IF EXISTS sc.inventory_transaction_vw CASCADE;

CREATE VIEW sc.inventory_transaction_vw AS
 SELECT it.id,
    it.part_id,
    p.part_number,
    p.name AS part_name,
    p.part_type_id,
    p.status AS part_status,
    p.item_type,
    it.transaction_type,
    it.current_quantity,
    it.previous_quantity,
    it.transacted_quantity,
    it.reference_type,
    it.reference_id,
    COALESCE(grn.reference_number, po.number) AS reference_number,
    it.transaction_date,
    it.notes,
    it.from_location_id,
    fl.name AS from_location_name,
    fl.number AS from_location_number,
    it.to_location_id,
    tl.name AS to_location_name,
    tl.number AS to_location_number,
    it.created_at,
    it.created_by,
    (((cb.first_name)::text || ' '::text) || (COALESCE(cb.last_name, ''::character varying))::text) AS created_by_full_name,
    it.updated_at,
    it.updated_by
   FROM ((((((sc.inventory_transaction it
     LEFT JOIN mes.part p ON (((it.part_id = p.id) AND (p.deleted_by IS NULL))))
     LEFT JOIN mes.location fl ON ((it.from_location_id = fl.id)))
     LEFT JOIN mes.location tl ON ((it.to_location_id = tl.id)))
     LEFT JOIN sc.goods_receipt_note grn ON ((((it.reference_type)::text = 'GRN'::text) AND (it.reference_id = grn.id) AND (grn.is_active = true) AND (grn.deleted_by IS NULL))))
     LEFT JOIN sc.purchase_order po ON ((((it.reference_type)::text = 'PO'::text) AND (it.reference_id = po.id) AND (po.is_active = true) AND (po.deleted_by IS NULL))))
     LEFT JOIN application."user" cb ON (((it.created_by)::text = (cb.email)::text)))
  WHERE (it.deleted_by IS NULL);


-- ===== 17_sc_issue_history_vw.sql =====
DROP VIEW IF EXISTS sc.issue_history_vw CASCADE;

CREATE VIEW sc.issue_history_vw AS
 SELECT smli.id AS stock_movement_line_item_id,
    smli.part_id,
    sm.movement_number,
    sm.movement_date AS issued_date,
    sm.department,
    NULLIF(concat(u.first_name, ' ', u.last_name), ' '::text) AS responsible_person,
    smli.quantity AS issued_quantity,
    b.bin_code AS issued_bin,
    p.name AS project_name,
    sm.movement_type,
    smli.created_by,
    smli.tracking_id
   FROM ((((sc.stock_movement_line_item smli
     JOIN sc.stock_movement sm ON ((smli.stock_movement_id = sm.id)))
     LEFT JOIN application."user" u ON ((sm.performed_by_id = u.id)))
     LEFT JOIN sc.bin_management b ON ((sm.from_bin_id = b.id)))
     LEFT JOIN pm.project p ON ((sm.project_id = p.id)))
  WHERE (((sm.movement_type)::text = 'Issued'::text) AND (sm.deleted_by IS NULL) AND (smli.deleted_by IS NULL));


-- ===== 18_sc_purchase_history_vw.sql =====
DROP VIEW IF EXISTS sc.purchase_history_vw CASCADE;

CREATE VIEW sc.purchase_history_vw AS
 SELECT gli.id AS grn_line_item_id,
    gli.part_id,
    grn.grn_number,
    po.number AS po_number,
    grn.received_date,
    gli.received_quantity,
    c.name AS vendor_name,
    p.name AS project_name,
    NULLIF(concat(u.first_name, ' ', u.last_name), ' '::text) AS received_by,
    gli.tracking_id,
    gli.created_by
   FROM (((((sc.grn_line_item gli
     JOIN sc.goods_receipt_note grn ON ((gli.grn_id = grn.id)))
     LEFT JOIN sc.purchase_order po ON ((grn.purchase_order_id = po.id)))
     LEFT JOIN sc.company c ON ((po.company_id = c.id)))
     LEFT JOIN pm.project p ON ((po.project_id = p.id)))
     LEFT JOIN application."user" u ON ((grn.received_by_id = u.id)))
  WHERE ((grn.deleted_by IS NULL) AND (gli.deleted_by IS NULL));


-- ===== 19_sc_purchase_orders_vw.sql =====
DROP VIEW IF EXISTS sc.purchase_orders_vw CASCADE;

CREATE VIEW sc.purchase_orders_vw AS
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
    (((u.first_name)::text || ' '::text) || (COALESCE(u.last_name, ''::character varying))::text) AS manager_full_name
   FROM ((((((((sc.purchase_order po
     LEFT JOIN sc.company c ON (((c.id = po.company_id) AND (c.deleted_by IS NULL))))
     LEFT JOIN sc.payment_term pt ON ((pt.id = po.payment_term_id)))
     LEFT JOIN pm.project pr ON ((pr.id = po.project_id)))
     LEFT JOIN common.address bill_addr ON ((bill_addr.id = po.billing_address_id)))
     LEFT JOIN common.address ship_addr ON ((ship_addr.id = po.shipping_address_id)))
     LEFT JOIN sc.requisition req ON (((req.id = po.requisition_id) AND (req.deleted_by IS NULL))))
     LEFT JOIN common.department d ON ((po.department_id = d.id)))
     LEFT JOIN application."user" u ON ((d.head_of_department_user_id = u.id)))
  WHERE ((po.is_active = true) AND (po.deleted_by IS NULL));


-- ===== 20_sc_requisitions_with_user_vw.sql =====
DROP VIEW IF EXISTS sc.requisitions_with_user_vw CASCADE;

CREATE VIEW sc.requisitions_with_user_vw AS
 SELECT r.id,
    r.req_number,
    r.requested_by_id,
    r.title,
    r.project_id,
    r.request_date,
    r.required_by_date,
    r.justification,
    r.priority,
    r.status,
    r.total_estimated_amount,
    r.created_by,
    r.created_at,
    r.approved_by,
    r.approved_date,
    r.rejected_by,
    r.rejected_date,
    r.approver_comment,
    rb.id AS user_id,
    (((rb.first_name)::text || ' '::text) || (COALESCE(rb.last_name, ''::character varying))::text) AS user_full_name,
    rb.email AS user_email,
    po.id AS po_id,
    po.number AS po_number,
    po.status AS po_status,
    dept.id AS department_id,
    dept.name AS department_name,
    (((mgr.first_name)::text || ' '::text) || (COALESCE(mgr.last_name, ''::character varying))::text) AS manager_full_name
   FROM ((((sc.requisition r
     JOIN application."user" rb ON ((rb.id = r.requested_by_id)))
     LEFT JOIN common.department dept ON ((r.department_id = dept.id)))
     LEFT JOIN application."user" mgr ON (((dept.head_of_department_user_id = mgr.id) AND (mgr.deleted_by IS NULL))))
     LEFT JOIN LATERAL ( SELECT purchase_order.id,
            purchase_order.number,
            purchase_order.status
           FROM sc.purchase_order
          WHERE ((purchase_order.requisition_id = r.id) AND (purchase_order.deleted_by IS NULL) AND ((purchase_order.status)::text <> ALL (ARRAY[('Cancelled'::character varying)::text, ('Rejected'::character varying)::text])))
          ORDER BY purchase_order.created_at DESC
         LIMIT 1) po ON (true))
  WHERE (r.deleted_by IS NULL);


-- ===== 21_sc_scrap_request_with_user_vw.sql =====
DROP VIEW IF EXISTS sc.scrap_request_with_user_vw CASCADE;

CREATE VIEW sc.scrap_request_with_user_vw AS
 SELECT sr.id AS scrap_request_id,
    sr.scrap_number,
    sr.scrap_date,
    sr.reason AS scrap_reason,
    sr.status AS scrap_status,
    sr.is_active,
    sr.created_at,
    sr.created_by,
    sr.updated_at,
    sr.updated_by,
    (((rb.first_name)::text || ' '::text) || (rb.last_name)::text) AS raised_by_full_name,
    rb.email AS raised_by_email,
    loc.id AS location_id,
    loc.number AS location_number,
    loc.name AS location_name,
    po.id AS po_id,
    po.number AS po_number,
    po.order_date AS po_order_date,
    po.status AS po_status,
    grn.id AS grn_id,
    grn.grn_number,
    grn.received_date AS grn_received_date,
    grn.status AS grn_status,
    wo.id AS wo_id,
    wo.number AS work_order_number,
    wo.status AS wo_status,
    sli.id AS line_item_id,
    sli.part_id,
    sli.tracking_type,
    sli.tracking_id,
    sli.scrap_quantity,
    sli.reason AS line_item_reason
   FROM ((((((sc.scrap_request sr
     LEFT JOIN application."user" rb ON ((sr.raised_by_id = rb.id)))
     LEFT JOIN mes.location loc ON ((sr.location_id = loc.id)))
     LEFT JOIN sc.purchase_order po ON ((sr.po_id = po.id)))
     LEFT JOIN sc.goods_receipt_note grn ON ((sr.grn_id = grn.id)))
     LEFT JOIN mes.work_order wo ON ((sr.wo_id = wo.id)))
     LEFT JOIN sc.scrap_line_item sli ON (((sr.id = sli.scrap_request_id) AND (sli.deleted_by IS NULL))))
  WHERE (sr.deleted_by IS NULL);


-- ===== 22_sc_stock_movement_with_user_vw.sql =====
DROP VIEW IF EXISTS sc.stock_movement_with_user_vw CASCADE;

CREATE VIEW sc.stock_movement_with_user_vw AS
 SELECT sm.id AS stock_movement_id,
    sm.movement_number,
    sm.movement_type,
    sm.status,
    sm.movement_reason,
    sm.reference_number,
    sm.notes,
    sm.movement_date,
    sm.expected_return_date,
    sm.project_date,
    sm.from_location_id,
    fl.number AS from_location_number,
    fl.name AS from_location_name,
    sm.to_location_id,
    tl.number AS to_location_number,
    tl.name AS to_location_name,
    sm.from_bin_id,
    fb.bin_code AS from_bin_code,
    fb.aisle AS from_bin_aisle,
    fb.rack AS from_bin_rack,
    sm.to_bin_id,
    tb.bin_code AS to_bin_code,
    tb.aisle AS to_bin_aisle,
    tb.rack AS to_bin_rack,
    sm.work_order_id,
    wo.number AS work_order_number,
    sm.performed_by_id,
    (((u.first_name)::text || ' '::text) || (u.last_name)::text) AS performed_by_full_name,
    u.email AS performed_by_email,
    sm.is_active,
    sm.created_at,
    sm.created_by,
    sm.updated_at,
    sm.updated_by
   FROM ((((((sc.stock_movement sm
     LEFT JOIN application."user" u ON ((sm.performed_by_id = u.id)))
     LEFT JOIN mes.location fl ON ((sm.from_location_id = fl.id)))
     LEFT JOIN mes.location tl ON ((sm.to_location_id = tl.id)))
     LEFT JOIN sc.bin_management fb ON (((sm.from_bin_id = fb.id) AND (fb.deleted_by IS NULL))))
     LEFT JOIN sc.bin_management tb ON (((sm.to_bin_id = tb.id) AND (tb.deleted_by IS NULL))))
     LEFT JOIN mes.work_order wo ON ((sm.work_order_id = wo.id)))
  WHERE (sm.deleted_by IS NULL);


-- ===== 23_sc_vendor_return_request_with_user_vw.sql =====
DROP VIEW IF EXISTS sc.vendor_return_request_with_user_vw CASCADE;

CREATE VIEW sc.vendor_return_request_with_user_vw AS
 SELECT vr.id AS vendor_return_request_id,
    vr.return_number,
    vr.return_date,
    vr.reason AS return_reason,
    vr.status AS return_status,
    vr.is_active,
    vr.created_at,
    vr.created_by,
    vr.updated_at,
    vr.updated_by,
    (((rb.first_name)::text || ' '::text) || (rb.last_name)::text) AS raised_by_full_name,
    rb.email AS raised_by_email,
    vendor.id AS vendor_id,
    vendor.name AS vendor_name,
    loc.id AS location_id,
    loc.number AS location_number,
    loc.name AS location_name,
    po.id AS po_id,
    po.number AS po_number,
    po.order_date AS po_order_date,
    po.status AS po_status,
    grn.id AS grn_id,
    grn.grn_number,
    grn.received_date AS grn_received_date,
    grn.status AS grn_status,
    wo.id AS wo_id,
    wo.number AS work_order_number,
    wo.status AS wo_status,
    vrli.id AS line_item_id,
    vrli.part_id,
    vrli.grn_line_item_id,
    vrli.tracking_type,
    vrli.tracking_id,
    vrli.return_quantity,
    vrli.reason AS line_item_reason
   FROM (((((((sc.vendor_return_request vr
     LEFT JOIN application."user" rb ON ((vr.raised_by_id = rb.id)))
     LEFT JOIN sc.company vendor ON ((vr.vendor_id = vendor.id)))
     LEFT JOIN mes.location loc ON ((vr.location_id = loc.id)))
     LEFT JOIN sc.purchase_order po ON ((vr.po_id = po.id)))
     LEFT JOIN sc.goods_receipt_note grn ON ((vr.grn_id = grn.id)))
     LEFT JOIN mes.work_order wo ON ((vr.wo_id = wo.id)))
     LEFT JOIN sc.vendor_return_line_item vrli ON (((vr.id = vrli.return_request_id) AND (vrli.deleted_by IS NULL))))
  WHERE (vr.deleted_by IS NULL);


