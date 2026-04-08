CREATE TRIGGER part_number_trigger
BEFORE INSERT OR UPDATE OF part_type_id ON mes.part
FOR EACH ROW
EXECUTE FUNCTION mes.generate_part_number();
