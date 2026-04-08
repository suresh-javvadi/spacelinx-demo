1.Create TABLE 

      - CREATE TABLE table_name (
       column1 data_type constraints,
       column2 data_type constraints,
       ...
       );
       eg: CREATE TABLE employees (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			position VARCHAR(50)
		   );
	
2.Create a View

     - CREATE VIEW view_name AS
	   SELECT column1, column2, ...
	   FROM table_name
	   WHERE condition;
	   
3.Add a New Column		

     - ALTER TABLE table_name
       ADD COLUMN new_column_name column_type;
	   
4.Add an Index	   

     - CREATE INDEX index_name ON table_name (column_name);
	   
5.Drop TABLE

     - DROP TABLE table_name;
	 
6.Drop an Existing Column	

     - ALTER TABLE table_name
       DROP COLUMN column_name; 
	 	   
7.Drop a Constraint   
	   
	 - ALTER TABLE table_name
       DROP CONSTRAINT constraint_name;
	   	   
8.Drop a View

     - DROP VIEW view_name;
	 
9.Drop Default Value

     - ALTER TABLE table_name
       ALTER COLUMN column_name DROP DEFAULT;
	   
10.Drop an Index	

	 - DROP INDEX index_name;	   


11.Rename a Table

     - ALTER TABLE old_table_name
       RENAME TO new_table_name;
	   
12.Rename a Column

     - ALTER TABLE table_name
	   RENAME COLUMN old_column_name TO new_column_name;
	   
13.Modify an Existing Column

     - ALTER TABLE table_name
       ALTER COLUMN column_name TYPE new_data_type;
	   
14.Set a Default Value

     - ALTER TABLE table_name
       ALTER COLUMN column_name SET DEFAULT default_value;
	   
15.Insert Data into a Table	 

     - INSERT INTO table_name (column1, column2, ...)
       VALUES (value1, value2, ...);

16.Update Data in a Table
	 
	 - UPDATE table_name
	   SET column1 = value1, column2 = value2, ...
       WHERE condition;
	   
17.Delete Data from Table

     - DELETE FROM table_name
	   WHERE condition;	   
	   
18.Add a New Constraint:

 Primary Key Constraint
 
     - ALTER TABLE table_name
	   ADD CONSTRAINT constraint_name PRIMARY KEY (column_name);
	   
 FOREIGN Key Constraint

     - ALTER TABLE table_name
       ADD CONSTRAINT constraint_name FOREIGN KEY (column_name) REFERENCES other_table (other_column);
	   
19. Show table constraints

     - SELECT constraint_name, constraint_type
       FROM information_schema.table_constraints
       WHERE table_name = 'table_name' AND constraint_type = 'FOREIGN KEY (or) PRIMARY KEY';
	   


20.Get details about the table structure, including columns, types, and constraints

	 - \d+ table_name 
	          (or) 		  
	   SELECT column_name, data_type, is_nullable
	   FROM information_schema.columns
       WHERE table_name = 'table_name';
	  
21.List All Indexes on a Table

     - SELECT indexname, indexdef
       FROM pg_indexes
       WHERE tablename = 'guide';	  
	  
22.Select Data from a Table This SQL query is used to retrieve a list.	 
	 
	 - SELECT column1, column2, ...
	   FROM table_name
       WHERE condition
       ORDER BY column1
       LIMIT number;

23.Check Disk Usage:	   
	 
 Database Size
 
	 - SELECT pg_size_pretty(pg_database_size('xdlinx'));
	 
 Table Size
 
     - SELECT pg_size_pretty(pg_total_relation_size('table_name'));	   	

24.Postgres tool for run in Spacelinx.Model( for getting models and context from postgres)

 run in terminal for installing tool

     - dotnet tool install --global dotnet-ef --version 8.*
	 
 For getting Models and Context

     - dotnet ef dbcontext scaffold "Server=spacelinxdevs.postgres.database.azure.com;Database=xdlinx;Port=5432;User Id=spacelinxuser;Password=xdlinx@009;Ssl Mode=Require;" Npgsql.EntityFrameworkCore.PostgreSQL --schema mes --schema  application  -p SpaceLinx.Model --force

25.To terminate active connections to a specific PostgreSQL database

     - SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity 
       WHERE pg_stat_activity.datname = 'xdlinx_prod' AND pid <> pg_backend_pid();

26.For Creating Database 

     - CREATE DATABASE xdlinx_prod_backup_14Aug2024 WITH TEMPLATE xdlinx_prod;

27.Used to create a new user in PostgreSQL with a specified password.

	 - CREATE USER spacelinxuser WITH PASSWORD 'your_password';

28.To retrieve all columns (*) from a table (Table_name) where the id column matches a specific value ('id').
	 
     - SELECT * FROM Table_name where id = 'id'
	 
29.To update a specific row in the table, setting the sequence column to a new integer value (2) for the row where the id matches a given UUID.
	 
	 - UPDATE Table-name SET
       sequence = '2'::integer WHERE
       id = 'id';

30.To update file path references in the mes.image table by replacing occurrences of a specific substring. It is particularly useful when transitioning between different environments or correcting file path references in the database.

     - UPDATE mes.image
       SET file_path = REPLACE(file_path, 'spacelinxprod.blob', 'spacelinxuat.blob')
       WHERE file_path LIKE '%spacelinxprod.blob%';

31.To update records in the mes.guide_step_task table within a PostgreSQL database. 	
    (This part of the command sets the value of the taskdetails column to a specific JSON object for all rows that match the WHERE condition)
	
      - UPDATE mes.guide_step_task
        SET taskdetails = '{"dataType":null,"assembly":null,"test":null,"picture":{"value":1,"response":null},"genealogy":null}'
        WHERE type = 'Picture';
	  - UPDATE mes.guide_step_task
        SET taskdetails = '{"dataType":null,"assembly":{"value":1,"response":null},"test":null,"picture":null,"genealogy":null}'
        WHERE type = 'Assembly';

32.This function is used to generate alphanumeric sequences with a specific prefix and a formatted sequence number. It is useful for creating unique identifiers or codes that combine a prefix with a sequential number.

     - CREATE OR REPLACE FUNCTION application.generate_alphanumeric_sequence(prefix VARCHAR(255), seq_num BIGINT) RETURNS VARCHAR(255) AS $$
       BEGIN
         RETURN prefix || TO_CHAR(seq_num, 'FM00000000');
       END;
	   $$ LANGUAGE plpgsql;
	   
33.This command alters the number column in table_name so that, by default, it automatically uses the generate_alphanumeric_sequence function to set its value.
	   
	 - ALTER TABLE table_name
       ALTER COLUMN number SET DEFAULT application.generate_alphanumeric_sequence('GD-', nextval('mes.table_name_number_seq'));

34.Grant various privileges to a PostgreSQL user (or role) of 	spacelinxuser

	 - GRANT ALL PRIVILEGES ON DATABASE xdlinx_uat TO spacelinxuser;
       GRANT ALL ON SCHEMA mes TO spacelinxuser;
       GRANT ALL ON SCHEMA application TO spacelinxuser;
 
       GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA mes TO spacelinxuser;
       GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA mes TO spacelinxuser;
       GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA mes TO spacelinxuser;

35.To set default privileges for future objects (tables, sequences, and functions) 
	   
     - ALTER DEFAULT PRIVILEGES IN SCHEMA application GRANT ALL PRIVILEGES ON TABLES TO spacelinxuser;
       ALTER DEFAULT PRIVILEGES IN SCHEMA application GRANT ALL PRIVILEGES ON SEQUENCES TO spacelinxuser;
       ALTER DEFAULT PRIVILEGES IN SCHEMA application GRANT ALL PRIVILEGES ON FUNCTIONS TO spacelinxuser;
 
       ALTER DEFAULT PRIVILEGES IN SCHEMA mes GRANT ALL PRIVILEGES ON TABLES TO spacelinxuser;
       ALTER DEFAULT PRIVILEGES IN SCHEMA mes GRANT ALL PRIVILEGES ON SEQUENCES TO spacelinxuser;
       ALTER DEFAULT PRIVILEGES IN SCHEMA mes GRANT ALL PRIVILEGES ON FUNCTIONS TO spacelinxuser;
		
36.When we want to assign or update the sequence number of tasks (guide_step_task) within the same guide_step_id, based on the order they were created.

	 - WITH RankedTasks AS (
        SELECT 
          id,
          guide_step_id,
          created_at,
         ROW_NUMBER() OVER (PARTITION BY guide_step_id ORDER BY created_at) AS seq
        FROM 
         mes.guide_step_task
        )
        UPDATE mes.guide_step_task
        SET sequence = RankedTasks.seq
        FROM RankedTasks
        WHERE mes.guide_step_task.id = RankedTasks.id;

37.Truncate data from all tables in schema

DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    -- Loop through all tables in the 'mes' schema
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'mes'
    ) 
    LOOP 
        -- Print the table name before truncating
        RAISE NOTICE 'Truncating table: mes.%', r.tablename;
 
        -- Truncate the table without resetting identity (avoids sequence issues)
        EXECUTE 'TRUNCATE TABLE mes.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
 
    RAISE NOTICE 'All tables in the mes schema have been truncated successfully.';
END $$;
		
38.To Change DataType into Geomtry.

ALTER TABLE imagery.request
ALTER COLUMN coverage_area TYPE geometry USING coverage_area::geometry;

39.Permissions

    GRANT ALL PRIVILEGES ON DATABASE spacelinx_uat TO spacelinxuser;
    GRANT ALL ON SCHEMA mes TO spacelinxuser;
    GRANT ALL ON SCHEMA application TO spacelinxuser;
    GRANT ALL ON SCHEMA common TO spacelinxuser;
 
    GRANT ALL PRIVILEGES ON DATABASE spacelinx_uat TO spacelinxadmin;
    GRANT ALL ON SCHEMA mes TO spacelinxadmin;
    GRANT ALL ON SCHEMA application TO spacelinxadmin;
    GRANT ALL ON SCHEMA common TO spacelinxadmin;
 
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA mes TO spacelinxuser;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA mes TO spacelinxuser;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA mes TO spacelinxuser;
 
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA common TO spacelinxuser;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA common TO spacelinxuser;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA common TO spacelinxuser;
 
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA application TO spacelinxuser;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA application TO spacelinxuser;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA application TO spacelinxuser;
 
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA mes TO spacelinxadmin;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA mes TO spacelinxadmin;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA mes TO spacelinxadmin;
 
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA common TO spacelinxadmin;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA common TO spacelinxadmin;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA common TO spacelinxadmin;
 
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA application TO spacelinxadmin;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA application TO spacelinxadmin;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA application TO spacelinxadmin;

    ALTER DEFAULT PRIVILEGES IN SCHEMA application GRANT ALL PRIVILEGES ON TABLES TO spacelinxuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA application GRANT ALL PRIVILEGES ON SEQUENCES TO spacelinxuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA application GRANT ALL PRIVILEGES ON FUNCTIONS TO spacelinxuser;

    ALTER DEFAULT PRIVILEGES IN SCHEMA mes GRANT ALL PRIVILEGES ON TABLES TO spacelinxuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA mes GRANT ALL PRIVILEGES ON SEQUENCES TO spacelinxuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA mes GRANT ALL PRIVILEGES ON FUNCTIONS TO spacelinxuser;
 
    ALTER DEFAULT PRIVILEGES IN SCHEMA common GRANT ALL PRIVILEGES ON TABLES TO spacelinxuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA common GRANT ALL PRIVILEGES ON SEQUENCES TO spacelinxuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA common GRANT ALL PRIVILEGES ON FUNCTIONS TO spacelinxuser;
 
    ALTER DEFAULT PRIVILEGES IN SCHEMA application GRANT ALL PRIVILEGES ON TABLES TO spacelinxadmin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA application GRANT ALL PRIVILEGES ON SEQUENCES TO spacelinxadmin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA application GRANT ALL PRIVILEGES ON FUNCTIONS TO spacelinxadmin;

    ALTER DEFAULT PRIVILEGES IN SCHEMA mes GRANT ALL PRIVILEGES ON TABLES TO spacelinxadmin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA mes GRANT ALL PRIVILEGES ON SEQUENCES TO spacelinxadmin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA mes GRANT ALL PRIVILEGES ON FUNCTIONS TO spacelinxadmin;
 
    ALTER DEFAULT PRIVILEGES IN SCHEMA common GRANT ALL PRIVILEGES ON TABLES TO spacelinxadmin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA common GRANT ALL PRIVILEGES ON SEQUENCES TO spacelinxadmin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA common GRANT ALL PRIVILEGES ON FUNCTIONS TO spacelinxadmin;

40.To update user_role is_active false to is_active true 

    UPDATE application.user_role
    SET is_active = 'true'
    WHERE is_active = 'false';

41.Find all rows in mes.part where part_number_suffix is NULL (i.e., missing).For each such row, it will call mes.generate_part_number(part_type_id) and set the suffix.

    UPDATE mes.part
    SET part_number_suffix = mes.generate_part_number(part_type_id)
    WHERE part_number_suffix IS NULL;

42.Script is used for soft delete implementation it will add deleted_at and deleted_by in all tables in database id doesnot EXISTS.

    DO $$
    DECLARE
        rec RECORD;
        sql_text TEXT;
    BEGIN
        FOR rec IN
            SELECT schemaname, tablename
            FROM pg_tables
            WHERE schemaname NOT IN ('pg_catalog', 'information_schema')  -- skip system schemas
        LOOP
            sql_text := format(
                'ALTER TABLE %I.%I 
                ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
                ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);',
                rec.schemaname, rec.tablename
            );
            RAISE NOTICE '%', sql_text;  -- prints the statement for verification
            EXECUTE sql_text;
        END LOOP;
    END
    $$;

43.This constraint ensures that manufacturing_part_number cannot be NULL for parts where: make_buy = 1 → (Manufacturing part)

    ALTER TABLE mes.part
    ADD CONSTRAINT chk_manufacturing_part_number_required
    CHECK (
        (make_buy <> 1) OR (manufacturing_part_number IS NOT NULL)
    );

44.This constraint ensures that manufacturing_part_number and cannot be NULL, empty or spaces  for parts where: make_buy = 1 → (Manufacturing part)

    ALTER TABLE mes.part
    ADD CONSTRAINT chk_manufacturing_part_number_required
    CHECK (
        (make_buy <> 1) OR (manufacturing_part_number IS NOT NULL AND TRIM(manufacturing_part_number) <> '')
    );
 
45.This query identifies all rows that violate the manufacturing part rules, i.e., missing or blank manufacturing part numbers.

    SELECT id, part_number, name, make_buy, manufacturing_part_number
    FROM mes.part
    WHERE make_buy = 1 
    AND (manufacturing_part_number IS NULL OR TRIM(manufacturing_part_number) = '');
    
46.This Update  manufacturing_part_number like TEMP-MPN-part_number(TEMP-MPN-879-00001-01)

    UPDATE mes.part
    SET manufacturing_part_number = 'TEMP-MPN-' || part_number
    WHERE make_buy = 1 
    AND (manufacturing_part_number IS NULL OR TRIM(manufacturing_part_number) = '');

47.Counts how many parts are missing manufacturer_name for make_buy = 1.

    SELECT COUNT(*) 
    FROM mes.part
    WHERE make_buy = 1
    AND (manufacturer_name IS NULL OR TRIM(manufacturer_name) = '');
 
48.This Update  manufacturer_name like Please enter manufacturer name where manufacturer_name is null

    UPDATE mes.part
    SET manufacturer_name = 'Please enter manufacturer name'
    WHERE make_buy = 1
    AND (manufacturer_name IS NULL OR TRIM(manufacturer_name) = '');

49.This constraint enforces both fields for manufacturing parts should not be null when MakeBuy is 1.

    ALTER TABLE mes.part
    Add CONSTRAINT chk_manufacturer_details_required CHECK (
            (make_buy = 1 AND manufacturing_part_number IS NOT NULL AND TRIM(manufacturing_part_number) <> '' 
                        AND manufacturer_name IS NOT NULL AND TRIM(manufacturer_name) <> '')
            OR make_buy = 0
        )

50.Select ebom based on part_id

    SELECT * FROM mes.ebom
    where part_id = ''
 
51.Delete ebom based on part_id

    DELETE FROM mes.ebom
    WHERE part_id = '';
 
52.Select ebom based on part_number

    SELECT * FROM mes.part
    where part_number = ''   

53.Update trl = 0 and space_qualified = true and Updated_at and updated_by = system 

    UPDATE mes.part
    SET 
        trl = 9,
        space_qualified = TRUE,
        updated_at = NOW(),
        updated_by = 'System';   

54.This script is used for bulk updating part_type_id values in the mes.part table based on a mapping of part numbers to new part type names, while logging every change for audit and traceability.

    -- Step 1: Create log table if not exists

        CREATE TABLE IF NOT EXISTS mes.part_update_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            old_part_number VARCHAR(255),
            new_part_number VARCHAR(255),
            old_part_type_id UUID,
            new_part_type_id UUID,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_by VARCHAR(255)
        );

    -- Step 2: Create temp mapping table
        CREATE TEMP TABLE temp_part_type_mapping (
            part_number VARCHAR(255),
            part_type_name VARCHAR(255)
        );

    -- Step 3: Insert mapping data
        -- Example:
        INSERT INTO temp_part_type_mapping (part_number, part_type_name) VALUES
        ('850-00609-01', 'SPRING'),
        ('850-00608-01', 'SPRING'),
        -- ... continue for all rows
        ;

    -- Step 4: Capture and update
        WITH part_changes AS (
            SELECT 
                p.id,
                p.part_number AS old_part_number,
                p.part_type_id AS old_part_type_id,
                pt.id AS new_part_type_id
            FROM mes.part p
            JOIN temp_part_type_mapping tmp ON p.part_number = tmp.part_number
            JOIN mes.part_type pt ON pt.name = tmp.part_type_name
            WHERE p.part_type_id IS DISTINCT FROM pt.id
        ),
        updated AS (
            UPDATE mes.part p
            SET part_type_id = pc.new_part_type_id,
                updated_at = CURRENT_TIMESTAMP,
                updated_by = 'system_script'
            FROM part_changes pc
            WHERE p.id = pc.id
            RETURNING p.id, p.part_number AS new_part_number
        )

    -- Step 5: Log changes
        INSERT INTO mes.part_update_log (
            old_part_number,
            new_part_number,
            old_part_type_id,
            new_part_type_id,
            updated_by
        )
        SELECT 
            pc.old_part_number,
            u.new_part_number,
            pc.old_part_type_id,
            pc.new_part_type_id,
            'system_script'
        FROM part_changes pc
        JOIN updated u ON pc.id = u.id;        

55.This Excel formula is used to auto-generate SQL UPDATE statements for PostgreSQL based on values stored in Excel.

    ="UPDATE mes.part SET material = '"&C4&"' WHERE part_number = '"&A4&"';"

    ="UPDATE mes.part SET manufacturing_part_number = '"&C2&"', manufacturer_name = "&IF(D2="","NULL","'"&D2&"'")&" WHERE part_number = '"&A2&"';"

    ="UPDATE mes.part SET material = '"&C3&"' WHERE part_number = '"&A3&"';"
 
    EXAMPLE:
    Part Number	        Part Name	        Material	 formula
    875-00344-01	Strut_Support _Small 	AL 6061 T6	UPDATE mes.part SET material = 'AL 6061 T6' WHERE part_number = '875-00344-01';

56.This formula is used to generate SQL INSERT ... SELECT statements dynamically in Excel, for populating the mes.ebom (Engineering Bill of Materials) table.

    = TEXTJOIN("", TRUE, "INSERT INTO mes.ebom (part_id, child_part_id, quantity, created_by) ", "SELECT p_parent.id AS part_id, p_child.id AS child_part_id, ",B50, " AS quantity, '", C50, "' AS created_by ","FROM mes.part p_parent JOIN mes.part p_child ON TRUE ","WHERE p_parent.part_number = '820-00021-01' ","AND p_child.part_number = '", A50, "';")

Example:
child_part_id quantity created_by)                     Formula
120-00105-01	47	System	INSERT INTO mes.ebom (part_id, child_part_id, quantity, created_by) SELECT p_parent.id AS part_id, p_child.id AS child_part_id, 47 AS quantity, 'System' AS created_by FROM mes.part p_parent JOIN mes.part p_child ON TRUE WHERE p_parent.part_number = '820-00021-01' AND p_child.part_number = '120-00105-01';

57.Each row of the user table will generate a full INSERT statement,COALESCE(..., 'NULL') handles NULL values so the script is valid,Strings are wrapped in single quotes ' and Booleans, numbers, and UUIDs are handled correctly.(To Generate exisiting data Insert Statement)

SELECT 'INSERT INTO application.user (id, user_number, first_name, last_name, email, phone, is_active, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by) VALUES ('
       || '''' || id || '''' || ', '
       || user_number || ', '
       || '''' || first_name || '''' || ', '
       || COALESCE('''' || last_name || '''', 'NULL') || ', '
       || '''' || email || '''' || ', '
       || COALESCE('''' || phone || '''', 'NULL') || ', '
       || is_active || ', '
       || '''' || created_at || '''' || ', '
       || '''' || created_by || '''' || ', '
       || COALESCE('''' || updated_at || '''', 'NULL') || ', '
       || COALESCE('''' || updated_by || '''', 'NULL') || ', '
       || COALESCE('''' || deleted_at || '''', 'NULL') || ', '
       || COALESCE('''' || deleted_by || '''', 'NULL') || ') '
       || 'ON CONFLICT (email) DO NOTHING;'
FROM application.user;                      ---'done''

58.For CONFLICT skips the row if the email already exists.

INSERT INTO application.user (
    id, user_number, first_name, last_name, email, phone, is_active, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by
)
VALUES
    (gen_random_uuid(), DEFAULT, 'John', 'Doe', 'john.doe@example.com', '1234567890', TRUE, CURRENT_TIMESTAMP, 'admin', NULL, NULL, NULL, NULL),
    (gen_random_uuid(), DEFAULT, 'Jane', 'Smith', 'jane.smith@example.com', '9876543210', TRUE, CURRENT_TIMESTAMP, 'admin', NULL, NULL, NULL, NULL)
ON CONFLICT (email) DO NOTHING;

59. Identify the Super Admin role

(Adjust role_name if your actual name differs)

SELECT id
FROM application.role
WHERE role_name = 'Super Admin'
  AND is_active = TRUE
  AND deleted_at IS NULL;

60. Find users without any active role

SELECT u.id
FROM application.user u
LEFT JOIN application.user_role ur
       ON ur.user_id = u.id
      AND ur.is_active = TRUE
      AND ur.deleted_at IS NULL
WHERE ur.id IS NULL
  AND u.is_active = TRUE
  AND u.deleted_at IS NULL;


These users currently have no role assigned.

61. Assign Super Admin role to those users Recommended INSERT query

(This will only assign the role to users who have none)

INSERT INTO application.user_role (
    id,
    user_id,
    role_id,
    is_active,
    is_default,
    created_at,
    created_by
)
SELECT
    gen_random_uuid(),
    u.id,
    r.id,
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    'system'
FROM application.user u
LEFT JOIN application.user_role ur
       ON ur.user_id = u.id
      AND ur.is_active = TRUE
      AND ur.deleted_at IS NULL
CROSS JOIN (
    SELECT id
    FROM application.role
    WHERE role_name = 'Super Admin'
      AND is_active = TRUE
      AND deleted_at IS NULL
    LIMIT 1
) r
WHERE ur.id IS NULL
  AND u.is_active = TRUE
  AND u.deleted_at IS NULL;

62. Verification query

SELECT u.email, r.role_name
FROM application.user u
JOIN application.user_role ur ON ur.user_id = u.id
JOIN application.role r ON r.id = ur.role_id
WHERE ur.is_active = TRUE
  AND ur.deleted_at IS NULL;

 Result
Any user without a role → now gets Super Admin