CREATE OR REPLACE PROCEDURE mes.import_news(
	IN records jsonb[],
	IN user_email text,
	OUT results jsonb)
LANGUAGE 'plpgsql'
AS $$
DECLARE
    news_item jsonb;
    news_name TEXT;
    news_type_name TEXT;
    news_type_id UUID;
    news_hyperlink TEXT;
    news_origin TEXT;
	news_url TEXT;
    valid BOOLEAN;
    local_error_message TEXT;
    result jsonb;
    index INT;
BEGIN
    -- Initialize the results as an empty JSON array
    results := '[]'::jsonb;

    -- Loop through the array of news items
    FOR index IN 1 .. array_length(records, 1) LOOP
        news_item := records[index];
        valid := TRUE;
        local_error_message := NULL;

        news_name := news_item->>'Name';
        news_type_name := news_item->>'Type';
        news_hyperlink := news_item->>'Hyperlink';
        news_origin := news_item->>'Origin';
		news_url := COALESCE(news_item->>'Image URL', '');

        -- Validate news_name and news_hyperlink (both are required)
        IF news_name IS NULL OR news_name = '' THEN
            local_error_message := 'News name is required';
            valid := FALSE;
        END IF;

        IF news_hyperlink IS NULL OR news_hyperlink = '' THEN
            local_error_message := 'Hyperlink is required';
            valid := FALSE;
        END IF;

        -- Validate and/or create news_type (based on news_type_name)
        IF news_type_name IS NULL OR news_type_name = '' THEN
            local_error_message := 'News type is required';
            valid := FALSE;
        ELSE
            -- Try to find the news type by name
            SELECT id INTO news_type_id FROM mes.news_type WHERE name = news_type_name;

            -- If the news type doesn't exist, create a new one
            IF news_type_id IS NULL THEN
                INSERT INTO mes.news_type (name, created_by, created_at)
                VALUES (news_type_name, user_email, NOW()) RETURNING id INTO news_type_id;
            END IF;
        END IF;

        -- If everything is valid, insert the news into the table
        IF valid THEN
            INSERT INTO mes.news (title, news_type_id, hyperlink, origin, image, created_by, created_at)
            VALUES (news_name, news_type_id, news_hyperlink, news_origin, news_url, user_email, NOW());
			
            -- Record validation failure in the results
            result := jsonb_build_object('row_number', index, 'error_message', local_error_message);
        END IF;

        -- Append the result to the results array
        results := results || jsonb_build_array(result);
    END LOOP;
END;
$$;
