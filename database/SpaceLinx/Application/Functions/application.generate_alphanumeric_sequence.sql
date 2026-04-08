CREATE OR REPLACE FUNCTION application.generate_alphanumeric_sequence(prefix VARCHAR(255), seq_num BIGINT) RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN prefix || TO_CHAR(seq_num, 'FM00000000');
END;
$$ LANGUAGE plpgsql;
