# Functions / Procedures / Triggers — Apply Manifest

Versioned (run-once) routines extracted from the UAT schema dump.

The 14/15 `generate_*` baseline functions are NOT here — they are already embedded in the Baseline EF migration (column defaults call them) and must not be duplicated.

## Apply order

- 01_application_delete_user_role.sql  (PROCEDURE)
- 02_application_get_user_roles.sql  (PROCEDURE)
- 03_application_set_default_role.sql  (PROCEDURE)
- 04_mes_release_eco.sql  (PROCEDURE)
- 05_mes_approve_eco.sql  (PROCEDURE)
- 06_mes_clone_ebom.sql  (PROCEDURE)
- 07_mes_clone_guide.sql  (PROCEDURE)
- 08_mes_consume_inventory_for_kit.sql  (PROCEDURE)
- 09_mes_reorder_guide_steps.sql  (PROCEDURE)
- 10_mes_copy_guide_step.sql  (PROCEDURE)
- 11_mes_create_draft_guide.sql  (PROCEDURE)
- 12_mes_create_guide_ebom.sql  (PROCEDURE)
- 13_mes_create_guide_mbom.sql  (PROCEDURE)
- 14_mes_create_material_kit_and_kits.sql  (PROCEDURE)
- 15_mes_create_work_package_and_work_orders.sql  (PROCEDURE)
- 16_mes_discard_eco.sql  (PROCEDURE)
- 17_mes_generate_part_number.sql  (FUNCTION)
- 18_mes_get_part_sequence.sql  (PROCEDURE)
- 19_mes_guide_mbom_refresh.sql  (PROCEDURE)
- 20_mes_import_ebom.sql  (PROCEDURE)
- 21_mes_import_locations.sql  (PROCEDURE)
- 22_mes_import_machines.sql  (PROCEDURE)
- 23_mes_import_news.sql  (PROCEDURE)
- 24_mes_import_parts.sql  (PROCEDURE)
- 25_mes_import_tools.sql  (PROCEDURE)
- 26_mes_is_eco_valid_for_submit.sql  (PROCEDURE)
- 27_mes_reorder_guide_step_tasks.sql  (PROCEDURE)
- 28_mes_reorder_guide_steps_after_deletion.sql  (PROCEDURE)
- 29_mes_reserve_inventory_for_kit.sql  (PROCEDURE)
- 30_mes_reset_work_order.sql  (PROCEDURE)
- 31_mes_reset_work_order_step.sql  (PROCEDURE)
- 32_mes_revert_inventory_for_kit.sql  (PROCEDURE)
- 33_mes_update_has_bom_flag.sql  (FUNCTION)
- 34_mes_update_status_to_approved.sql  (FUNCTION)
- 35_mes_validate_part_deletion.sql  (PROCEDURE)
- 36_mes_validate_record.sql  (PROCEDURE)
- 37_pm_create_default_board_columns.sql  (FUNCTION)
- 38_sc_generate_tender_number.sql  (FUNCTION)
- 39_mes_part_number_trigger.sql  (TRIGGER)
- 40_mes_trg_update_has_bom_flag.sql  (TRIGGER)

## Ordering notes

- `release_eco` is placed before `approve_eco` (approve_eco CALLs release_eco).
- `reorder_guide_steps` is placed before `copy_guide_step` (copy_guide_step CALLs reorder_guide_steps).
- Trigger functions `mes.generate_part_number` and `mes.update_has_bom_flag` are created before the `CREATE TRIGGER` statements that reference them.
- All remaining routines are independent and kept in schema-dump order.

