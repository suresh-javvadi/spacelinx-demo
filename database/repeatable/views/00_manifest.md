# Repeatable Views — Apply Manifest

The CI apply creates views in the order listed below; it drops them in the REVERSE order.

Numbering guarantees every view is created AFTER any view it depends on.

## Apply order

- 01_common_document_with_users_vw.sql
- 02_mes_eco_with_users_vw.sql
- 03_mes_guide_mbom_vw.sql
- 04_mes_guide_mbom_details.sql
- 05_mes_parts_not_associated_with_guides.sql
- 06_mes_workorderguidestepsview.sql
- 07_pm_resource_workload_vw.sql
- 08_pm_task_gantt_vw.sql
- 09_sc_company_with_organization_vw.sql
- 10_sc_grn_with_user_vw.sql
- 11_sc_grns_by_purchase_order_vw.sql
- 12_sc_inventory_goods_vw.sql
- 13_sc_inventory_part_price_vw.sql
- 14_sc_inventory_part_vw.sql
- 15_sc_inventory_services_vw.sql
- 16_sc_inventory_transaction_vw.sql
- 17_sc_issue_history_vw.sql
- 18_sc_purchase_history_vw.sql
- 19_sc_purchase_orders_vw.sql
- 20_sc_requisitions_with_user_vw.sql
- 21_sc_scrap_request_with_user_vw.sql
- 22_sc_stock_movement_with_user_vw.sql
- 23_sc_vendor_return_request_with_user_vw.sql
- 24_sc_inventory_stock_ledger_vw.sql

## View dependency edges

Determined by scanning each view body for `FROM`/`JOIN <schema>.<otherview>` references.

- `mes.guide_mbom_details` → depends on `mes.guide_mbom_vw` (references `mes.guide_mbom_vw` in its FROM clause). `guide_mbom_vw` is `03_mes_guide_mbom_vw.sql`; `guide_mbom_details` is `04_mes_guide_mbom_details.sql`.

All other 21 views reference only base tables (no view-to-view dependencies).

Note: PostgreSQL's pg_dump emitted `sc.grns_by_purchase_order_vw` first as a placeholder stub (all `NULL::<type>` columns, no FROM) and later redefined it via `CREATE OR REPLACE VIEW`. The real (redefined) body is used here; it references only base tables (`sc.goods_receipt_note`, `application."user"`, `mes.location`, `sc.grn_line_item`, `mes.part`, `sc.company`) and has no view dependency.

