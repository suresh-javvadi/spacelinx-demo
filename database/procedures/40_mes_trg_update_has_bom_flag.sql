-- CREATE OR REPLACE so this repeatable procedure file is re-appliable on every deploy
-- (the pipeline re-runs all procedures each time). Requires PostgreSQL 14+ (target is 16).
CREATE OR REPLACE TRIGGER trg_update_has_bom_flag AFTER INSERT OR DELETE OR UPDATE ON mes.ebom FOR EACH ROW EXECUTE FUNCTION mes.update_has_bom_flag();
