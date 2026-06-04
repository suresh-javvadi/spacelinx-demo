-- CREATE OR REPLACE so this repeatable procedure file is re-appliable on every deploy
-- (the pipeline re-runs all procedures each time). Requires PostgreSQL 14+ (target is 16).
CREATE OR REPLACE TRIGGER part_number_trigger BEFORE INSERT OR UPDATE OF part_type_id ON mes.part FOR EACH ROW EXECUTE FUNCTION mes.generate_part_number();
