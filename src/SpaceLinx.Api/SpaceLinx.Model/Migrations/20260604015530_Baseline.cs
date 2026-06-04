using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpaceLinx.Model.Migrations
{
    /// <inheritdoc />
    public partial class Baseline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "common");

            migrationBuilder.EnsureSchema(
                name: "application");

            migrationBuilder.EnsureSchema(
                name: "mes");

            migrationBuilder.EnsureSchema(
                name: "sc");

            migrationBuilder.EnsureSchema(
                name: "pm");

            migrationBuilder.CreateSequence<int>(
                name: "app_app_number_seq",
                schema: "application");

            migrationBuilder.CreateSequence(
                name: "company_code_seq",
                schema: "sc");

            migrationBuilder.CreateSequence(
                name: "customer_code_seq",
                schema: "sc");

            migrationBuilder.CreateSequence(
                name: "grn_seq",
                schema: "sc");

            migrationBuilder.CreateSequence<int>(
                name: "guide_sequence_seq",
                schema: "mes");

            migrationBuilder.CreateSequence<int>(
                name: "material_kit_sequence_seq",
                schema: "mes");

            migrationBuilder.CreateSequence(
                name: "partner_code_seq",
                schema: "sc");

            migrationBuilder.CreateSequence<int>(
                name: "product_sequence_seq",
                schema: "mes");

            migrationBuilder.CreateSequence(
                name: "program_code_seq",
                schema: "pm");

            migrationBuilder.CreateSequence(
                name: "project_code_seq",
                schema: "pm");

            migrationBuilder.CreateSequence(
                name: "purchase_order_seq",
                schema: "sc");

            migrationBuilder.CreateSequence(
                name: "req_seq",
                schema: "sc");

            migrationBuilder.CreateSequence<int>(
                name: "role_role_number_seq",
                schema: "application");

            migrationBuilder.CreateSequence(
                name: "scrap_number_seq",
                schema: "sc");

            migrationBuilder.CreateSequence(
                name: "task_code_seq",
                schema: "pm");

            migrationBuilder.CreateSequence<int>(
                name: "user_user_number_seq",
                schema: "application");

            migrationBuilder.CreateSequence(
                name: "vendor_code_seq",
                schema: "sc");

            migrationBuilder.CreateSequence(
                name: "vendor_return_number_seq",
                schema: "sc");

            migrationBuilder.CreateSequence<int>(
                name: "work_package_sequence_seq",
                schema: "mes");

            // Pre-table functions: these must exist before any CreateTable that references them as column defaults.
            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION application.generate_alphanumeric_sequence(prefix character varying, seq_num bigint) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN prefix || TO_CHAR(seq_num, 'FM00000000');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION mes.generate_eco_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    max_code INT;
    new_code VARCHAR(50);
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 5) AS INT)), 0) INTO max_code
    FROM mes.eco;

    new_code := 'ECO-' || LPAD((max_code + 1)::TEXT, 8, '0');

    RETURN new_code;
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION pm.generate_program_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('pm.program_code_seq');

    -- Return the formatted program_code as 'PRG-000001', 'PRG-000002', etc.
    RETURN 'PRG-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION pm.generate_project_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('pm.project_code_seq');

    -- Return the formatted project_code as 'PGJ-000001', 'PGJ-000002', etc.
    RETURN 'PRJ-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION pm.generate_task_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('pm.task_code_seq');
    -- Return the formatted task_code as 'TSK-000001', 'TSK-000002', etc.
    RETURN 'TSK-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION sc.generate_company_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.company_code_seq');

    -- Return formatted program number
    RETURN 'COM-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION sc.generate_customer_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.customer_code_seq');

    -- Return formatted program number
    RETURN 'CUS-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION sc.generate_grn_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
    current_year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
BEGIN
    -- Get the next value from the sequence
    next_val := nextval('sc.grn_seq');

    -- Return the formatted GRN number as 'GRN-2025-0001', 'GRN-2025-0002', etc.
    RETURN 'GRN-' || current_year || '-' || LPAD(next_val::TEXT, 4, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION sc.generate_partner_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.partner_code_seq');

    -- Return formatted program number
    RETURN 'P-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION sc.generate_purchase_order_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Get next value from the sequence
    next_val := nextval('sc.purchase_order_seq');

    -- Return the formatted purchase order number as 'PO-000001', 'PO-000002', etc.
    RETURN 'PO-' || LPAD(next_val::TEXT, 6, '0');

END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION sc.generate_req_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val BIGINT;
    current_year TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
BEGIN
    -- Get next value from the requisition sequence
    next_val := nextval('sc.req_seq');

    -- Return formatted requisition number like 'REQ-2025-0001'
    RETURN 'REQ-' || current_year || '-' || LPAD(next_val::TEXT, 4, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION sc.generate_scrap_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    next_val := nextval('sc.scrap_number_seq');
    RETURN 'SCR-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION sc.generate_stock_movement_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INTEGER;
    prefix TEXT := 'SM-';
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(movement_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_val
    FROM sc.stock_movement
    WHERE movement_number LIKE 'SM-%';
    RETURN prefix || LPAD(next_val::TEXT, 6, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION sc.generate_vendor_code() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    -- Get the next sequence value
    next_val := nextval('sc.vendor_code_seq');

    -- Return formatted program number
    RETURN 'VEN-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;");

            migrationBuilder.Sql(@"CREATE OR REPLACE FUNCTION sc.generate_vendor_return_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    next_val := nextval('sc.vendor_return_number_seq');

    RETURN 'VRN-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;");

            migrationBuilder.CreateTable(
                name: "additional_recipient_configuration",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    is_active = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    template_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    recipient_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    recipient_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("additional_recipient_configuration_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "app",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    app_number = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "nextval('application.app_app_number_seq'::regclass)"),
                    app_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("app_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "approval_configuration",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    number_of_levels = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    description = table.Column<string>(type: "text", nullable: true),
                    require_sequential_approval = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("approval_configuration_pkey", x => x.id);
                    table.CheckConstraint("chk_number_of_levels_positive", "(number_of_levels > 0)");
                });

            migrationBuilder.CreateTable(
                name: "approval_log",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    action_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    action_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    stage_number = table.Column<int>(type: "integer", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    previous_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    new_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("approval_log_pkey", x => x.id);
                    table.CheckConstraint("chk_stage_number_positive", "((stage_number IS NULL) OR (stage_number > 0))");
                });

            migrationBuilder.CreateTable(
                name: "assembly_location",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("assembly_location_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "bulk_upload",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    application_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'All'::character varying"),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    requested_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    requested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    error = table.Column<string>(type: "json", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    total_count = table.Column<int>(type: "integer", nullable: true),
                    success_count = table.Column<int>(type: "integer", nullable: true),
                    failed_count = table.Column<int>(type: "integer", nullable: true),
                    url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("bulk_upload_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "country",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    iso2_code = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    iso3_code = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    numeric_code = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("country_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "currency",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    code = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    symbol = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    minor_unit = table.Column<int>(type: "integer", nullable: true, defaultValue: 2),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("currency_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "document",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    document_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    file_extension = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    file_size = table.Column<long>(type: "bigint", nullable: true),
                    file_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    file_relative_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    external_url = table.Column<string>(type: "text", nullable: true),
                    mime_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    tags = table.Column<List<string>>(type: "text[]", nullable: true),
                    metadata = table.Column<string>(type: "jsonb", nullable: true),
                    document_storage_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("document_pkey", x => x.id);
                    table.CheckConstraint("chk_document_storage_type", "((document_storage_type)::text = ANY (ARRAY[('uploaded'::character varying)::text, ('external_url'::character varying)::text]))");
                });

            migrationBuilder.CreateTable(
                name: "eco",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "mes.generate_eco_number()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    reason_for_change = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    change_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    impact_analysis = table.Column<string>(type: "text", nullable: true),
                    priority = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Low'::character varying"),
                    requestor = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    approver = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    planned_implementation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    approved_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Draft'::character varying"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("eco_pkey", x => x.id);
                    table.CheckConstraint("eco_status_check", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Discarded'::character varying)::text, ('Rejected'::character varying)::text, ('Released'::character varying)::text]))");
                });

            migrationBuilder.CreateTable(
                name: "email_log",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    is_active = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    template_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    recipient_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    sent_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    error_message = table.Column<string>(type: "text", nullable: true),
                    retry_count = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("email_log_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "email_template",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    is_active = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    template_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    subject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_html = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("email_template_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "fcm_token",
                schema: "common",
                columns: table => new
                {
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    device_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    id = table.Column<Guid>(type: "uuid", nullable: true, defaultValueSql: "gen_random_uuid()"),
                    device_token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fcm_token", x => new { x.email, x.device_id });
                });

            migrationBuilder.CreateTable(
                name: "feature_bit",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    feature_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    application_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'All'::character varying"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("feature_bit_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "guide_type",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("guide_type_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "image",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    image_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_extension = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    file_size = table.Column<int>(type: "integer", nullable: false),
                    file_path = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_relative_path = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("image_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "location",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("location_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "machine_type",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("machine_type_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "news_type",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("news_type_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "option_set",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    application_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'All'::character varying"),
                    description = table.Column<string>(type: "text", nullable: true),
                    values = table.Column<string>(type: "json", nullable: false),
                    display_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    columns = table.Column<string>(type: "json", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("option_set_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "organization",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    category = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    tax_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("organization_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "part_level",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    is_active = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: true),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("part_level_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "part_type_category",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("part_type_category_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "payment_term",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    due_days = table.Column<int>(type: "integer", nullable: false),
                    discount_days = table.Column<int>(type: "integer", nullable: true),
                    discount_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    payment_terms = table.Column<string>(type: "text", nullable: true),
                    payment_term_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("payment_term_pkey", x => x.id);
                    table.CheckConstraint("payment_term_discount_days_check", "(discount_days >= 0)");
                    table.CheckConstraint("payment_term_discount_percent_check", "((discount_percent >= (0)::numeric) AND (discount_percent <= (100)::numeric))");
                    table.CheckConstraint("payment_term_due_days_check", "(due_days >= 0)");
                });

            migrationBuilder.CreateTable(
                name: "permission",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    category_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("permission_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "platform",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    code = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("platform_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subsystem",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    is_active = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("subsystem_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tool_type",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("tool_type_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "unit_of_measure",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("unit_of_measure_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "video",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    video_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_extension = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    file_size = table.Column<int>(type: "integer", nullable: false),
                    file_path = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_relative_path = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("video_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "role",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    role_number = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "nextval('application.role_role_number_seq'::regclass)"),
                    role_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    role_description = table.Column<string>(type: "text", nullable: true),
                    app_id = table.Column<Guid>(type: "uuid", nullable: false),
                    system_defined = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("role_pkey", x => x.id);
                    table.ForeignKey(
                        name: "role_app_id_fkey",
                        column: x => x.app_id,
                        principalSchema: "application",
                        principalTable: "app",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "address",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    address_line1 = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    address_line2 = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    state = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    postal_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    country_id = table.Column<Guid>(type: "uuid", nullable: false),
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    latitude = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: true),
                    longitude = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("address_pkey", x => x.id);
                    table.ForeignKey(
                        name: "FK_address_country_country_id",
                        column: x => x.country_id,
                        principalSchema: "common",
                        principalTable: "country",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "eco_log",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    eco_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    action_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    action_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("eco_log_pkey", x => x.id);
                    table.ForeignKey(
                        name: "eco_log_eco_id_fkey",
                        column: x => x.eco_id,
                        principalSchema: "mes",
                        principalTable: "eco",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "machine",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    machine_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("machine_pkey", x => x.id);
                    table.ForeignKey(
                        name: "machine_machine_type_id_fkey",
                        column: x => x.machine_type_id,
                        principalSchema: "mes",
                        principalTable: "machine_type",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "news",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    news_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    hyperlink = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    origin = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    image = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("news_pkey", x => x.id);
                    table.ForeignKey(
                        name: "news_news_type_id_fkey",
                        column: x => x.news_type_id,
                        principalSchema: "mes",
                        principalTable: "news_type",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "part_type",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    part_number_prefix = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    category = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    category_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_visible_in_ui = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    part_type_category_id = table.Column<Guid>(type: "uuid", nullable: true),
                    part_level_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("part_type_pkey", x => x.id);
                    table.ForeignKey(
                        name: "part_type_part_level_id_fkey",
                        column: x => x.part_level_id,
                        principalSchema: "mes",
                        principalTable: "part_level",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "part_type_part_type_category_id_fkey",
                        column: x => x.part_type_category_id,
                        principalSchema: "mes",
                        principalTable: "part_type_category",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "company",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    company_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "sc.generate_company_code()"),
                    vendor_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "sc.generate_vendor_code()"),
                    customer_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "sc.generate_customer_code()"),
                    partner_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "sc.generate_partner_code()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    contact_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    alternate_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    website = table.Column<string>(type: "text", nullable: true),
                    tax_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    currency_code = table.Column<string>(type: "character(3)", fixedLength: true, maxLength: 3, nullable: true),
                    quality_score = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    payment_term_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    logo_url = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    total_orders = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    total_spent = table.Column<double>(type: "double precision", nullable: true, defaultValueSql: "0"),
                    avg_order_value = table.Column<double>(type: "double precision", nullable: true, defaultValueSql: "0"),
                    on_time_delivery_rate = table.Column<double>(type: "double precision", nullable: true, defaultValueSql: "0"),
                    member_since = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_activity_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_vendor = table.Column<bool>(type: "boolean", nullable: true),
                    is_customer = table.Column<bool>(type: "boolean", nullable: true),
                    is_partner = table.Column<bool>(type: "boolean", nullable: true),
                    pan_number = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("company_pkey", x => x.id);
                    table.CheckConstraint("company_pan_check", "((is_vendor = true) OR (pan_number IS NULL))");
                    table.ForeignKey(
                        name: "company_currency_id_fkey",
                        column: x => x.currency_id,
                        principalSchema: "common",
                        principalTable: "currency",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "company_payment_term_id_fkey",
                        column: x => x.payment_term_id,
                        principalSchema: "sc",
                        principalTable: "payment_term",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "tool",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    tool_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("tool_pkey", x => x.id);
                    table.ForeignKey(
                        name: "tool_tool_type_id_fkey",
                        column: x => x.tool_type_id,
                        principalSchema: "mes",
                        principalTable: "tool_type",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "bin_management",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    bin_code = table.Column<string>(type: "character varying(225)", maxLength: 225, nullable: false),
                    aisle = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    rack = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    capacity = table.Column<int>(type: "integer", nullable: true),
                    unit_of_measure_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("bin_management_pkey", x => x.id);
                    table.ForeignKey(
                        name: "bin_management_location_id_fkey",
                        column: x => x.location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "bin_management_unit_of_measure_id_fkey",
                        column: x => x.unit_of_measure_id,
                        principalSchema: "mes",
                        principalTable: "unit_of_measure",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "role_filter",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    entity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    @operator = table.Column<string>(name: "operator", type: "character varying(20)", maxLength: 20, nullable: false),
                    value = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("role_filter_pkey", x => x.id);
                    table.ForeignKey(
                        name: "role_filter_role_id_fkey",
                        column: x => x.role_id,
                        principalSchema: "application",
                        principalTable: "role",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "role_permission",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    permission = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    enable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("role_permission_pkey", x => x.id);
                    table.ForeignKey(
                        name: "role_permission_role_id_fkey",
                        column: x => x.role_id,
                        principalSchema: "application",
                        principalTable: "role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "bank_account",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    bank_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    branch_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    account_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    swift_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    ifsc_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    address_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("bank_account_pkey", x => x.id);
                    table.ForeignKey(
                        name: "bank_account_address_id_fkey",
                        column: x => x.address_id,
                        principalSchema: "common",
                        principalTable: "address",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "bank_account_currency_id_fkey",
                        column: x => x.currency_id,
                        principalSchema: "common",
                        principalTable: "currency",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "customer",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    tax_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    category = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    customer_address_id = table.Column<Guid>(type: "uuid", nullable: true),
                    image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("customer_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_customer_address",
                        column: x => x.customer_address_id,
                        principalSchema: "common",
                        principalTable: "address",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "organization_address",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    address_id = table.Column<Guid>(type: "uuid", nullable: false),
                    address_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("organization_address_pkey", x => x.id);
                    table.ForeignKey(
                        name: "organization_address_address_id_fkey",
                        column: x => x.address_id,
                        principalSchema: "common",
                        principalTable: "address",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "organization_address_organization_id_fkey",
                        column: x => x.organization_id,
                        principalSchema: "application",
                        principalTable: "organization",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "part",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    short_description = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    part_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    weight = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    part_number_suffix = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    version = table.Column<string>(type: "character(2)", fixedLength: true, maxLength: 2, nullable: false, defaultValueSql: "'01'::bpchar"),
                    part_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, computedColumnSql: "(((part_number_suffix)::text || '-'::text) || (version)::text)", stored: true),
                    eco_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true, defaultValueSql: "'Draft'::character varying"),
                    unit_of_measure_id = table.Column<Guid>(type: "uuid", nullable: true),
                    make_buy = table.Column<int>(type: "integer", nullable: false),
                    is_serial_number_required = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    unit_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    manufacturing_part_number = table.Column<string>(type: "text", nullable: true),
                    manufacturer_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    trl = table.Column<int>(type: "integer", nullable: true),
                    space_qualified = table.Column<bool>(type: "boolean", nullable: true),
                    item_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    reference_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    has_bom = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    material = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    grade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    country_of_origin_id = table.Column<Guid>(type: "uuid", nullable: true),
                    subsystem_id = table.Column<Guid>(type: "uuid", nullable: true),
                    specification = table.Column<string>(type: "text", nullable: true),
                    package = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    qualification = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    radiation_tolerance = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    temp_range = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    temp_coefficient = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("part_pkey", x => x.id);
                    table.CheckConstraint("chk_manufacturer_details_required", "(((make_buy = 1) AND (((item_type)::text = ANY (ARRAY[('Goods'::character varying)::text, ('Services'::character varying)::text])) OR ((manufacturing_part_number IS NOT NULL) AND (TRIM(BOTH FROM manufacturing_part_number) <> ''::text) AND (manufacturer_name IS NOT NULL) AND (TRIM(BOTH FROM manufacturer_name) <> ''::text)))) OR (make_buy = 0))");
                    table.CheckConstraint("part_status_check", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Release'::character varying)::text, ('Obsolete'::character varying)::text, ('Archived'::character varying)::text]))");
                    table.CheckConstraint("part_version_check", "(version ~ '^[0-9]{2}$'::text)");
                    table.ForeignKey(
                        name: "FK_part_country_country_of_origin_id",
                        column: x => x.country_of_origin_id,
                        principalSchema: "common",
                        principalTable: "country",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "part_eco_id_fkey",
                        column: x => x.eco_id,
                        principalSchema: "mes",
                        principalTable: "eco",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "part_part_type_id_fkey",
                        column: x => x.part_type_id,
                        principalSchema: "mes",
                        principalTable: "part_type",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "part_subsystem_id_fkey",
                        column: x => x.subsystem_id,
                        principalSchema: "mes",
                        principalTable: "subsystem",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "part_unit_of_measure_id_fkey",
                        column: x => x.unit_of_measure_id,
                        principalSchema: "mes",
                        principalTable: "unit_of_measure",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "company_address",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    address_id = table.Column<Guid>(type: "uuid", nullable: false),
                    address_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("company_address_pkey", x => x.id);
                    table.ForeignKey(
                        name: "company_address_address_id_fkey",
                        column: x => x.address_id,
                        principalSchema: "common",
                        principalTable: "address",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "company_address_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "contact",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    alternate_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    company_id = table.Column<Guid>(type: "uuid", nullable: true),
                    job_title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    is_primary = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("contact_pkey", x => x.id);
                    table.ForeignKey(
                        name: "contact_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "company_bank_account",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    bank_account_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("company_bank_account_pkey", x => x.id);
                    table.ForeignKey(
                        name: "company_bank_account_bank_account_id_fkey",
                        column: x => x.bank_account_id,
                        principalSchema: "common",
                        principalTable: "bank_account",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "company_bank_account_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "company_part",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,4)", nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    lead_time_days = table.Column<int>(type: "integer", nullable: true),
                    min_order_quantity = table.Column<int>(type: "integer", nullable: true),
                    order_multiple = table.Column<int>(type: "integer", nullable: true),
                    is_preferred = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false),
                    valid_from = table.Column<DateOnly>(type: "date", nullable: true),
                    valid_to = table.Column<DateOnly>(type: "date", nullable: true),
                    vendor_part_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    manufacturer_part_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("company_part_pkey", x => x.id);
                    table.ForeignKey(
                        name: "company_part_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "company_part_currency_id_fkey",
                        column: x => x.currency_id,
                        principalSchema: "common",
                        principalTable: "currency",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "company_part_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ebom",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    child_part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    assembly_location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("ebom_pkey", x => x.id);
                    table.ForeignKey(
                        name: "ebom_assembly_location_id_fkey",
                        column: x => x.assembly_location_id,
                        principalSchema: "mes",
                        principalTable: "assembly_location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "ebom_child_part_id_fkey",
                        column: x => x.child_part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "ebom_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "eco_part",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    eco_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    previous_status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    old_version = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    new_version = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    effective_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("eco_part_id_pkey", x => x.id);
                    table.CheckConstraint("eco_part_status_check", "((status)::text = ANY (ARRAY[('Obsolete'::character varying)::text, ('Release'::character varying)::text]))");
                    table.ForeignKey(
                        name: "eco_part_eco_id_fkey",
                        column: x => x.eco_id,
                        principalSchema: "mes",
                        principalTable: "eco",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "eco_part_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "guide",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    sequence = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "nextval('mes.guide_sequence_seq'::regclass)"),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "application.generate_alphanumeric_sequence('GD-'::character varying, currval('mes.guide_sequence_seq'::regclass))"),
                    platform_id = table.Column<Guid>(type: "uuid", nullable: true),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    guide_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Draft'::character varying"),
                    check_out_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    clone_from_id = table.Column<Guid>(type: "uuid", nullable: true),
                    calculated_weight = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    category = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("guide_pkey", x => x.id);
                    table.ForeignKey(
                        name: "guide_clone_from_id_fkey",
                        column: x => x.clone_from_id,
                        principalSchema: "mes",
                        principalTable: "guide",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "guide_guide_type_id_fkey",
                        column: x => x.guide_type_id,
                        principalSchema: "mes",
                        principalTable: "guide_type",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "guide_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "guide_platform_id_fkey",
                        column: x => x.platform_id,
                        principalSchema: "mes",
                        principalTable: "platform",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "inventory_part",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    bin_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sku_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    unit_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    reorder_level = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    qty_onhand = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    qty_reserved = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    qty_available = table.Column<int>(type: "integer", nullable: true, computedColumnSql: "((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_failed) - qty_qc_pending)", stored: true),
                    consumed_quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    qty_issued = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    qty_qc_pending = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    qty_scrapped = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    qty_qc_failed = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    qty_returned = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    tracking_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("inventory_part_pkey", x => x.id);
                    table.ForeignKey(
                        name: "inventory_part_bin_id_fkey",
                        column: x => x.bin_id,
                        principalSchema: "sc",
                        principalTable: "bin_management",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "inventory_part_location_id_fkey",
                        column: x => x.location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "inventory_part_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "material_kit",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    sequence = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "nextval('mes.material_kit_sequence_seq'::regclass)"),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "application.generate_alphanumeric_sequence('KIT-'::character varying, currval('mes.material_kit_sequence_seq'::regclass))"),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    location_id = table.Column<Guid>(type: "uuid", nullable: false),
                    image_id = table.Column<Guid>(type: "uuid", nullable: true),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("material_kit_pkey", x => x.id);
                    table.ForeignKey(
                        name: "material_kit_image_id_fkey",
                        column: x => x.image_id,
                        principalSchema: "common",
                        principalTable: "image",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "material_kit_location_id_fkey",
                        column: x => x.location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "material_kit_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "product",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    sequence = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "nextval('mes.product_sequence_seq'::regclass)"),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "application.generate_alphanumeric_sequence('PD-'::character varying, currval('mes.product_sequence_seq'::regclass))"),
                    platform_id = table.Column<Guid>(type: "uuid", nullable: true),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    image_id = table.Column<Guid>(type: "uuid", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("product_pkey", x => x.id);
                    table.ForeignKey(
                        name: "product_image_id_fkey",
                        column: x => x.image_id,
                        principalSchema: "common",
                        principalTable: "image",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "product_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "product_platform_id_fkey",
                        column: x => x.platform_id,
                        principalSchema: "mes",
                        principalTable: "platform",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "company_contact",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    contact_id = table.Column<Guid>(type: "uuid", nullable: false),
                    contact_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("company_contact_pkey", x => x.id);
                    table.ForeignKey(
                        name: "company_contact_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "company_contact_contact_id_fkey",
                        column: x => x.contact_id,
                        principalSchema: "common",
                        principalTable: "contact",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "guide_check_out_history",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    guide_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_checked_out = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("guide_check_out_history_pkey", x => x.id);
                    table.ForeignKey(
                        name: "guide_check_out_history_guide_id_fkey",
                        column: x => x.guide_id,
                        principalSchema: "mes",
                        principalTable: "guide",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "guide_ebom",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    guide_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    child_part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("guide_ebom_pkey", x => x.id);
                    table.ForeignKey(
                        name: "guide_ebom_child_part_id_fkey",
                        column: x => x.child_part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "guide_ebom_guide_id_fkey",
                        column: x => x.guide_id,
                        principalSchema: "mes",
                        principalTable: "guide",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "guide_ebom_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "guide_mbom",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    guide_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    weight = table.Column<double>(type: "double precision", nullable: false, defaultValue: 0.0),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("guide_mbom_pkey", x => x.id);
                    table.ForeignKey(
                        name: "guide_mbom_guide_id_fkey",
                        column: x => x.guide_id,
                        principalSchema: "mes",
                        principalTable: "guide",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "guide_mbom_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "guide_step",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    guide_id = table.Column<Guid>(type: "uuid", nullable: false),
                    image_id = table.Column<Guid>(type: "uuid", nullable: true),
                    video_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sequence = table.Column<int>(type: "integer", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("guide_step_pkey", x => x.id);
                    table.ForeignKey(
                        name: "guide_step_guide_id_fkey",
                        column: x => x.guide_id,
                        principalSchema: "mes",
                        principalTable: "guide",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "guide_step_image_id_fkey",
                        column: x => x.image_id,
                        principalSchema: "common",
                        principalTable: "image",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "guide_step_video_id_fkey",
                        column: x => x.video_id,
                        principalSchema: "common",
                        principalTable: "video",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "kit",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    material_kit_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Pending'::character varying"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("kit_pkey", x => x.id);
                    table.ForeignKey(
                        name: "kit_location_id_fkey",
                        column: x => x.location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "kit_material_kit_id_fkey",
                        column: x => x.material_kit_id,
                        principalSchema: "mes",
                        principalTable: "material_kit",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "kit_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "guide_step_equipment",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    equipment_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: true),
                    tool_id = table.Column<Guid>(type: "uuid", nullable: true),
                    machine_id = table.Column<Guid>(type: "uuid", nullable: true),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    guide_step_id = table.Column<Guid>(type: "uuid", nullable: false),
                    guide_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("guide_step_equipment_pkey", x => x.id);
                    table.ForeignKey(
                        name: "guide_step_equipment_guide_id_fkey",
                        column: x => x.guide_id,
                        principalSchema: "mes",
                        principalTable: "guide",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "guide_step_equipment_guide_step_id_fkey",
                        column: x => x.guide_step_id,
                        principalSchema: "mes",
                        principalTable: "guide_step",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "guide_step_equipment_machine_id_fkey",
                        column: x => x.machine_id,
                        principalSchema: "mes",
                        principalTable: "machine",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "guide_step_equipment_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "guide_step_equipment_tool_id_fkey",
                        column: x => x.tool_id,
                        principalSchema: "mes",
                        principalTable: "tool",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "guide_step_task",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    taskdetails = table.Column<string>(type: "json", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    ismandatory = table.Column<int>(type: "integer", nullable: false),
                    sequence = table.Column<int>(type: "integer", nullable: false),
                    guide_step_id = table.Column<Guid>(type: "uuid", nullable: false),
                    guide_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("guide_step_task_pkey", x => x.id);
                    table.ForeignKey(
                        name: "guide_step_task_guide_id_fkey",
                        column: x => x.guide_id,
                        principalSchema: "mes",
                        principalTable: "guide",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "guide_step_task_guide_step_id_fkey",
                        column: x => x.guide_step_id,
                        principalSchema: "mes",
                        principalTable: "guide_step",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "kit_bom_comment",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    kit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    comments = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("kit_bom_comment_pkey", x => x.id);
                    table.ForeignKey(
                        name: "kit_bom_comment_kit_id_fkey",
                        column: x => x.kit_id,
                        principalSchema: "mes",
                        principalTable: "kit",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "kit_bom_comment_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "kit_serial",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    kit_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    serialno = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Unconsumed'::character varying"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("kit_serial_pkey", x => x.id);
                    table.ForeignKey(
                        name: "kit_serial_kit_id_fkey",
                        column: x => x.kit_id,
                        principalSchema: "mes",
                        principalTable: "kit",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "kit_serial_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "approval",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    entity_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    stage_number = table.Column<int>(type: "integer", nullable: false),
                    approver_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Pending'::character varying"),
                    acted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    comment = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("approval_pkey", x => x.id);
                    table.CheckConstraint("approval_stage_number_check", "(stage_number >= 1)");
                    table.CheckConstraint("approval_status_check", "((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Cancelled'::character varying)::text, ('Removed'::character varying)::text]))");
                });

            migrationBuilder.CreateTable(
                name: "approval_notification_recipient",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("approval_notification_recipient_pkey", x => x.id);
                    table.CheckConstraint("chk_recipient_type", "((recipient_type IS NULL) OR ((recipient_type)::text = ANY (ARRAY[('CC'::character varying)::text, ('Watcher'::character varying)::text, ('Stakeholder'::character varying)::text])))");
                });

            migrationBuilder.CreateTable(
                name: "board_column",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    position = table.Column<int>(type: "integer", nullable: false, defaultValue: 0, comment: "Order position of column from left to right"),
                    color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "'#1976d2'::character varying", comment: "Column header color (hex code)"),
                    wip_limit = table.Column<int>(type: "integer", nullable: true, comment: "Work-in-progress limit for the column (null = no limit)"),
                    is_default = table.Column<bool>(type: "boolean", nullable: true, defaultValue: false, comment: "Whether this is the default column for new tasks"),
                    maps_to_status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true, comment: "Task status that this column maps to (e.g., To Do, In Progress)"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("board_column_pkey", x => x.id);
                },
                comment: "Kanban board columns for each project");

            migrationBuilder.CreateTable(
                name: "dashboard_widget",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false, comment: "Reference to the user who owns this widget configuration"),
                    widget_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, comment: "Type of widget to render"),
                    title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true, comment: "Custom title for the widget (optional)"),
                    position_x = table.Column<int>(type: "integer", nullable: false, defaultValue: 0, comment: "Grid X position (react-grid-layout)"),
                    position_y = table.Column<int>(type: "integer", nullable: false, defaultValue: 0, comment: "Grid Y position (react-grid-layout)"),
                    width = table.Column<int>(type: "integer", nullable: false, defaultValue: 4, comment: "Widget width in grid units"),
                    height = table.Column<int>(type: "integer", nullable: false, defaultValue: 2, comment: "Widget height in grid units"),
                    settings = table.Column<string>(type: "jsonb", nullable: true, defaultValueSql: "'{}'::jsonb", comment: "Widget-specific settings as JSON (filters, display options, etc.)"),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true, comment: "Optional: Filter widget data to specific project"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("dashboard_widget_pkey", x => x.id);
                    table.CheckConstraint("dashboard_widget_widget_type_check", "((widget_type)::text = ANY (ARRAY[('TaskSummary'::character varying)::text, ('ProjectProgress'::character varying)::text, ('OverdueTasks'::character varying)::text, ('MyTasks'::character varying)::text, ('TeamWorkload'::character varying)::text, ('RecentActivity'::character varying)::text, ('TimeLoggedChart'::character varying)::text, ('MilestoneTracker'::character varying)::text, ('PriorityBreakdown'::character varying)::text, ('StatusDistribution'::character varying)::text]))");
                },
                comment: "User-configurable dashboard widgets for project management");

            migrationBuilder.CreateTable(
                name: "department",
                schema: "common",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    is_active = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    parent_department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    head_of_department_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("department_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_department_parent",
                        column: x => x.parent_department_id,
                        principalSchema: "common",
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "user",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_number = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "nextval('application.user_user_number_seq'::regclass)"),
                    first_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    last_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    job_title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("user_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_department",
                        column: x => x.department_id,
                        principalSchema: "common",
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "program",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    program_code = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "pm.generate_program_code()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    program_manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    supply_chain_manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    buyer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    goals = table.Column<string>(type: "text", nullable: true),
                    budget = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    actual_spend = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("program_pkey", x => x.id);
                    table.ForeignKey(
                        name: "program_buyer_id_fkey",
                        column: x => x.buyer_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "program_customer_id_fkey",
                        column: x => x.customer_id,
                        principalSchema: "application",
                        principalTable: "customer",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "program_program_manager_id_fkey",
                        column: x => x.program_manager_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "program_supply_chain_manager_id_fkey",
                        column: x => x.supply_chain_manager_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "staff",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    first_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    last_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    staff_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    job_title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    employment_start_date = table.Column<DateOnly>(type: "date", nullable: true),
                    employment_end_date = table.Column<DateOnly>(type: "date", nullable: true),
                    image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("staff_pkey", x => x.id);
                    table.ForeignKey(
                        name: "user_manager_id_fkey",
                        column: x => x.manager_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "user_organization_id_fkey",
                        column: x => x.organization_id,
                        principalSchema: "application",
                        principalTable: "organization",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "user_role",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("user_role_pkey", x => x.id);
                    table.ForeignKey(
                        name: "user_role_role_id_fkey",
                        column: x => x.role_id,
                        principalSchema: "application",
                        principalTable: "role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "user_role_user_id_fkey",
                        column: x => x.user_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "work_package",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    sequence = table.Column<int>(type: "integer", nullable: false, defaultValueSql: "nextval('mes.work_package_sequence_seq'::regclass)"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "application.generate_alphanumeric_sequence('WO-'::character varying, currval('mes.work_package_sequence_seq'::regclass))"),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    technician_id = table.Column<Guid>(type: "uuid", nullable: true),
                    manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    guide_id = table.Column<Guid>(type: "uuid", nullable: true),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Pending'::character varying"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("work_package_pkey", x => x.id);
                    // R7/§3: UAT has NO FK on work_package.manager_id / technician_id (nav-only in the
                    // model; EF convention would emit FKs UAT lacks). Omitted to match UAT exactly.
                    table.ForeignKey(
                        name: "work_package_guide_id_fkey",
                        column: x => x.guide_id,
                        principalSchema: "mes",
                        principalTable: "guide",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "work_package_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "work_package_product_id_fkey",
                        column: x => x.product_id,
                        principalSchema: "mes",
                        principalTable: "product",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "project",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    project_code = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "pm.generate_project_code()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    program_id = table.Column<Guid>(type: "uuid", nullable: true),
                    project_manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    budget = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("project_pkey", x => x.id);
                    table.ForeignKey(
                        name: "project_program_id_fkey",
                        column: x => x.program_id,
                        principalSchema: "pm",
                        principalTable: "program",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "project_project_manager_id_fkey",
                        column: x => x.project_manager_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "work_order",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Pending'::character varying"),
                    work_package_id = table.Column<Guid>(type: "uuid", nullable: true),
                    kit_id = table.Column<Guid>(type: "uuid", nullable: true),
                    technician_id = table.Column<Guid>(type: "uuid", nullable: true),
                    manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    guide_id = table.Column<Guid>(type: "uuid", nullable: true),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: true),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    actual_end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    execution_time = table.Column<TimeSpan>(type: "interval", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("work_order_pkey", x => x.id);
                    // R7/§3: UAT has NO FK on work_order.manager_id / technician_id (nav-only). Omitted.
                    table.ForeignKey(
                        name: "work_order_guide_id_fkey",
                        column: x => x.guide_id,
                        principalSchema: "mes",
                        principalTable: "guide",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "work_order_kit_id_fkey",
                        column: x => x.kit_id,
                        principalSchema: "mes",
                        principalTable: "kit",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "work_order_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "work_order_product_id_fkey",
                        column: x => x.product_id,
                        principalSchema: "mes",
                        principalTable: "product",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "work_order_work_package_id_fkey",
                        column: x => x.work_package_id,
                        principalSchema: "mes",
                        principalTable: "work_package",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "inventory_stock",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    bin_id = table.Column<Guid>(type: "uuid", nullable: true),
                    location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    tracking_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    tracking_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    qty_onhand = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    qty_available = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true, computedColumnSql: "(((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_failed) - qty_qc_pending))::numeric(18,4)", stored: true),
                    qty_reserved = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    qty_issued = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    qty_consumed = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    qty_qc_pending = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    qty_qc_failed = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    qty_scrapped = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    qty_returned = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    unit_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    currency = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true, defaultValueSql: "'INR'::character varying"),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    assigned_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    conversion_rate = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true, defaultValueSql: "1"),
                    issued_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true, computedColumnSql: "((((qty_issued)::numeric * unit_price) * conversion_rate))::numeric(18,4)", stored: true),
                    reserved_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true, computedColumnSql: "((((qty_reserved)::numeric * unit_price) * conversion_rate))::numeric(18,4)", stored: true),
                    available_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true, computedColumnSql: "((((((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_pending) - qty_qc_failed))::numeric * unit_price) * conversion_rate))::numeric(18,4)", stored: true),
                    total_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true, computedColumnSql: "((((((qty_issued)::numeric * unit_price) * conversion_rate) + (((qty_reserved)::numeric * unit_price) * conversion_rate)) + (((((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_pending) - qty_qc_failed))::numeric * unit_price) * conversion_rate)))::numeric(18,4)", stored: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("inventory_stock_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_inventory_stock_assigned_user",
                        column: x => x.assigned_user_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "inventory_stock_bin_id_fkey",
                        column: x => x.bin_id,
                        principalSchema: "sc",
                        principalTable: "bin_management",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "inventory_stock_location_id_fkey",
                        column: x => x.location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "inventory_stock_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "inventory_stock_project_id_fkey",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "project",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "inventory_transaction",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    transaction_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    current_quantity = table.Column<int>(type: "integer", nullable: true),
                    previous_quantity = table.Column<int>(type: "integer", nullable: true),
                    transacted_quantity = table.Column<int>(type: "integer", nullable: false),
                    reference_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    transaction_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    to_location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    tracking_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    tracking_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    assigned_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("inventory_transaction_pkey", x => x.id);
                    table.CheckConstraint("inventory_transaction_tracking_type_check", "((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text]))");
                    table.CheckConstraint("inventory_transaction_transaction_type_check", "((transaction_type)::text = ANY (ARRAY['Received'::text, 'OnOrder'::text, 'Consumed'::text, 'Adjustment'::text, 'Returned'::text, 'Reserved'::text, 'Defective'::text, 'OnHold'::text, 'Transfer'::text, 'QC Failed'::text, 'Issued'::text]))");
                    table.ForeignKey(
                        name: "fk_inventory_transaction_assigned_user",
                        column: x => x.assigned_user_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_inventory_transaction_from_location",
                        column: x => x.from_location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_inventory_transaction_project",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "project",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_inventory_transaction_to_location",
                        column: x => x.to_location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "inventory_transaction_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "milestone",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true),
                    target_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("milestone_pkey", x => x.id);
                    table.ForeignKey(
                        name: "milestone_project_id_fkey",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "project",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "requisition",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    req_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "sc.generate_req_number()"),
                    requested_by_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true),
                    request_date = table.Column<DateOnly>(type: "date", nullable: false),
                    required_by_date = table.Column<DateOnly>(type: "date", nullable: true),
                    justification = table.Column<string>(type: "text", nullable: true),
                    priority = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Draft'::character varying"),
                    total_estimated_amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    approved_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rejected_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    rejected_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    approver_comment = table.Column<string>(type: "text", nullable: true),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("requisition_pkey", x => x.id);
                    table.CheckConstraint("chk_requisition_status", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Processing'::character varying)::text, ('PoCreated'::character varying)::text, ('Closed'::character varying)::text, ('Cancelled'::character varying)::text]))");
                    table.ForeignKey(
                        name: "fk_requisition_department",
                        column: x => x.department_id,
                        principalSchema: "common",
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "requisition_project_id_fkey",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "project",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "requisition_requested_by_id_fkey",
                        column: x => x.requested_by_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "issue",
                schema: "application",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    project_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    issue_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    summary = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    product_id = table.Column<Guid>(type: "uuid", nullable: true),
                    guide_id = table.Column<Guid>(type: "uuid", nullable: true),
                    work_order_id = table.Column<Guid>(type: "uuid", nullable: true),
                    jira_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    devops_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("issue_pkey", x => x.id);
                    table.ForeignKey(
                        name: "issue_guide_id_fkey",
                        column: x => x.guide_id,
                        principalSchema: "mes",
                        principalTable: "guide",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "issue_product_id_fkey",
                        column: x => x.product_id,
                        principalSchema: "mes",
                        principalTable: "product",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "issue_work_order_id_fkey",
                        column: x => x.work_order_id,
                        principalSchema: "mes",
                        principalTable: "work_order",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "stock_movement",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    movement_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "sc.generate_stock_movement_number()"),
                    movement_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, comment: "Transfer, Adjustment, or Issue"),
                    movement_reason = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true, comment: "Reason code for the movement"),
                    movement_date = table.Column<DateOnly>(type: "date", nullable: false),
                    from_location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    from_bin_id = table.Column<Guid>(type: "uuid", nullable: true),
                    to_location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    to_bin_id = table.Column<Guid>(type: "uuid", nullable: true),
                    performed_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    work_order_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reference_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'Completed'::character varying", comment: "Completed or Cancelled"),
                    expected_return_date = table.Column<DateOnly>(type: "date", nullable: true),
                    project_date = table.Column<DateOnly>(type: "date", nullable: true),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    assigned_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("stock_movement_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_stock_movement_assigned_user",
                        column: x => x.assigned_user_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_stock_movement_from_bin",
                        column: x => x.from_bin_id,
                        principalSchema: "sc",
                        principalTable: "bin_management",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_stock_movement_from_location",
                        column: x => x.from_location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_stock_movement_performed_by",
                        column: x => x.performed_by_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_stock_movement_to_bin",
                        column: x => x.to_bin_id,
                        principalSchema: "sc",
                        principalTable: "bin_management",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_stock_movement_to_location",
                        column: x => x.to_location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_stock_movement_work_order",
                        column: x => x.work_order_id,
                        principalSchema: "mes",
                        principalTable: "work_order",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "stock_movement_project_id_fkey",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "project",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                },
                comment: "Stock movement header for Transfer, Adjustment, and Issue operations");

            migrationBuilder.CreateTable(
                name: "work_order_step",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    work_order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    guide_step_id = table.Column<Guid>(type: "uuid", nullable: false),
                    technician_id = table.Column<Guid>(type: "uuid", nullable: true),
                    manager_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'Pending'::character varying"),
                    execution_time = table.Column<TimeSpan>(type: "interval", nullable: true),
                    captured_time = table.Column<TimeSpan>(type: "interval", nullable: true),
                    image_id = table.Column<Guid>(type: "uuid", nullable: true),
                    comment = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("work_order_step_pkey", x => x.id);
                    table.ForeignKey(
                        name: "FK_work_order_step_user_manager_id",
                        column: x => x.manager_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_work_order_step_user_technician_id",
                        column: x => x.technician_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "work_order_step_guide_step_id_fkey",
                        column: x => x.guide_step_id,
                        principalSchema: "mes",
                        principalTable: "guide_step",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "work_order_step_image_id_fkey",
                        column: x => x.image_id,
                        principalSchema: "common",
                        principalTable: "image",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "work_order_step_work_order_id_fkey",
                        column: x => x.work_order_id,
                        principalSchema: "mes",
                        principalTable: "work_order",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "task",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_to_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    priority = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    milestone_id = table.Column<Guid>(type: "uuid", nullable: true),
                    parent_task_id = table.Column<Guid>(type: "uuid", nullable: true, comment: "Self-referential FK for subtask hierarchy"),
                    task_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "pm.generate_task_code()", comment: "Auto-generated unique task code (TSK-XXXXXX)"),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, comment: "Task start date for Gantt chart"),
                    estimated_hours = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: true, comment: "Estimated hours to complete task"),
                    actual_hours = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: true, comment: "Actual hours logged against task"),
                    progress_percent = table.Column<int>(type: "integer", nullable: true, defaultValue: 0, comment: "Completion percentage (0-100)"),
                    task_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "'Task'::character varying", comment: "Task, Milestone, or SubTask"),
                    sort_order = table.Column<int>(type: "integer", nullable: true, defaultValue: 0, comment: "Sort order within parent or project"),
                    board_column_id = table.Column<Guid>(type: "uuid", nullable: true, comment: "FK to pm.board_column for Kanban boards"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("task_pkey", x => x.id);
                    table.CheckConstraint("chk_progress_percent", "((progress_percent >= 0) AND (progress_percent <= 100))");
                    table.CheckConstraint("chk_task_type", "((task_type)::text = ANY (ARRAY[('Task'::character varying)::text, ('Milestone'::character varying)::text, ('SubTask'::character varying)::text]))");
                    table.CheckConstraint("task_priority_check", "((priority)::text = ANY (ARRAY[('High'::character varying)::text, ('Medium'::character varying)::text, ('Low'::character varying)::text]))");
                    table.CheckConstraint("task_status_check", "((status)::text = ANY ('{Completed,\"In Progress\",\"To Do\",Logged,Review}'::text[]))");
                    table.ForeignKey(
                        name: "task_assigned_to_id_fkey",
                        column: x => x.assigned_to_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "task_board_column_id_fkey",
                        column: x => x.board_column_id,
                        principalSchema: "pm",
                        principalTable: "board_column",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "task_milestone_id_fkey",
                        column: x => x.milestone_id,
                        principalSchema: "pm",
                        principalTable: "milestone",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "task_parent_task_id_fkey",
                        column: x => x.parent_task_id,
                        principalSchema: "pm",
                        principalTable: "task",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "task_project_id_fkey",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "project",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "purchase_order",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "sc.generate_purchase_order_number()"),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true),
                    po_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    buyer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    supply_chain_lead_id = table.Column<Guid>(type: "uuid", nullable: true),
                    requisition_id = table.Column<Guid>(type: "uuid", nullable: true),
                    payment_term_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    order_date = table.Column<DateOnly>(type: "date", nullable: false),
                    actual_delivery_date = table.Column<DateOnly>(type: "date", nullable: true),
                    expected_delivery_date = table.Column<DateOnly>(type: "date", nullable: true),
                    discount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    discount_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    tax_option = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    total_amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    quotation_reference_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    shipment_reference_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Draft'::character varying"),
                    revision_history = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    round_off = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    billing_address_id = table.Column<Guid>(type: "uuid", nullable: false),
                    delivery_address_id = table.Column<Guid>(type: "uuid", nullable: true),
                    shipping_address_id = table.Column<Guid>(type: "uuid", nullable: true),
                    vendor_billing_address_id = table.Column<Guid>(type: "uuid", nullable: true),
                    vendor_billing_contact_id = table.Column<Guid>(type: "uuid", nullable: true),
                    delivery_status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    quotation_reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    po_terms = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    customer_instructions = table.Column<string>(type: "text", nullable: true),
                    delivery_terms = table.Column<string>(type: "text", nullable: true),
                    terms_and_conditions = table.Column<string>(type: "text", nullable: true),
                    approved_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rejected_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    rejected_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("purchase_order_pkey", x => x.id);
                    table.CheckConstraint("chk_purchase_order_status", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Issued'::character varying)::text, ('Rejected'::character varying)::text, ('Partially Delivered'::character varying)::text, ('Delivered'::character varying)::text, ('Closed'::character varying)::text, ('Cancelled'::character varying)::text, ('Billed'::character varying)::text, ('Partially Billed'::character varying)::text]))");
                    table.ForeignKey(
                        name: "FK_purchase_order_document_quotation_reference_id",
                        column: x => x.quotation_reference_id,
                        principalSchema: "common",
                        principalTable: "document",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_purchase_order_department",
                        column: x => x.department_id,
                        principalSchema: "common",
                        principalTable: "department",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_billing_address_id_fkey",
                        column: x => x.billing_address_id,
                        principalSchema: "common",
                        principalTable: "address",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_buyer_id_fkey",
                        column: x => x.buyer_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_currency_id_fkey",
                        column: x => x.currency_id,
                        principalSchema: "common",
                        principalTable: "currency",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_delivery_address_id_fkey",
                        column: x => x.delivery_address_id,
                        principalSchema: "common",
                        principalTable: "address",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_payment_term_id_fkey",
                        column: x => x.payment_term_id,
                        principalSchema: "sc",
                        principalTable: "payment_term",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_project_id_fkey",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "project",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_requisition_id_fkey",
                        column: x => x.requisition_id,
                        principalSchema: "sc",
                        principalTable: "requisition",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_shipping_address_id_fkey",
                        column: x => x.shipping_address_id,
                        principalSchema: "common",
                        principalTable: "address",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_supply_chain_lead_id_fkey",
                        column: x => x.supply_chain_lead_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_vendor_billing_address_id_fkey",
                        column: x => x.vendor_billing_address_id,
                        principalSchema: "common",
                        principalTable: "address",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "purchase_order_vendor_billing_contact_id_fkey",
                        column: x => x.vendor_billing_contact_id,
                        principalSchema: "common",
                        principalTable: "contact",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "requisition_line_item",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    requisition_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("requisition_line_item_pkey", x => x.id);
                    table.ForeignKey(
                        name: "requisition_line_item_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "requisition_line_item_requisition_id_fkey",
                        column: x => x.requisition_id,
                        principalSchema: "sc",
                        principalTable: "requisition",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "tender",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    tender_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'Draft'::character varying", comment: "Draft, Submitted, Published, Closed, Awarded, Cancelled"),
                    requisition_id = table.Column<Guid>(type: "uuid", nullable: true),
                    project_id = table.Column<Guid>(type: "uuid", nullable: true),
                    publish_date = table.Column<DateOnly>(type: "date", nullable: true),
                    closing_date = table.Column<DateOnly>(type: "date", nullable: false),
                    approved_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    awarded_vendor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    awarded_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    awarded_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    buyer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    terms = table.Column<string>(type: "text", nullable: true),
                    payment_term_id = table.Column<Guid>(type: "uuid", nullable: true),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    rejected_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    rejected_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    approver_comment = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("tender_pkey", x => x.id);
                    table.ForeignKey(
                        name: "tender_awarded_vendor_id_fkey",
                        column: x => x.awarded_vendor_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_buyer_id_fkey",
                        column: x => x.buyer_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_currency_id_fkey",
                        column: x => x.currency_id,
                        principalSchema: "common",
                        principalTable: "currency",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_payment_term_id_fkey",
                        column: x => x.payment_term_id,
                        principalSchema: "sc",
                        principalTable: "payment_term",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_project_id_fkey",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "project",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_requisition_id_fkey",
                        column: x => x.requisition_id,
                        principalSchema: "sc",
                        principalTable: "requisition",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                },
                comment: "Tender/RFQ management table for procurement");

            migrationBuilder.CreateTable(
                name: "stock_movement_line_item",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    stock_movement_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    tracking_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    tracking_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    reason = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    adjustment_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("stock_movement_line_item_pkey", x => x.id);
                    table.CheckConstraint("stock_movement_line_item_adjustment_type_check", "((adjustment_type)::text = ANY (ARRAY[('Increase'::character varying)::text, ('Decrease'::character varying)::text]))");
                    table.CheckConstraint("stock_movement_line_item_quantity_check", "(quantity > 0)");
                    table.ForeignKey(
                        name: "fk_stock_movement_line_item_movement",
                        column: x => x.stock_movement_id,
                        principalSchema: "sc",
                        principalTable: "stock_movement",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_stock_movement_line_item_part",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "work_order_task",
                schema: "mes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    work_order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    guide_step_task_id = table.Column<Guid>(type: "uuid", nullable: false),
                    task_response = table.Column<string>(type: "json", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'Pending'::character varying"),
                    work_order_step_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("work_order_task_pkey", x => x.id);
                    table.ForeignKey(
                        name: "work_order_task_guide_step_task_id_fkey",
                        column: x => x.guide_step_task_id,
                        principalSchema: "mes",
                        principalTable: "guide_step_task",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "work_order_task_work_order_id_fkey",
                        column: x => x.work_order_id,
                        principalSchema: "mes",
                        principalTable: "work_order",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "work_order_task_work_order_step_id_fkey",
                        column: x => x.work_order_step_id,
                        principalSchema: "mes",
                        principalTable: "work_order_step",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "resource_allocation",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false, comment: "User being allocated to the resource"),
                    project_id = table.Column<Guid>(type: "uuid", nullable: false, comment: "Project the resource is allocated to"),
                    task_id = table.Column<Guid>(type: "uuid", nullable: true, comment: "Optional: Specific task within the project"),
                    start_date = table.Column<DateTime>(type: "date", nullable: false, comment: "Start date of allocation period"),
                    end_date = table.Column<DateTime>(type: "date", nullable: false, comment: "End date of allocation period"),
                    allocated_hours_per_day = table.Column<decimal>(type: "numeric(4,2)", precision: 4, scale: 2, nullable: false, defaultValueSql: "8.0", comment: "Hours per day allocated to this work"),
                    allocation_percent = table.Column<int>(type: "integer", nullable: false, defaultValue: 100, comment: "Percentage of daily capacity (100% = full time)"),
                    allocation_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'Project'::character varying", comment: "Type of allocation (Project, Task, Overhead, Leave, Training)"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("resource_allocation_pkey", x => x.id);
                    table.CheckConstraint("chk_date_range", "(end_date >= start_date)");
                    table.CheckConstraint("resource_allocation_allocated_hours_per_day_check", "((allocated_hours_per_day > (0)::numeric) AND (allocated_hours_per_day <= (24)::numeric))");
                    table.CheckConstraint("resource_allocation_allocation_percent_check", "((allocation_percent > 0) AND (allocation_percent <= 100))");
                    table.CheckConstraint("resource_allocation_allocation_type_check", "((allocation_type)::text = ANY (ARRAY[('Project'::character varying)::text, ('Task'::character varying)::text, ('Overhead'::character varying)::text, ('Leave'::character varying)::text, ('Training'::character varying)::text]))");
                    table.ForeignKey(
                        name: "resource_allocation_project_id_fkey",
                        column: x => x.project_id,
                        principalSchema: "pm",
                        principalTable: "project",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "resource_allocation_task_id_fkey",
                        column: x => x.task_id,
                        principalSchema: "pm",
                        principalTable: "task",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "resource_allocation_user_id_fkey",
                        column: x => x.user_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                },
                comment: "Resource allocation tracking for capacity planning");

            migrationBuilder.CreateTable(
                name: "task_activity",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    task_id = table.Column<Guid>(type: "uuid", nullable: false),
                    activity_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, comment: "Type of activity that occurred"),
                    field_changed = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true, comment: "Name of field that was changed (for Updates)"),
                    old_value = table.Column<string>(type: "text", nullable: true, comment: "Previous value (for tracking changes)"),
                    new_value = table.Column<string>(type: "text", nullable: true, comment: "New value (for tracking changes)"),
                    description = table.Column<string>(type: "text", nullable: true, comment: "Human-readable description of the activity"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("task_activity_pkey", x => x.id);
                    table.CheckConstraint("task_activity_activity_type_check", "((activity_type)::text = ANY (ARRAY[('Created'::character varying)::text, ('Updated'::character varying)::text, ('Deleted'::character varying)::text, ('Restored'::character varying)::text, ('StatusChanged'::character varying)::text, ('PriorityChanged'::character varying)::text, ('AssigneeAdded'::character varying)::text, ('AssigneeRemoved'::character varying)::text, ('DueDateChanged'::character varying)::text, ('StartDateChanged'::character varying)::text, ('ProgressChanged'::character varying)::text, ('CommentAdded'::character varying)::text, ('CommentEdited'::character varying)::text, ('CommentDeleted'::character varying)::text, ('DependencyAdded'::character varying)::text, ('DependencyRemoved'::character varying)::text, ('SubtaskAdded'::character varying)::text, ('SubtaskRemoved'::character varying)::text, ('AttachmentAdded'::character varying)::text, ('AttachmentRemoved'::character varying)::text, ('Moved'::character varying)::text, ('TimeLogged'::character varying)::text]))");
                    table.ForeignKey(
                        name: "task_activity_task_id_fkey",
                        column: x => x.task_id,
                        principalSchema: "pm",
                        principalTable: "task",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Activity log for task changes - read-only audit trail");

            migrationBuilder.CreateTable(
                name: "task_assignee",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    task_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assignee_role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'Primary'::character varying", comment: "Primary=main assignee, Secondary=helper, Reviewer=approval, Watcher=notifications only"),
                    assigned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP", comment: "When the user member was assigned to this task"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("task_assignee_pkey", x => x.id);
                    table.CheckConstraint("task_assignee_assignee_role_check", "((assignee_role)::text = ANY (ARRAY[('Primary'::character varying)::text, ('Secondary'::character varying)::text, ('Reviewer'::character varying)::text, ('Watcher'::character varying)::text]))");
                    table.ForeignKey(
                        name: "task_assignee_task_id_fkey",
                        column: x => x.task_id,
                        principalSchema: "pm",
                        principalTable: "task",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "task_assignee_user_id_fkey",
                        column: x => x.user_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "task_comment",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    task_id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_comment_id = table.Column<Guid>(type: "uuid", nullable: true, comment: "Self-referential FK for threaded replies"),
                    content = table.Column<string>(type: "text", nullable: false, comment: "Comment text content (may include markdown)"),
                    mentions = table.Column<string>(type: "jsonb", nullable: true, defaultValueSql: "'[]'::jsonb", comment: "JSON array of user IDs mentioned with @, e.g., [\"uuid1\", \"uuid2\"]"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("task_comment_pkey", x => x.id);
                    table.ForeignKey(
                        name: "task_comment_parent_comment_id_fkey",
                        column: x => x.parent_comment_id,
                        principalSchema: "pm",
                        principalTable: "task_comment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "task_comment_task_id_fkey",
                        column: x => x.task_id,
                        principalSchema: "pm",
                        principalTable: "task",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Comments and discussions on tasks");

            migrationBuilder.CreateTable(
                name: "task_dependency",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    predecessor_task_id = table.Column<Guid>(type: "uuid", nullable: false),
                    successor_task_id = table.Column<Guid>(type: "uuid", nullable: false),
                    dependency_type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValueSql: "'FS'::character varying", comment: "FS=Finish-to-Start, SS=Start-to-Start, FF=Finish-to-Finish, SF=Start-to-Finish"),
                    lag_days = table.Column<int>(type: "integer", nullable: true, defaultValue: 0, comment: "Number of days delay between linked tasks (can be negative for lead)"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("task_dependency_pkey", x => x.id);
                    table.CheckConstraint("chk_no_self_dependency", "(predecessor_task_id <> successor_task_id)");
                    table.CheckConstraint("task_dependency_dependency_type_check", "((dependency_type)::text = ANY (ARRAY[('FS'::character varying)::text, ('SS'::character varying)::text, ('FF'::character varying)::text, ('SF'::character varying)::text]))");
                    table.ForeignKey(
                        name: "task_dependency_predecessor_fkey",
                        column: x => x.predecessor_task_id,
                        principalSchema: "pm",
                        principalTable: "task",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "task_dependency_successor_fkey",
                        column: x => x.successor_task_id,
                        principalSchema: "pm",
                        principalTable: "task",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "time_entry",
                schema: "pm",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    is_active = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    task_id = table.Column<Guid>(type: "uuid", nullable: false, comment: "Reference to the task this time was logged against"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false, comment: "User member who logged the time"),
                    entry_date = table.Column<DateTime>(type: "date", nullable: false, comment: "Date the work was performed"),
                    hours_worked = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, comment: "Number of hours worked (max 24)"),
                    description = table.Column<string>(type: "text", nullable: true),
                    billable = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true, comment: "Whether this time is billable to the client"),
                    work_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "'Development'::character varying", comment: "Type of work performed (Development, Design, Testing, etc.)"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("time_entry_pkey", x => x.id);
                    table.CheckConstraint("time_entry_hours_worked_check", "((hours_worked > (0)::numeric) AND (hours_worked <= (24)::numeric))");
                    table.ForeignKey(
                        name: "time_entry_task_id_fkey",
                        column: x => x.task_id,
                        principalSchema: "pm",
                        principalTable: "task",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "time_entry_user_id_fkey",
                        column: x => x.user_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                },
                comment: "Time entries logged against tasks");

            migrationBuilder.CreateTable(
                name: "goods_receipt_note",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    grn_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "sc.generate_grn_number()"),
                    purchase_order_id = table.Column<Guid>(type: "uuid", nullable: true),
                    received_date = table.Column<DateOnly>(type: "date", nullable: false),
                    received_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    vendor_reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    location_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reference_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    invoice_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    invoice_date = table.Column<DateOnly>(type: "date", nullable: true),
                    status = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "'In Process'::character varying"),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("goods_receipt_note_pkey", x => x.id);
                    table.CheckConstraint("goods_receipt_note_status_check", "((status)::text = ANY (ARRAY[('In Process'::character varying)::text, ('Completed'::character varying)::text, ('Partially Completed'::character varying)::text, ('Rejected'::character varying)::text, ('Quality Checked'::character varying)::text, ('Closed'::character varying)::text]))");
                    // R7/§3: UAT has NO FK on goods_receipt_note.vendor_reference_id (nav-only). Omitted.
                    table.ForeignKey(
                        name: "goods_receipt_note_location_id_fkey",
                        column: x => x.location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "goods_receipt_note_purchase_order_id_fkey",
                        column: x => x.purchase_order_id,
                        principalSchema: "sc",
                        principalTable: "purchase_order",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "goods_receipt_note_received_by_id_fkey",
                        column: x => x.received_by_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "goods_receipt_note_vendor_id_fkey",
                        column: x => x.vendor_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "po_line_item",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    purchase_order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ordered_quantity = table.Column<int>(type: "integer", nullable: false),
                    received_quantity = table.Column<int>(type: "integer", nullable: true),
                    pending_quantity = table.Column<int>(type: "integer", nullable: true),
                    unit_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    total_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    conversion_rate = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true, defaultValueSql: "1"),
                    currency = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    tax = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    tax_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    hsn = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    discount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    discount_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    actual_delivery_date = table.Column<DateOnly>(type: "date", nullable: true),
                    expected_delivery_date = table.Column<DateOnly>(type: "date", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("po_line_item_pkey", x => x.id);
                    table.ForeignKey(
                        name: "po_line_item_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "po_line_item_purchase_order_id_fkey",
                        column: x => x.purchase_order_id,
                        principalSchema: "sc",
                        principalTable: "purchase_order",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "tender_line_item",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    tender_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: true),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    unit_of_measure_id = table.Column<Guid>(type: "uuid", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    specifications = table.Column<string>(type: "text", nullable: true),
                    line_number = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("tender_line_item_pkey", x => x.id);
                    table.ForeignKey(
                        name: "tender_line_item_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_line_item_tender_id_fkey",
                        column: x => x.tender_id,
                        principalSchema: "sc",
                        principalTable: "tender",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "tender_line_item_unit_of_measure_id_fkey",
                        column: x => x.unit_of_measure_id,
                        principalSchema: "mes",
                        principalTable: "unit_of_measure",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                },
                comment: "Line items/parts requested in a tender");

            migrationBuilder.CreateTable(
                name: "tender_quotation",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    tender_id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: true),
                    quotation_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    quotation_date = table.Column<DateOnly>(type: "date", nullable: false),
                    valid_until = table.Column<DateOnly>(type: "date", nullable: true),
                    total_amount = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false, defaultValue: 0m),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: true),
                    lead_time_days = table.Column<int>(type: "integer", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    terms_and_conditions = table.Column<string>(type: "text", nullable: true),
                    document_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_selected = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false, comment: "True if this is the winning quotation"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("tender_quotation_pkey", x => x.id);
                    table.ForeignKey(
                        name: "tender_quotation_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_quotation_currency_id_fkey",
                        column: x => x.currency_id,
                        principalSchema: "common",
                        principalTable: "currency",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_quotation_document_id_fkey",
                        column: x => x.document_id,
                        principalSchema: "common",
                        principalTable: "document",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_quotation_tender_id_fkey",
                        column: x => x.tender_id,
                        principalSchema: "sc",
                        principalTable: "tender",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Vendor quotation responses to tenders");

            migrationBuilder.CreateTable(
                name: "tender_vendor",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    tender_id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: true),
                    invited_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    response_deadline = table.Column<DateOnly>(type: "date", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'Invited'::character varying", comment: "Invited, Responded, NoResponse, Declined"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("tender_vendor_pkey", x => x.id);
                    table.ForeignKey(
                        name: "tender_vendor_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_vendor_tender_id_fkey",
                        column: x => x.tender_id,
                        principalSchema: "sc",
                        principalTable: "tender",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Vendors invited to respond to a tender");

            migrationBuilder.CreateTable(
                name: "scrap_request",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    scrap_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "sc.generate_scrap_number()"),
                    location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    raised_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    scrap_date = table.Column<DateOnly>(type: "date", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    po_id = table.Column<Guid>(type: "uuid", nullable: true),
                    grn_id = table.Column<Guid>(type: "uuid", nullable: true),
                    wo_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'Draft'::character varying"),
                    approved_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rejected_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    rejected_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("scrap_request_pkey", x => x.id);
                    table.CheckConstraint("scrap_request_status_check", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Disposed'::character varying)::text]))");
                    table.ForeignKey(
                        name: "scrap_request_grn_id_fkey",
                        column: x => x.grn_id,
                        principalSchema: "sc",
                        principalTable: "goods_receipt_note",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "scrap_request_location_id_fkey",
                        column: x => x.location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "scrap_request_po_id_fkey",
                        column: x => x.po_id,
                        principalSchema: "sc",
                        principalTable: "purchase_order",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "scrap_request_raised_by_id_fkey",
                        column: x => x.raised_by_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "scrap_request_wo_id_fkey",
                        column: x => x.wo_id,
                        principalSchema: "mes",
                        principalTable: "work_order",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "vendor_return_request",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    return_number = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false, defaultValueSql: "sc.generate_vendor_return_number()"),
                    vendor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    po_id = table.Column<Guid>(type: "uuid", nullable: true),
                    grn_id = table.Column<Guid>(type: "uuid", nullable: true),
                    wo_id = table.Column<Guid>(type: "uuid", nullable: true),
                    return_date = table.Column<DateOnly>(type: "date", nullable: true),
                    raised_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'Draft'::character varying"),
                    location_id = table.Column<Guid>(type: "uuid", nullable: true),
                    approved_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    approved_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rejected_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    rejected_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("vendor_return_request_pkey", x => x.id);
                    table.CheckConstraint("vendor_return_request_status_check", "((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Shipped'::character varying)::text, ('Closed'::character varying)::text]))");
                    table.ForeignKey(
                        name: "fk_vendor_return_request_wo_id",
                        column: x => x.wo_id,
                        principalSchema: "mes",
                        principalTable: "work_order",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "vendor_return_request_grn_id_fkey",
                        column: x => x.grn_id,
                        principalSchema: "sc",
                        principalTable: "goods_receipt_note",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "vendor_return_request_location_id_fkey",
                        column: x => x.location_id,
                        principalSchema: "mes",
                        principalTable: "location",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "vendor_return_request_po_id_fkey",
                        column: x => x.po_id,
                        principalSchema: "sc",
                        principalTable: "purchase_order",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "vendor_return_request_raised_by_id_fkey",
                        column: x => x.raised_by_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "vendor_return_request_vendor_id_fkey",
                        column: x => x.vendor_id,
                        principalSchema: "sc",
                        principalTable: "company",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "grn_line_item",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    grn_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    po_line_item_id = table.Column<Guid>(type: "uuid", nullable: true),
                    received_quantity = table.Column<int>(type: "integer", nullable: true),
                    tracking_method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    tracking_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    manufacturing_date = table.Column<DateOnly>(type: "date", nullable: true),
                    expiry_date = table.Column<DateOnly>(type: "date", nullable: true),
                    qc_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "'Pending'::character varying"),
                    qc_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    checked_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    remark = table.Column<string>(type: "text", nullable: true),
                    disposition = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    qc_remark = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("grn_line_item_pkey", x => x.id);
                    table.CheckConstraint("grn_line_item_disposition_check", "((disposition)::text = ANY (ARRAY[('Accepted'::character varying)::text, ('Return'::character varying)::text, ('Scrap'::character varying)::text, ('Rework'::character varying)::text, ('Quarantine'::character varying)::text]))");
                    table.CheckConstraint("grn_line_item_qc_status_check", "((qc_status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Pass'::character varying)::text, ('Fail'::character varying)::text, ('Accepted'::character varying)::text]))");
                    table.CheckConstraint("grn_line_item_tracking_method_check", "((tracking_method IS NULL) OR ((tracking_method)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text])))");
                    table.ForeignKey(
                        name: "grn_line_item_checked_by_id_fkey",
                        column: x => x.checked_by_id,
                        principalSchema: "application",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "grn_line_item_grn_id_fkey",
                        column: x => x.grn_id,
                        principalSchema: "sc",
                        principalTable: "goods_receipt_note",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "grn_line_item_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "grn_line_item_po_line_item_id_fkey",
                        column: x => x.po_line_item_id,
                        principalSchema: "sc",
                        principalTable: "po_line_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "tender_quotation_line_item",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    tender_quotation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tender_line_item_id = table.Column<Guid>(type: "uuid", nullable: true),
                    unit_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false, defaultValue: 0m),
                    quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    total_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false, defaultValue: 0m),
                    lead_time_days = table.Column<int>(type: "integer", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("tender_quotation_line_item_pkey", x => x.id);
                    table.ForeignKey(
                        name: "tender_quotation_line_item_tender_line_item_id_fkey",
                        column: x => x.tender_line_item_id,
                        principalSchema: "sc",
                        principalTable: "tender_line_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "tender_quotation_line_item_tender_quotation_id_fkey",
                        column: x => x.tender_quotation_id,
                        principalSchema: "sc",
                        principalTable: "tender_quotation",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "Line item pricing in vendor quotations");

            migrationBuilder.CreateTable(
                name: "scrap_line_item",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    scrap_request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tracking_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    tracking_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    scrap_quantity = table.Column<int>(type: "integer", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("scrap_line_item_pkey", x => x.id);
                    table.CheckConstraint("scrap_line_item_tracking_type_check", "((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text]))");
                    table.ForeignKey(
                        name: "scrap_line_item_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "scrap_line_item_scrap_request_id_fkey",
                        column: x => x.scrap_request_id,
                        principalSchema: "sc",
                        principalTable: "scrap_request",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vendor_return_line_item",
                schema: "sc",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    return_request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    part_id = table.Column<Guid>(type: "uuid", nullable: false),
                    grn_line_item_id = table.Column<Guid>(type: "uuid", nullable: true),
                    tracking_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    tracking_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    return_quantity = table.Column<int>(type: "integer", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("vendor_return_line_item_pkey", x => x.id);
                    table.CheckConstraint("vendor_return_line_item_tracking_type_check", "((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text]))");
                    table.ForeignKey(
                        name: "vendor_return_line_item_grn_line_item_id_fkey",
                        column: x => x.grn_line_item_id,
                        principalSchema: "sc",
                        principalTable: "grn_line_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "vendor_return_line_item_part_id_fkey",
                        column: x => x.part_id,
                        principalSchema: "mes",
                        principalTable: "part",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "vendor_return_line_item_return_request_id_fkey",
                        column: x => x.return_request_id,
                        principalSchema: "sc",
                        principalTable: "vendor_return_request",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_additional_recipient_config_template",
                schema: "common",
                table: "additional_recipient_configuration",
                column: "template_code",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_address_country_id",
                schema: "common",
                table: "address",
                column: "country_id");

            migrationBuilder.CreateIndex(
                name: "app_app_name_key",
                schema: "application",
                table: "app",
                column: "app_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "app_app_number_key",
                schema: "application",
                table: "app",
                column: "app_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "approval_entity_id_stage_number_approver_id_deleted_at_key",
                schema: "common",
                table: "approval",
                columns: new[] { "entity_id", "stage_number", "approver_id", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_approval_approver_id",
                schema: "common",
                table: "approval",
                column: "approver_id");

            migrationBuilder.CreateIndex(
                name: "idx_approval_configuration_entity_type",
                schema: "common",
                table: "approval_configuration",
                column: "entity_type",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "uq_approval_configuration_entity_type",
                schema: "common",
                table: "approval_configuration",
                columns: new[] { "entity_type", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_approval_log_action_at",
                schema: "common",
                table: "approval_log",
                column: "action_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "idx_approval_log_entity",
                schema: "common",
                table: "approval_log",
                columns: new[] { "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "idx_approval_notification_recipient_entity",
                schema: "common",
                table: "approval_notification_recipient",
                columns: new[] { "entity_type", "entity_id" },
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_approval_notification_recipient_user",
                schema: "common",
                table: "approval_notification_recipient",
                column: "recipient_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_bank_account_address_id",
                schema: "common",
                table: "bank_account",
                column: "address_id");

            migrationBuilder.CreateIndex(
                name: "IX_bank_account_currency_id",
                schema: "common",
                table: "bank_account",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_bin_management_location_id",
                schema: "sc",
                table: "bin_management",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_bin_management_unit_of_measure_id",
                schema: "sc",
                table: "bin_management",
                column: "unit_of_measure_id");

            migrationBuilder.CreateIndex(
                name: "idx_board_column_position",
                schema: "pm",
                table: "board_column",
                columns: new[] { "project_id", "position" },
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_board_column_project_id",
                schema: "pm",
                table: "board_column",
                column: "project_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_company_currency_id",
                schema: "sc",
                table: "company",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_payment_term_id",
                schema: "sc",
                table: "company",
                column: "payment_term_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_address_address_id",
                schema: "sc",
                table: "company_address",
                column: "address_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_address_company_id",
                schema: "sc",
                table: "company_address",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_bank_account_bank_account_id",
                schema: "sc",
                table: "company_bank_account",
                column: "bank_account_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_bank_account_company_id",
                schema: "sc",
                table: "company_bank_account",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_contact_company_id",
                schema: "sc",
                table: "company_contact",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_contact_contact_id",
                schema: "sc",
                table: "company_contact",
                column: "contact_id");

            migrationBuilder.CreateIndex(
                name: "idx_company_part_is_preferred",
                schema: "sc",
                table: "company_part",
                column: "is_preferred",
                filter: "(is_preferred = true)");

            migrationBuilder.CreateIndex(
                name: "idx_company_part_vendor_part_number",
                schema: "sc",
                table: "company_part",
                column: "vendor_part_number");

            migrationBuilder.CreateIndex(
                name: "IX_company_part_company_id",
                schema: "sc",
                table: "company_part",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_part_currency_id",
                schema: "sc",
                table: "company_part",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_company_part_part_id",
                schema: "sc",
                table: "company_part",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_contact_company_id",
                schema: "common",
                table: "contact",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "country_iso2_code_key",
                schema: "common",
                table: "country",
                column: "iso2_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "country_iso3_code_key",
                schema: "common",
                table: "country",
                column: "iso3_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "country_name_key",
                schema: "common",
                table: "country",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "country_numeric_code_key",
                schema: "common",
                table: "country",
                column: "numeric_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_customer_customer_address_id",
                schema: "application",
                table: "customer",
                column: "customer_address_id");

            migrationBuilder.CreateIndex(
                name: "uq_customer_tax_number",
                schema: "application",
                table: "customer",
                column: "tax_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_dashboard_widget_project_id",
                schema: "pm",
                table: "dashboard_widget",
                column: "project_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_dashboard_widget_user_id",
                schema: "pm",
                table: "dashboard_widget",
                column: "user_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_department_head_of_department_user_id",
                schema: "common",
                table: "department",
                column: "head_of_department_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_department_parent_department_id",
                schema: "common",
                table: "department",
                column: "parent_department_id");

            migrationBuilder.CreateIndex(
                name: "ux_department_code_active",
                schema: "common",
                table: "department",
                column: "code",
                unique: true,
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "ebom_part_id_child_part_id_deleted_at_key",
                schema: "mes",
                table: "ebom",
                columns: new[] { "part_id", "child_part_id", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ebom_assembly_location_id",
                schema: "mes",
                table: "ebom",
                column: "assembly_location_id");

            migrationBuilder.CreateIndex(
                name: "IX_ebom_child_part_id",
                schema: "mes",
                table: "ebom",
                column: "child_part_id");

            migrationBuilder.CreateIndex(
                name: "IX_eco_log_eco_id",
                schema: "mes",
                table: "eco_log",
                column: "eco_id");

            migrationBuilder.CreateIndex(
                name: "eco_part_eco_id_part_id_deleted_at_key",
                schema: "mes",
                table: "eco_part",
                columns: new[] { "eco_id", "part_id", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_eco_part_part_id",
                schema: "mes",
                table: "eco_part",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "idx_email_log_created",
                schema: "mes",
                table: "email_log",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "idx_email_log_entity",
                schema: "mes",
                table: "email_log",
                columns: new[] { "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "idx_email_log_status",
                schema: "mes",
                table: "email_log",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "idx_email_template_code",
                schema: "mes",
                table: "email_template",
                column: "template_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "feature_bit_feature_name_key",
                schema: "application",
                table: "feature_bit",
                column: "feature_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_note_location_id",
                schema: "sc",
                table: "goods_receipt_note",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_note_purchase_order_id",
                schema: "sc",
                table: "goods_receipt_note",
                column: "purchase_order_id");

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_note_received_by_id",
                schema: "sc",
                table: "goods_receipt_note",
                column: "received_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_note_vendor_id",
                schema: "sc",
                table: "goods_receipt_note",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_goods_receipt_note_vendor_reference_id",
                schema: "sc",
                table: "goods_receipt_note",
                column: "vendor_reference_id");

            migrationBuilder.CreateIndex(
                name: "IX_grn_line_item_checked_by_id",
                schema: "sc",
                table: "grn_line_item",
                column: "checked_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_grn_line_item_grn_id",
                schema: "sc",
                table: "grn_line_item",
                column: "grn_id");

            migrationBuilder.CreateIndex(
                name: "IX_grn_line_item_part_id",
                schema: "sc",
                table: "grn_line_item",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_grn_line_item_po_line_item_id",
                schema: "sc",
                table: "grn_line_item",
                column: "po_line_item_id");

            migrationBuilder.CreateIndex(
                name: "guide_part_id_number_version_key",
                schema: "mes",
                table: "guide",
                columns: new[] { "part_id", "number", "version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "guide_sequence_key",
                schema: "mes",
                table: "guide",
                column: "sequence",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_guide_clone_from_id",
                schema: "mes",
                table: "guide",
                column: "clone_from_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_guide_type_id",
                schema: "mes",
                table: "guide",
                column: "guide_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_platform_id",
                schema: "mes",
                table: "guide",
                column: "platform_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_check_out_history_guide_id",
                schema: "mes",
                table: "guide_check_out_history",
                column: "guide_id");

            migrationBuilder.CreateIndex(
                name: "guide_ebom_guide_id_part_id_child_part_id_deleted_at_key",
                schema: "mes",
                table: "guide_ebom",
                columns: new[] { "guide_id", "part_id", "child_part_id", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_guide_ebom_child_part_id",
                schema: "mes",
                table: "guide_ebom",
                column: "child_part_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_ebom_part_id",
                schema: "mes",
                table: "guide_ebom",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "guide_mbom_guide_id_part_id_deleted_at_key",
                schema: "mes",
                table: "guide_mbom",
                columns: new[] { "guide_id", "part_id", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_guide_mbom_part_id",
                schema: "mes",
                table: "guide_mbom",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "fki_guide_step_image_id_fkey",
                schema: "mes",
                table: "guide_step",
                column: "image_id");

            migrationBuilder.CreateIndex(
                name: "guide_step_image_id_fkey",
                schema: "mes",
                table: "guide_step",
                column: "image_id");

            migrationBuilder.CreateIndex(
                name: "guide_step_video_id_fkey",
                schema: "mes",
                table: "guide_step",
                column: "video_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_step_guide_id",
                schema: "mes",
                table: "guide_step",
                column: "guide_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_step_equipment_guide_id",
                schema: "mes",
                table: "guide_step_equipment",
                column: "guide_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_step_equipment_guide_step_id",
                schema: "mes",
                table: "guide_step_equipment",
                column: "guide_step_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_step_equipment_machine_id",
                schema: "mes",
                table: "guide_step_equipment",
                column: "machine_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_step_equipment_part_id",
                schema: "mes",
                table: "guide_step_equipment",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_step_equipment_tool_id",
                schema: "mes",
                table: "guide_step_equipment",
                column: "tool_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_step_task_guide_id",
                schema: "mes",
                table: "guide_step_task",
                column: "guide_id");

            migrationBuilder.CreateIndex(
                name: "IX_guide_step_task_guide_step_id",
                schema: "mes",
                table: "guide_step_task",
                column: "guide_step_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_part_bin_id",
                schema: "sc",
                table: "inventory_part",
                column: "bin_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_part_location_id",
                schema: "sc",
                table: "inventory_part",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_part_part_id",
                schema: "sc",
                table: "inventory_part",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_stock_assigned_user_id",
                schema: "sc",
                table: "inventory_stock",
                column: "assigned_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_stock_bin_id",
                schema: "sc",
                table: "inventory_stock",
                column: "bin_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_stock_location_id",
                schema: "sc",
                table: "inventory_stock",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_stock_part_id",
                schema: "sc",
                table: "inventory_stock",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_stock_project_id",
                schema: "sc",
                table: "inventory_stock",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_transaction_assigned_user_id",
                schema: "sc",
                table: "inventory_transaction",
                column: "assigned_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_transaction_from_location_id",
                schema: "sc",
                table: "inventory_transaction",
                column: "from_location_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_transaction_part_id",
                schema: "sc",
                table: "inventory_transaction",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_transaction_project_id",
                schema: "sc",
                table: "inventory_transaction",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_inventory_transaction_to_location_id",
                schema: "sc",
                table: "inventory_transaction",
                column: "to_location_id");

            migrationBuilder.CreateIndex(
                name: "IX_issue_guide_id",
                schema: "application",
                table: "issue",
                column: "guide_id");

            migrationBuilder.CreateIndex(
                name: "IX_issue_product_id",
                schema: "application",
                table: "issue",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_issue_work_order_id",
                schema: "application",
                table: "issue",
                column: "work_order_id");

            migrationBuilder.CreateIndex(
                name: "IX_kit_location_id",
                schema: "mes",
                table: "kit",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_kit_material_kit_id",
                schema: "mes",
                table: "kit",
                column: "material_kit_id");

            migrationBuilder.CreateIndex(
                name: "IX_kit_part_id",
                schema: "mes",
                table: "kit",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "kit_number_key",
                schema: "mes",
                table: "kit",
                column: "number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_kit_bom_comment_kit_id",
                schema: "mes",
                table: "kit_bom_comment",
                column: "kit_id");

            migrationBuilder.CreateIndex(
                name: "IX_kit_bom_comment_part_id",
                schema: "mes",
                table: "kit_bom_comment",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_kit_serial_part_id",
                schema: "mes",
                table: "kit_serial",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "kit_serial_kit_id_part_id_serialno_key",
                schema: "mes",
                table: "kit_serial",
                columns: new[] { "kit_id", "part_id", "serialno" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "location_number_name_deleted_at_key",
                schema: "mes",
                table: "location",
                columns: new[] { "number", "name", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_machine_machine_type_id",
                schema: "mes",
                table: "machine",
                column: "machine_type_id");

            migrationBuilder.CreateIndex(
                name: "machine_number_key",
                schema: "mes",
                table: "machine",
                column: "number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_material_kit_location_id",
                schema: "mes",
                table: "material_kit",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_material_kit_part_id",
                schema: "mes",
                table: "material_kit",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "material_kit_image_id_fkey",
                schema: "mes",
                table: "material_kit",
                column: "image_id");

            migrationBuilder.CreateIndex(
                name: "material_kit_number_key",
                schema: "mes",
                table: "material_kit",
                column: "number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "material_kit_sequence_key",
                schema: "mes",
                table: "material_kit",
                column: "sequence",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_milestone_project_id",
                schema: "pm",
                table: "milestone",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_news_news_type_id",
                schema: "mes",
                table: "news",
                column: "news_type_id");

            migrationBuilder.CreateIndex(
                name: "news_title_key",
                schema: "mes",
                table: "news",
                column: "title",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "option_set_display_name_key",
                schema: "application",
                table: "option_set",
                column: "display_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "option_set_name_key",
                schema: "application",
                table: "option_set",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_organization_address_address_id",
                schema: "application",
                table: "organization_address",
                column: "address_id");

            migrationBuilder.CreateIndex(
                name: "IX_organization_address_organization_id",
                schema: "application",
                table: "organization_address",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "idx_part_grade",
                schema: "mes",
                table: "part",
                column: "grade",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_part_subsystem_id",
                schema: "mes",
                table: "part",
                column: "subsystem_id");

            migrationBuilder.CreateIndex(
                name: "idx_part_suffix_version",
                schema: "mes",
                table: "part",
                columns: new[] { "part_number_suffix", "version" },
                descending: new[] { false, true },
                filter: "((item_type IS NULL) AND (deleted_by IS NULL))");

            migrationBuilder.CreateIndex(
                name: "IX_part_country_of_origin_id",
                schema: "mes",
                table: "part",
                column: "country_of_origin_id");

            migrationBuilder.CreateIndex(
                name: "IX_part_eco_id",
                schema: "mes",
                table: "part",
                column: "eco_id");

            migrationBuilder.CreateIndex(
                name: "IX_part_part_type_id",
                schema: "mes",
                table: "part",
                column: "part_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_part_unit_of_measure_id",
                schema: "mes",
                table: "part",
                column: "unit_of_measure_id");

            migrationBuilder.CreateIndex(
                name: "part_manufacturing_part_number_deleted_at_key",
                schema: "mes",
                table: "part",
                columns: new[] { "manufacturing_part_number", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "part_part_number_key",
                schema: "mes",
                table: "part",
                column: "part_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_part_level_active",
                schema: "mes",
                table: "part_level",
                column: "is_active",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_part_level_code",
                schema: "mes",
                table: "part_level",
                column: "code",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_part_level_sort_order",
                schema: "mes",
                table: "part_level",
                column: "sort_order",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "part_level_code_deleted_at_key",
                schema: "mes",
                table: "part_level",
                columns: new[] { "code", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_part_type_part_level_id",
                schema: "mes",
                table: "part_type",
                column: "part_level_id");

            migrationBuilder.CreateIndex(
                name: "IX_part_type_part_type_category_id",
                schema: "mes",
                table: "part_type",
                column: "part_type_category_id");

            migrationBuilder.CreateIndex(
                name: "permission_name_key",
                schema: "application",
                table: "permission",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "platform_code_key",
                schema: "mes",
                table: "platform",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_po_line_item_part_id",
                schema: "sc",
                table: "po_line_item",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_po_line_item_purchase_order_id",
                schema: "sc",
                table: "po_line_item",
                column: "purchase_order_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_part_id",
                schema: "mes",
                table: "product",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_platform_id",
                schema: "mes",
                table: "product",
                column: "platform_id");

            migrationBuilder.CreateIndex(
                name: "product_image_id_fkey",
                schema: "mes",
                table: "product",
                column: "image_id");

            migrationBuilder.CreateIndex(
                name: "product_number_key",
                schema: "mes",
                table: "product",
                column: "number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "product_sequence_key",
                schema: "mes",
                table: "product",
                column: "sequence",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_program_buyer_id",
                schema: "pm",
                table: "program",
                column: "buyer_id");

            migrationBuilder.CreateIndex(
                name: "IX_program_customer_id",
                schema: "pm",
                table: "program",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_program_program_manager_id",
                schema: "pm",
                table: "program",
                column: "program_manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_program_supply_chain_manager_id",
                schema: "pm",
                table: "program",
                column: "supply_chain_manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_project_program_id",
                schema: "pm",
                table: "project",
                column: "program_id");

            migrationBuilder.CreateIndex(
                name: "IX_project_project_manager_id",
                schema: "pm",
                table: "project",
                column: "project_manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_billing_address_id",
                schema: "sc",
                table: "purchase_order",
                column: "billing_address_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_buyer_id",
                schema: "sc",
                table: "purchase_order",
                column: "buyer_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_company_id",
                schema: "sc",
                table: "purchase_order",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_currency_id",
                schema: "sc",
                table: "purchase_order",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_delivery_address_id",
                schema: "sc",
                table: "purchase_order",
                column: "delivery_address_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_order_department_id",
                schema: "sc",
                table: "purchase_order",
                column: "department_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_payment_term_id",
                schema: "sc",
                table: "purchase_order",
                column: "payment_term_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_project_id",
                schema: "sc",
                table: "purchase_order",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_quotation_reference_id",
                schema: "sc",
                table: "purchase_order",
                column: "quotation_reference_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_requisition_id",
                schema: "sc",
                table: "purchase_order",
                column: "requisition_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_shipping_address_id",
                schema: "sc",
                table: "purchase_order",
                column: "shipping_address_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_supply_chain_lead_id",
                schema: "sc",
                table: "purchase_order",
                column: "supply_chain_lead_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_vendor_billing_address_id",
                schema: "sc",
                table: "purchase_order",
                column: "vendor_billing_address_id");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_order_vendor_billing_contact_id",
                schema: "sc",
                table: "purchase_order",
                column: "vendor_billing_contact_id");

            migrationBuilder.CreateIndex(
                name: "ix_requisition_department_id",
                schema: "sc",
                table: "requisition",
                column: "department_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_requisition_project_id",
                schema: "sc",
                table: "requisition",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_requisition_requested_by_id",
                schema: "sc",
                table: "requisition",
                column: "requested_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_requisition_line_item_part_id",
                schema: "sc",
                table: "requisition_line_item",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_requisition_line_item_requisition_id",
                schema: "sc",
                table: "requisition_line_item",
                column: "requisition_id");

            migrationBuilder.CreateIndex(
                name: "idx_resource_allocation_dates",
                schema: "pm",
                table: "resource_allocation",
                columns: new[] { "start_date", "end_date" },
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_resource_allocation_project_id",
                schema: "pm",
                table: "resource_allocation",
                column: "project_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_resource_allocation_user_dates",
                schema: "pm",
                table: "resource_allocation",
                columns: new[] { "user_id", "start_date", "end_date" },
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_resource_allocation_user_id",
                schema: "pm",
                table: "resource_allocation",
                column: "user_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_resource_allocation_task_id",
                schema: "pm",
                table: "resource_allocation",
                column: "task_id");

            migrationBuilder.CreateIndex(
                name: "IX_role_app_id",
                schema: "application",
                table: "role",
                column: "app_id");

            migrationBuilder.CreateIndex(
                name: "role_role_name_app_id_deleted_at_key",
                schema: "application",
                table: "role",
                columns: new[] { "role_name", "app_id", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_role_filter_role_id",
                schema: "application",
                table: "role_filter",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "role_permission_role_id_permission_deleted_at_key",
                schema: "application",
                table: "role_permission",
                columns: new[] { "role_id", "permission", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_scrap_line_item_part_id",
                schema: "sc",
                table: "scrap_line_item",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_scrap_line_item_scrap_request_id",
                schema: "sc",
                table: "scrap_line_item",
                column: "scrap_request_id");

            migrationBuilder.CreateIndex(
                name: "IX_scrap_request_grn_id",
                schema: "sc",
                table: "scrap_request",
                column: "grn_id");

            migrationBuilder.CreateIndex(
                name: "IX_scrap_request_location_id",
                schema: "sc",
                table: "scrap_request",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_scrap_request_po_id",
                schema: "sc",
                table: "scrap_request",
                column: "po_id");

            migrationBuilder.CreateIndex(
                name: "IX_scrap_request_raised_by_id",
                schema: "sc",
                table: "scrap_request",
                column: "raised_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_scrap_request_wo_id",
                schema: "sc",
                table: "scrap_request",
                column: "wo_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_manager_id",
                schema: "application",
                table: "staff",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_organization_id",
                schema: "application",
                table: "staff",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "staff_email_key",
                schema: "application",
                table: "staff",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_stock_movement_date",
                schema: "sc",
                table: "stock_movement",
                column: "movement_date",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_stock_movement_from_location",
                schema: "sc",
                table: "stock_movement",
                column: "from_location_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_stock_movement_status",
                schema: "sc",
                table: "stock_movement",
                column: "status",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_stock_movement_to_location",
                schema: "sc",
                table: "stock_movement",
                column: "to_location_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_stock_movement_type",
                schema: "sc",
                table: "stock_movement",
                column: "movement_type",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movement_assigned_user_id",
                schema: "sc",
                table: "stock_movement",
                column: "assigned_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movement_from_bin_id",
                schema: "sc",
                table: "stock_movement",
                column: "from_bin_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movement_performed_by_id",
                schema: "sc",
                table: "stock_movement",
                column: "performed_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movement_project_id",
                schema: "sc",
                table: "stock_movement",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movement_to_bin_id",
                schema: "sc",
                table: "stock_movement",
                column: "to_bin_id");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movement_work_order_id",
                schema: "sc",
                table: "stock_movement",
                column: "work_order_id");

            migrationBuilder.CreateIndex(
                name: "stock_movement_movement_number_key",
                schema: "sc",
                table: "stock_movement",
                column: "movement_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_stock_movement_line_item_movement",
                schema: "sc",
                table: "stock_movement_line_item",
                column: "stock_movement_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_stock_movement_line_item_part",
                schema: "sc",
                table: "stock_movement_line_item",
                column: "part_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_subsystem_active",
                schema: "mes",
                table: "subsystem",
                column: "is_active",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_subsystem_code",
                schema: "mes",
                table: "subsystem",
                column: "code",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "subsystem_code_deleted_at_key",
                schema: "mes",
                table: "subsystem",
                columns: new[] { "code", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_task_assigned_to_id",
                schema: "pm",
                table: "task",
                column: "assigned_to_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_board_column_id",
                schema: "pm",
                table: "task",
                column: "board_column_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_milestone_id",
                schema: "pm",
                table: "task",
                column: "milestone_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_parent_task_id",
                schema: "pm",
                table: "task",
                column: "parent_task_id");

            migrationBuilder.CreateIndex(
                name: "IX_task_project_id",
                schema: "pm",
                table: "task",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "idx_task_activity_created_by",
                schema: "pm",
                table: "task_activity",
                columns: new[] { "created_by", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "idx_task_activity_task_id",
                schema: "pm",
                table: "task_activity",
                columns: new[] { "task_id", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "idx_task_activity_type",
                schema: "pm",
                table: "task_activity",
                columns: new[] { "task_id", "activity_type" });

            migrationBuilder.CreateIndex(
                name: "idx_task_assignee_task_id",
                schema: "pm",
                table: "task_assignee",
                column: "task_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_task_assignee_user_id",
                schema: "pm",
                table: "task_assignee",
                column: "user_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "uq_task_assignee",
                schema: "pm",
                table: "task_assignee",
                columns: new[] { "task_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_task_comment_created_at",
                schema: "pm",
                table: "task_comment",
                columns: new[] { "task_id", "created_at" },
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_task_comment_mentions",
                schema: "pm",
                table: "task_comment",
                column: "mentions",
                filter: "(deleted_at IS NULL)")
                .Annotation("Npgsql:IndexMethod", "gin");

            migrationBuilder.CreateIndex(
                name: "idx_task_comment_parent_id",
                schema: "pm",
                table: "task_comment",
                column: "parent_comment_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_task_comment_task_id",
                schema: "pm",
                table: "task_comment",
                column: "task_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_task_dependency_predecessor",
                schema: "pm",
                table: "task_dependency",
                column: "predecessor_task_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_task_dependency_successor",
                schema: "pm",
                table: "task_dependency",
                column: "successor_task_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "uq_task_dependency",
                schema: "pm",
                table: "task_dependency",
                columns: new[] { "predecessor_task_id", "successor_task_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_tender_buyer_id",
                schema: "sc",
                table: "tender",
                column: "buyer_id");

            migrationBuilder.CreateIndex(
                name: "idx_tender_closing_date",
                schema: "sc",
                table: "tender",
                column: "closing_date");

            migrationBuilder.CreateIndex(
                name: "idx_tender_deleted_by",
                schema: "sc",
                table: "tender",
                column: "deleted_by",
                filter: "(deleted_by IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_tender_project_id",
                schema: "sc",
                table: "tender",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "idx_tender_requisition_id",
                schema: "sc",
                table: "tender",
                column: "requisition_id");

            migrationBuilder.CreateIndex(
                name: "idx_tender_status",
                schema: "sc",
                table: "tender",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_tender_awarded_vendor_id",
                schema: "sc",
                table: "tender",
                column: "awarded_vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_tender_currency_id",
                schema: "sc",
                table: "tender",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_tender_payment_term_id",
                schema: "sc",
                table: "tender",
                column: "payment_term_id");

            migrationBuilder.CreateIndex(
                name: "tender_number_key",
                schema: "sc",
                table: "tender",
                column: "tender_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_tender_line_item_deleted_by",
                schema: "sc",
                table: "tender_line_item",
                column: "deleted_by",
                filter: "(deleted_by IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_tender_line_item_part_id",
                schema: "sc",
                table: "tender_line_item",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "idx_tender_line_item_tender_id",
                schema: "sc",
                table: "tender_line_item",
                column: "tender_id");

            migrationBuilder.CreateIndex(
                name: "IX_tender_line_item_unit_of_measure_id",
                schema: "sc",
                table: "tender_line_item",
                column: "unit_of_measure_id");

            migrationBuilder.CreateIndex(
                name: "IX_tender_quotation_company_id",
                schema: "sc",
                table: "tender_quotation",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_tender_quotation_currency_id",
                schema: "sc",
                table: "tender_quotation",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_tender_quotation_document_id",
                schema: "sc",
                table: "tender_quotation",
                column: "document_id");

            migrationBuilder.CreateIndex(
                name: "IX_tender_quotation_tender_id",
                schema: "sc",
                table: "tender_quotation",
                column: "tender_id");

            migrationBuilder.CreateIndex(
                name: "IX_tender_quotation_line_item_tender_line_item_id",
                schema: "sc",
                table: "tender_quotation_line_item",
                column: "tender_line_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_tender_quotation_line_item_tender_quotation_id",
                schema: "sc",
                table: "tender_quotation_line_item",
                column: "tender_quotation_id");

            migrationBuilder.CreateIndex(
                name: "idx_tender_vendor_company_id",
                schema: "sc",
                table: "tender_vendor",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "idx_tender_vendor_deleted_by",
                schema: "sc",
                table: "tender_vendor",
                column: "deleted_by",
                filter: "(deleted_by IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_tender_vendor_status",
                schema: "sc",
                table: "tender_vendor",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "idx_tender_vendor_tender_id",
                schema: "sc",
                table: "tender_vendor",
                column: "tender_id");

            migrationBuilder.CreateIndex(
                name: "idx_tender_vendor_unique",
                schema: "sc",
                table: "tender_vendor",
                columns: new[] { "tender_id", "company_id" },
                unique: true,
                filter: "(deleted_by IS NULL)");

            migrationBuilder.CreateIndex(
                name: "uq_tender_vendor",
                schema: "sc",
                table: "tender_vendor",
                columns: new[] { "tender_id", "company_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_time_entry_date_range",
                schema: "pm",
                table: "time_entry",
                columns: new[] { "user_id", "entry_date" },
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_time_entry_entry_date",
                schema: "pm",
                table: "time_entry",
                column: "entry_date",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_time_entry_task_id",
                schema: "pm",
                table: "time_entry",
                column: "task_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_time_entry_task_user",
                schema: "pm",
                table: "time_entry",
                columns: new[] { "task_id", "user_id" },
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "idx_time_entry_user_id",
                schema: "pm",
                table: "time_entry",
                column: "user_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_tool_tool_type_id",
                schema: "mes",
                table: "tool",
                column: "tool_type_id");

            migrationBuilder.CreateIndex(
                name: "tool_number_key",
                schema: "mes",
                table: "tool",
                column: "number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_department_id",
                schema: "application",
                table: "user",
                column: "department_id",
                filter: "(deleted_at IS NULL)");

            migrationBuilder.CreateIndex(
                name: "user_email_deleted_at_key",
                schema: "application",
                table: "user",
                columns: new[] { "email", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "user_user_number_key",
                schema: "application",
                table: "user",
                column: "user_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_role_role_id",
                schema: "application",
                table: "user_role",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_role_user_id",
                schema: "application",
                table: "user_role",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_return_line_item_grn_line_item_id",
                schema: "sc",
                table: "vendor_return_line_item",
                column: "grn_line_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_return_line_item_part_id",
                schema: "sc",
                table: "vendor_return_line_item",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_return_line_item_return_request_id",
                schema: "sc",
                table: "vendor_return_line_item",
                column: "return_request_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_return_request_grn_id",
                schema: "sc",
                table: "vendor_return_request",
                column: "grn_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_return_request_location_id",
                schema: "sc",
                table: "vendor_return_request",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_return_request_po_id",
                schema: "sc",
                table: "vendor_return_request",
                column: "po_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_return_request_raised_by_id",
                schema: "sc",
                table: "vendor_return_request",
                column: "raised_by_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_return_request_vendor_id",
                schema: "sc",
                table: "vendor_return_request",
                column: "vendor_id");

            migrationBuilder.CreateIndex(
                name: "IX_vendor_return_request_wo_id",
                schema: "sc",
                table: "vendor_return_request",
                column: "wo_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_order_guide_id",
                schema: "mes",
                table: "work_order",
                column: "guide_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_order_manager_id",
                schema: "mes",
                table: "work_order",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_order_part_id",
                schema: "mes",
                table: "work_order",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_order_product_id",
                schema: "mes",
                table: "work_order",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_order_technician_id",
                schema: "mes",
                table: "work_order",
                column: "technician_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_order_work_package_id",
                schema: "mes",
                table: "work_order",
                column: "work_package_id");

            migrationBuilder.CreateIndex(
                name: "work_order_kit_id_key",
                schema: "mes",
                table: "work_order",
                column: "kit_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "work_order_number_key",
                schema: "mes",
                table: "work_order",
                column: "number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_work_order_step_guide_step_id",
                schema: "mes",
                table: "work_order_step",
                column: "guide_step_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_order_step_work_order_id",
                schema: "mes",
                table: "work_order_step",
                column: "work_order_id");

            migrationBuilder.CreateIndex(
                name: "work_order_step_image_id_fkey",
                schema: "mes",
                table: "work_order_step",
                column: "image_id");

            migrationBuilder.CreateIndex(
                name: "work_order_step_manager_id_fkey",
                schema: "mes",
                table: "work_order_step",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "work_order_step_technician_id_fkey",
                schema: "mes",
                table: "work_order_step",
                column: "technician_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_order_task_guide_step_task_id",
                schema: "mes",
                table: "work_order_task",
                column: "guide_step_task_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_order_task_work_order_step_id",
                schema: "mes",
                table: "work_order_task",
                column: "work_order_step_id");

            migrationBuilder.CreateIndex(
                name: "work_order_task_work_order_id_guide_step_task_id_key",
                schema: "mes",
                table: "work_order_task",
                columns: new[] { "work_order_id", "guide_step_task_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_work_package_guide_id",
                schema: "mes",
                table: "work_package",
                column: "guide_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_package_manager_id",
                schema: "mes",
                table: "work_package",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_package_part_id",
                schema: "mes",
                table: "work_package",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_package_product_id",
                schema: "mes",
                table: "work_package",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_package_technician_id",
                schema: "mes",
                table: "work_package",
                column: "technician_id");

            migrationBuilder.CreateIndex(
                name: "work_package_number_key",
                schema: "mes",
                table: "work_package",
                column: "number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "work_package_sequence_key",
                schema: "mes",
                table: "work_package",
                column: "sequence",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_approval_user_approver_id",
                schema: "common",
                table: "approval",
                column: "approver_id",
                principalSchema: "application",
                principalTable: "user",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_approval_notification_recipient_user",
                schema: "common",
                table: "approval_notification_recipient",
                column: "recipient_user_id",
                principalSchema: "application",
                principalTable: "user",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "board_column_project_id_fkey",
                schema: "pm",
                table: "board_column",
                column: "project_id",
                principalSchema: "pm",
                principalTable: "project",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "dashboard_widget_project_id_fkey",
                schema: "pm",
                table: "dashboard_widget",
                column: "project_id",
                principalSchema: "pm",
                principalTable: "project",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_department_head",
                schema: "common",
                table: "department",
                column: "head_of_department_user_id",
                principalSchema: "application",
                principalTable: "user",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_department_head",
                schema: "common",
                table: "department");

            migrationBuilder.DropTable(
                name: "additional_recipient_configuration",
                schema: "common");

            migrationBuilder.DropTable(
                name: "approval",
                schema: "common");

            migrationBuilder.DropTable(
                name: "approval_configuration",
                schema: "common");

            migrationBuilder.DropTable(
                name: "approval_log",
                schema: "common");

            migrationBuilder.DropTable(
                name: "approval_notification_recipient",
                schema: "common");

            migrationBuilder.DropTable(
                name: "bulk_upload",
                schema: "application");

            migrationBuilder.DropTable(
                name: "company_address",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "company_bank_account",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "company_contact",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "company_part",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "dashboard_widget",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "ebom",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "eco_log",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "eco_part",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "email_log",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "email_template",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "fcm_token",
                schema: "common");

            migrationBuilder.DropTable(
                name: "feature_bit",
                schema: "application");

            migrationBuilder.DropTable(
                name: "guide_check_out_history",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "guide_ebom",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "guide_mbom",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "guide_step_equipment",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "inventory_part",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "inventory_stock",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "inventory_transaction",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "issue",
                schema: "application");

            migrationBuilder.DropTable(
                name: "kit_bom_comment",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "kit_serial",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "news",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "option_set",
                schema: "application");

            migrationBuilder.DropTable(
                name: "organization_address",
                schema: "application");

            migrationBuilder.DropTable(
                name: "permission",
                schema: "application");

            migrationBuilder.DropTable(
                name: "requisition_line_item",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "resource_allocation",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "role_filter",
                schema: "application");

            migrationBuilder.DropTable(
                name: "role_permission",
                schema: "application");

            migrationBuilder.DropTable(
                name: "scrap_line_item",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "staff",
                schema: "application");

            migrationBuilder.DropTable(
                name: "stock_movement_line_item",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "task_activity",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "task_assignee",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "task_comment",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "task_dependency",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "tender_quotation_line_item",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "tender_vendor",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "time_entry",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "user_role",
                schema: "application");

            migrationBuilder.DropTable(
                name: "vendor_return_line_item",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "work_order_task",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "bank_account",
                schema: "common");

            migrationBuilder.DropTable(
                name: "assembly_location",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "machine",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "tool",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "news_type",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "scrap_request",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "organization",
                schema: "application");

            migrationBuilder.DropTable(
                name: "stock_movement",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "tender_line_item",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "tender_quotation",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "task",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "role",
                schema: "application");

            migrationBuilder.DropTable(
                name: "grn_line_item",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "vendor_return_request",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "guide_step_task",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "work_order_step",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "machine_type",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "tool_type",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "bin_management",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "tender",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "board_column",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "milestone",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "app",
                schema: "application");

            migrationBuilder.DropTable(
                name: "po_line_item",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "goods_receipt_note",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "guide_step",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "work_order",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "purchase_order",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "video",
                schema: "common");

            migrationBuilder.DropTable(
                name: "kit",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "work_package",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "document",
                schema: "common");

            migrationBuilder.DropTable(
                name: "requisition",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "contact",
                schema: "common");

            migrationBuilder.DropTable(
                name: "material_kit",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "guide",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "product",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "project",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "company",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "location",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "guide_type",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "image",
                schema: "common");

            migrationBuilder.DropTable(
                name: "part",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "platform",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "program",
                schema: "pm");

            migrationBuilder.DropTable(
                name: "currency",
                schema: "common");

            migrationBuilder.DropTable(
                name: "payment_term",
                schema: "sc");

            migrationBuilder.DropTable(
                name: "eco",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "part_type",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "subsystem",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "unit_of_measure",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "customer",
                schema: "application");

            migrationBuilder.DropTable(
                name: "part_level",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "part_type_category",
                schema: "mes");

            migrationBuilder.DropTable(
                name: "address",
                schema: "common");

            migrationBuilder.DropTable(
                name: "country",
                schema: "common");

            migrationBuilder.DropTable(
                name: "user",
                schema: "application");

            migrationBuilder.DropTable(
                name: "department",
                schema: "common");

            migrationBuilder.DropSequence(
                name: "app_app_number_seq",
                schema: "application");

            migrationBuilder.DropSequence(
                name: "company_code_seq",
                schema: "sc");

            migrationBuilder.DropSequence(
                name: "customer_code_seq",
                schema: "sc");

            migrationBuilder.DropSequence(
                name: "grn_seq",
                schema: "sc");

            migrationBuilder.DropSequence(
                name: "guide_sequence_seq",
                schema: "mes");

            migrationBuilder.DropSequence(
                name: "material_kit_sequence_seq",
                schema: "mes");

            migrationBuilder.DropSequence(
                name: "partner_code_seq",
                schema: "sc");

            migrationBuilder.DropSequence(
                name: "product_sequence_seq",
                schema: "mes");

            migrationBuilder.DropSequence(
                name: "program_code_seq",
                schema: "pm");

            migrationBuilder.DropSequence(
                name: "project_code_seq",
                schema: "pm");

            migrationBuilder.DropSequence(
                name: "purchase_order_seq",
                schema: "sc");

            migrationBuilder.DropSequence(
                name: "req_seq",
                schema: "sc");

            migrationBuilder.DropSequence(
                name: "role_role_number_seq",
                schema: "application");

            migrationBuilder.DropSequence(
                name: "scrap_number_seq",
                schema: "sc");

            migrationBuilder.DropSequence(
                name: "task_code_seq",
                schema: "pm");

            migrationBuilder.DropSequence(
                name: "user_user_number_seq",
                schema: "application");

            migrationBuilder.DropSequence(
                name: "vendor_code_seq",
                schema: "sc");

            migrationBuilder.DropSequence(
                name: "vendor_return_number_seq",
                schema: "sc");

            migrationBuilder.DropSequence(
                name: "work_package_sequence_seq",
                schema: "mes");
        }
    }
}
