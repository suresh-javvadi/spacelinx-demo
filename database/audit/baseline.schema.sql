--
-- PostgreSQL database dump
--

\restrict u0FaYQAlJnLlcXDo9Bty5RmVG8k8eVY9qRiXc5oS4Iq3ot7sizEaayoTh75MqAB

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: application; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA application;


--
-- Name: common; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA common;


--
-- Name: mes; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA mes;


--
-- Name: pm; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pm;


--
-- Name: sc; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA sc;


--
-- Name: generate_alphanumeric_sequence(character varying, bigint); Type: FUNCTION; Schema: application; Owner: -
--

CREATE FUNCTION application.generate_alphanumeric_sequence(prefix character varying, seq_num bigint) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN prefix || TO_CHAR(seq_num, 'FM00000000');
END;
$$;


--
-- Name: generate_eco_number(); Type: FUNCTION; Schema: mes; Owner: -
--

CREATE FUNCTION mes.generate_eco_number() RETURNS character varying
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
$$;


--
-- Name: generate_program_code(); Type: FUNCTION; Schema: pm; Owner: -
--

CREATE FUNCTION pm.generate_program_code() RETURNS character varying
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
$$;


--
-- Name: generate_project_code(); Type: FUNCTION; Schema: pm; Owner: -
--

CREATE FUNCTION pm.generate_project_code() RETURNS character varying
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
$$;


--
-- Name: generate_task_code(); Type: FUNCTION; Schema: pm; Owner: -
--

CREATE FUNCTION pm.generate_task_code() RETURNS character varying
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
$$;


--
-- Name: generate_company_code(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_company_code() RETURNS character varying
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
$$;


--
-- Name: generate_customer_code(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_customer_code() RETURNS character varying
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
$$;


--
-- Name: generate_grn_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_grn_number() RETURNS character varying
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
$$;


--
-- Name: generate_partner_code(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_partner_code() RETURNS character varying
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
$$;


--
-- Name: generate_purchase_order_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_purchase_order_number() RETURNS character varying
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
$$;


--
-- Name: generate_req_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_req_number() RETURNS character varying
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
$$;


--
-- Name: generate_scrap_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_scrap_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    next_val := nextval('sc.scrap_number_seq');
    RETURN 'SCR-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_stock_movement_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_stock_movement_number() RETURNS character varying
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
$$;


--
-- Name: generate_vendor_code(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_vendor_code() RETURNS character varying
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
$$;


--
-- Name: generate_vendor_return_number(); Type: FUNCTION; Schema: sc; Owner: -
--

CREATE FUNCTION sc.generate_vendor_return_number() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_val INT;
BEGIN
    next_val := nextval('sc.vendor_return_number_seq');

    RETURN 'VRN-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.app (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    app_number integer NOT NULL,
    app_name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: app_app_number_seq; Type: SEQUENCE; Schema: application; Owner: -
--

CREATE SEQUENCE application.app_app_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: app_app_number_seq1; Type: SEQUENCE; Schema: application; Owner: -
--

ALTER TABLE application.app ALTER COLUMN app_number ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME application.app_app_number_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bulk_upload; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.bulk_upload (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    application_name character varying(255) DEFAULT 'All'::character varying NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    requested_by character varying(255) NOT NULL,
    requested_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type character varying(255) NOT NULL,
    error json,
    status character varying(255) NOT NULL,
    total_count integer,
    success_count integer,
    failed_count integer,
    url character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: customer; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.customer (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    tax_number character varying(255),
    category character varying(255),
    customer_address_id uuid,
    image_url character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: feature_bit; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.feature_bit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    feature_name character varying(255) NOT NULL,
    application_name character varying(255) DEFAULT 'All'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: issue; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.issue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_name character varying(255),
    issue_type character varying(100) NOT NULL,
    priority character varying(50),
    summary text NOT NULL,
    description text,
    product_id uuid,
    guide_id uuid,
    work_order_id uuid,
    jira_id character varying(255),
    devops_id character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: option_set; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.option_set (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    application_name character varying(255) DEFAULT 'All'::character varying NOT NULL,
    description text,
    "values" json NOT NULL,
    display_name character varying(255) NOT NULL,
    columns json,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: organization; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(255),
    description text,
    image_url character varying(500),
    tax_number character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: organization_address; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.organization_address (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    address_id uuid NOT NULL,
    address_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: permission; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.permission (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    category_name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: role; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.role (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_number integer NOT NULL,
    role_name character varying(255) NOT NULL,
    role_description text,
    app_id uuid NOT NULL,
    system_defined boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: role_filter; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.role_filter (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    entity character varying(100) NOT NULL,
    key character varying(100) NOT NULL,
    operator character varying(20) NOT NULL,
    value text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: role_permission; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.role_permission (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission character varying(255) NOT NULL,
    enable boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: role_role_number_seq; Type: SEQUENCE; Schema: application; Owner: -
--

CREATE SEQUENCE application.role_role_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_role_number_seq1; Type: SEQUENCE; Schema: application; Owner: -
--

ALTER TABLE application.role ALTER COLUMN role_number ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME application.role_role_number_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: staff; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255),
    email character varying(255) NOT NULL,
    phone character varying(255),
    organization_id uuid NOT NULL,
    manager_id uuid,
    staff_number character varying(50),
    job_title character varying(255),
    employment_start_date date,
    employment_end_date date,
    image_url character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: user; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_number integer NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255),
    email character varying(255) NOT NULL,
    phone character varying(255),
    image_url text,
    department character varying(255),
    job_title character varying(255),
    department_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: user_role; Type: TABLE; Schema: application; Owner: -
--

CREATE TABLE application.user_role (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: user_user_number_seq; Type: SEQUENCE; Schema: application; Owner: -
--

CREATE SEQUENCE application.user_user_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_user_number_seq1; Type: SEQUENCE; Schema: application; Owner: -
--

ALTER TABLE application."user" ALTER COLUMN user_number ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME application.user_user_number_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: additional_recipient_configuration; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.additional_recipient_configuration (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_code character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    recipient_name character varying(255),
    recipient_type character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: address; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.address (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    postal_code character varying(20),
    country_id uuid NOT NULL,
    phone_number character varying(20),
    latitude numeric(9,6),
    longitude numeric(9,6),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: approval; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.approval (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id uuid NOT NULL,
    stage_number integer NOT NULL,
    approver_id uuid NOT NULL,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    acted_at timestamp with time zone,
    comment text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT approval_stage_number_check CHECK ((stage_number >= 1)),
    CONSTRAINT approval_status_check CHECK (((status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Cancelled'::character varying)::text, ('Removed'::character varying)::text])))
);


--
-- Name: approval_configuration; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.approval_configuration (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(100) NOT NULL,
    number_of_levels integer DEFAULT 1 NOT NULL,
    description text,
    require_sequential_approval boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_number_of_levels_positive CHECK ((number_of_levels > 0))
);


--
-- Name: approval_log; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.approval_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    action_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action_by character varying(255) NOT NULL,
    stage_number integer,
    notes text,
    previous_status character varying(50),
    new_status character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_stage_number_positive CHECK (((stage_number IS NULL) OR (stage_number > 0)))
);


--
-- Name: approval_notification_recipient; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.approval_notification_recipient (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    recipient_user_id uuid NOT NULL,
    recipient_type character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_recipient_type CHECK (((recipient_type IS NULL) OR ((recipient_type)::text = ANY (ARRAY[('CC'::character varying)::text, ('Watcher'::character varying)::text, ('Stakeholder'::character varying)::text]))))
);


--
-- Name: bank_account; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.bank_account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bank_name character varying(255) NOT NULL,
    branch_name character varying(255) NOT NULL,
    account_number character varying(100) NOT NULL,
    swift_code character varying(20),
    currency_id uuid,
    ifsc_code character varying(20),
    address_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: contact; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.contact (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone_number character varying(20),
    alternate_phone character varying(20),
    company_id uuid,
    job_title character varying(100),
    notes text,
    is_primary boolean DEFAULT false,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: country; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.country (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    iso2_code character varying(2) NOT NULL,
    iso3_code character varying(3) NOT NULL,
    numeric_code integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: currency; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.currency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(3) NOT NULL,
    name character varying(100) NOT NULL,
    symbol character varying(10),
    country character varying(100),
    minor_unit integer DEFAULT 2,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: department; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.department (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    parent_department_id uuid,
    head_of_department_user_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: document; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.document (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_type character varying(100) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    file_name character varying(255),
    file_extension character varying(50),
    file_size bigint,
    file_path character varying(500),
    file_relative_path character varying(500) NOT NULL,
    title character varying(255),
    description text,
    external_url text,
    mime_type character varying(100),
    tags text[],
    metadata jsonb,
    document_storage_type character varying(20) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_document_storage_type CHECK (((document_storage_type)::text = ANY (ARRAY[('uploaded'::character varying)::text, ('external_url'::character varying)::text])))
);


--
-- Name: fcm_token; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.fcm_token (
    email character varying(255) NOT NULL,
    device_id character varying(255) NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_token character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: image; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.image (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_type character varying(100) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_extension character varying(50) NOT NULL,
    file_size bigint NOT NULL,
    file_path character varying(255) NOT NULL,
    file_relative_path character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: video; Type: TABLE; Schema: common; Owner: -
--

CREATE TABLE common.video (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    video_type character varying(100) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_extension character varying(50) NOT NULL,
    file_size bigint NOT NULL,
    file_path character varying(255) NOT NULL,
    file_relative_path character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: assembly_location; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.assembly_location (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: ebom; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.ebom (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_id uuid NOT NULL,
    child_part_id uuid NOT NULL,
    quantity integer NOT NULL,
    assembly_location_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: eco; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.eco (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(50) DEFAULT mes.generate_eco_number() NOT NULL,
    name character varying(255) NOT NULL,
    reason_for_change text NOT NULL,
    description text,
    change_type character varying(255) NOT NULL,
    impact_analysis text,
    priority character varying(255) DEFAULT 'Low'::character varying NOT NULL,
    requestor character varying(255) NOT NULL,
    approver character varying(255),
    planned_implementation_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    approved_by character varying(255),
    approved_date timestamp with time zone,
    status character varying(255) DEFAULT 'Draft'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT eco_status_check CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Discarded'::character varying)::text, ('Rejected'::character varying)::text, ('Released'::character varying)::text])))
);


--
-- Name: eco_log; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.eco_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    eco_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    action_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action_by character varying(255) NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: eco_part; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.eco_part (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    eco_id uuid NOT NULL,
    part_id uuid NOT NULL,
    status character varying(255) NOT NULL,
    previous_status character varying(255) NOT NULL,
    description text,
    old_version character varying(255) NOT NULL,
    new_version character varying(255),
    effective_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT eco_part_status_check CHECK (((status)::text = ANY (ARRAY[('Obsolete'::character varying)::text, ('Release'::character varying)::text])))
);


--
-- Name: email_log; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.email_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_code character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id uuid,
    recipient_email character varying(255) NOT NULL,
    subject character varying(500) NOT NULL,
    body text NOT NULL,
    status character varying(50) DEFAULT 'Pending'::character varying NOT NULL,
    sent_at timestamp with time zone,
    error_message text,
    retry_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: email_template; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.email_template (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    subject character varying(500) NOT NULL,
    body text NOT NULL,
    description text,
    is_html boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_sequence_seq; Type: SEQUENCE; Schema: mes; Owner: -
--

CREATE SEQUENCE mes.guide_sequence_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: guide; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    sequence integer NOT NULL,
    number character varying(255) DEFAULT application.generate_alphanumeric_sequence('GD-'::character varying, currval('mes.guide_sequence_seq'::regclass)) NOT NULL,
    platform_id uuid,
    part_id uuid NOT NULL,
    guide_type_id uuid NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    status character varying(255) DEFAULT 'Draft'::character varying NOT NULL,
    check_out_by character varying(255),
    clone_from_id uuid,
    calculated_weight double precision NOT NULL,
    category character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_check_out_history; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_check_out_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guide_id uuid NOT NULL,
    is_checked_out boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_ebom; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_ebom (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guide_id uuid NOT NULL,
    part_id uuid NOT NULL,
    child_part_id uuid NOT NULL,
    quantity integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_mbom; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_mbom (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guide_id uuid NOT NULL,
    part_id uuid NOT NULL,
    quantity integer NOT NULL,
    weight double precision NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_sequence_seq1; Type: SEQUENCE; Schema: mes; Owner: -
--

ALTER TABLE mes.guide ALTER COLUMN sequence ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME mes.guide_sequence_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: guide_step; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_step (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    guide_id uuid NOT NULL,
    image_id uuid,
    video_id uuid,
    sequence integer NOT NULL,
    comment text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_step_equipment; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_step_equipment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    equipment_type character varying(255) NOT NULL,
    part_id uuid,
    tool_id uuid,
    machine_id uuid,
    quantity integer NOT NULL,
    guide_step_id uuid NOT NULL,
    guide_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_step_task; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_step_task (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(450) NOT NULL,
    type character varying(50) NOT NULL,
    taskdetails json,
    description text,
    ismandatory integer NOT NULL,
    sequence integer,
    guide_step_id uuid NOT NULL,
    guide_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: guide_type; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.guide_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: kit; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.kit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255) NOT NULL,
    part_id uuid NOT NULL,
    location_id uuid,
    material_kit_id uuid,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: kit_bom_comment; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.kit_bom_comment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kit_id uuid NOT NULL,
    part_id uuid NOT NULL,
    comments character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: kit_serial; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.kit_serial (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kit_id uuid NOT NULL,
    part_id uuid NOT NULL,
    serialno character varying(255),
    status character varying(255) DEFAULT 'Unconsumed'::character varying,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: location; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.location (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: machine; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.machine (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    machine_type_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: machine_type; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.machine_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: material_kit_sequence_seq; Type: SEQUENCE; Schema: mes; Owner: -
--

CREATE SEQUENCE mes.material_kit_sequence_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: material_kit; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.material_kit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    sequence integer NOT NULL,
    number character varying(255) DEFAULT application.generate_alphanumeric_sequence('KIT-'::character varying, currval('mes.material_kit_sequence_seq'::regclass)) NOT NULL,
    part_id uuid NOT NULL,
    location_id uuid NOT NULL,
    image_id uuid,
    quantity integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: material_kit_sequence_seq1; Type: SEQUENCE; Schema: mes; Owner: -
--

ALTER TABLE mes.material_kit ALTER COLUMN sequence ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME mes.material_kit_sequence_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: news; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.news (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    news_type_id uuid NOT NULL,
    hyperlink character varying(255) NOT NULL,
    origin character varying(255) NOT NULL,
    image character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: news_type; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.news_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: part; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.part (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255),
    name character varying(255) NOT NULL,
    short_description text,
    description text,
    part_type_id uuid NOT NULL,
    weight double precision DEFAULT 0.0 NOT NULL,
    part_number_suffix character varying(255) NOT NULL,
    version character(2) DEFAULT '01'::bpchar NOT NULL,
    part_number character varying(255) GENERATED ALWAYS AS ((((part_number_suffix)::text || '-'::text) || (version)::text)) STORED NOT NULL,
    eco_id uuid,
    status character varying(20) DEFAULT 'Draft'::character varying,
    unit_of_measure_id uuid,
    make_buy integer NOT NULL,
    is_serial_number_required boolean DEFAULT true NOT NULL,
    unit_price numeric(18,4),
    manufacturing_part_number text,
    manufacturer_name character varying(255),
    trl integer,
    space_qualified boolean,
    item_type character varying(255),
    reference_number character varying(255),
    has_bom boolean DEFAULT false NOT NULL,
    material character varying(255),
    grade character varying(100),
    country_of_origin_id uuid,
    subsystem_id uuid,
    specification text,
    package character varying(100),
    qualification character varying(100),
    radiation_tolerance character varying(100),
    temp_range character varying(50),
    temp_coefficient character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_manufacturer_details_required CHECK ((((make_buy = 1) AND (((item_type)::text = ANY (ARRAY[('Goods'::character varying)::text, ('Services'::character varying)::text])) OR ((manufacturing_part_number IS NOT NULL) AND (TRIM(BOTH FROM manufacturing_part_number) <> ''::text) AND (manufacturer_name IS NOT NULL) AND (TRIM(BOTH FROM manufacturer_name) <> ''::text)))) OR (make_buy = 0))),
    CONSTRAINT part_status_check CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Release'::character varying)::text, ('Obsolete'::character varying)::text, ('Archived'::character varying)::text]))),
    CONSTRAINT part_version_check CHECK ((version ~ '^[0-9]{2}$'::text))
);


--
-- Name: part_level; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.part_level (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    sort_order integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: part_type; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.part_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    part_number_prefix character varying(3),
    category character varying(255),
    category_type character varying(255),
    is_visible_in_ui boolean DEFAULT true NOT NULL,
    department character varying(255),
    part_type_category_id uuid,
    part_level_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: part_type_category; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.part_type_category (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: platform; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.platform (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(1000) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: product_sequence_seq; Type: SEQUENCE; Schema: mes; Owner: -
--

CREATE SEQUENCE mes.product_sequence_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.product (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    sequence integer NOT NULL,
    number character varying(255) DEFAULT application.generate_alphanumeric_sequence('PD-'::character varying, currval('mes.product_sequence_seq'::regclass)) NOT NULL,
    platform_id uuid,
    part_id uuid NOT NULL,
    image_id uuid,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: product_sequence_seq1; Type: SEQUENCE; Schema: mes; Owner: -
--

ALTER TABLE mes.product ALTER COLUMN sequence ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME mes.product_sequence_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: subsystem; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.subsystem (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: tool; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.tool (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    tool_type_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: tool_type; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.tool_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: unit_of_measure; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.unit_of_measure (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: work_order; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.work_order (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    work_package_id uuid,
    kit_id uuid,
    technician_id uuid,
    manager_id uuid,
    guide_id uuid,
    part_id uuid NOT NULL,
    product_id uuid,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    actual_start_date timestamp with time zone,
    actual_end_date timestamp with time zone,
    execution_time interval,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: work_order_step; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.work_order_step (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    guide_step_id uuid NOT NULL,
    technician_id uuid,
    manager_id uuid,
    status character varying(50) DEFAULT 'Pending'::character varying NOT NULL,
    execution_time interval,
    captured_time interval,
    image_id uuid,
    comment character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: work_order_task; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.work_order_task (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    guide_step_task_id uuid NOT NULL,
    task_response json,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    work_order_step_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: work_package_sequence_seq; Type: SEQUENCE; Schema: mes; Owner: -
--

CREATE SEQUENCE mes.work_package_sequence_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_package; Type: TABLE; Schema: mes; Owner: -
--

CREATE TABLE mes.work_package (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sequence integer NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(255) DEFAULT application.generate_alphanumeric_sequence('WO-'::character varying, currval('mes.work_package_sequence_seq'::regclass)) NOT NULL,
    quantity integer NOT NULL,
    technician_id uuid,
    manager_id uuid,
    guide_id uuid,
    part_id uuid NOT NULL,
    product_id uuid,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    actual_start_date timestamp with time zone,
    actual_end_date timestamp with time zone,
    status character varying(255) DEFAULT 'Pending'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: work_package_sequence_seq1; Type: SEQUENCE; Schema: mes; Owner: -
--

ALTER TABLE mes.work_package ALTER COLUMN sequence ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME mes.work_package_sequence_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: board_column; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.board_column (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "position" integer DEFAULT 0 NOT NULL,
    color character varying(50) DEFAULT '#1976d2'::character varying NOT NULL,
    wip_limit integer,
    is_default boolean DEFAULT false NOT NULL,
    maps_to_status character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE board_column; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.board_column IS 'Kanban board columns for each project';


--
-- Name: COLUMN board_column."position"; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.board_column."position" IS 'Order position of column from left to right';


--
-- Name: COLUMN board_column.color; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.board_column.color IS 'Column header color (hex code)';


--
-- Name: COLUMN board_column.wip_limit; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.board_column.wip_limit IS 'Work-in-progress limit for the column (null = no limit)';


--
-- Name: COLUMN board_column.is_default; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.board_column.is_default IS 'Whether this is the default column for new tasks';


--
-- Name: COLUMN board_column.maps_to_status; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.board_column.maps_to_status IS 'Task status that this column maps to (e.g., To Do, In Progress)';


--
-- Name: dashboard_widget; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.dashboard_widget (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    widget_type character varying(50) NOT NULL,
    title character varying(100),
    position_x integer DEFAULT 0 NOT NULL,
    position_y integer DEFAULT 0 NOT NULL,
    width integer DEFAULT 4 NOT NULL,
    height integer DEFAULT 2 NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    project_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT dashboard_widget_widget_type_check CHECK (((widget_type)::text = ANY (ARRAY[('TaskSummary'::character varying)::text, ('ProjectProgress'::character varying)::text, ('OverdueTasks'::character varying)::text, ('MyTasks'::character varying)::text, ('TeamWorkload'::character varying)::text, ('RecentActivity'::character varying)::text, ('TimeLoggedChart'::character varying)::text, ('MilestoneTracker'::character varying)::text, ('PriorityBreakdown'::character varying)::text, ('StatusDistribution'::character varying)::text])))
);


--
-- Name: TABLE dashboard_widget; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.dashboard_widget IS 'User-configurable dashboard widgets for project management';


--
-- Name: COLUMN dashboard_widget.user_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.user_id IS 'Reference to the user who owns this widget configuration';


--
-- Name: COLUMN dashboard_widget.widget_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.widget_type IS 'Type of widget to render';


--
-- Name: COLUMN dashboard_widget.title; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.title IS 'Custom title for the widget (optional)';


--
-- Name: COLUMN dashboard_widget.position_x; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.position_x IS 'Grid X position (react-grid-layout)';


--
-- Name: COLUMN dashboard_widget.position_y; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.position_y IS 'Grid Y position (react-grid-layout)';


--
-- Name: COLUMN dashboard_widget.width; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.width IS 'Widget width in grid units';


--
-- Name: COLUMN dashboard_widget.height; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.height IS 'Widget height in grid units';


--
-- Name: COLUMN dashboard_widget.settings; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.settings IS 'Widget-specific settings as JSON (filters, display options, etc.)';


--
-- Name: COLUMN dashboard_widget.project_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.dashboard_widget.project_id IS 'Optional: Filter widget data to specific project';


--
-- Name: milestone; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.milestone (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    project_id uuid,
    target_date timestamp with time zone,
    status character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: program; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.program (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    program_code character varying(255) DEFAULT pm.generate_program_code() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    customer_id uuid,
    program_manager_id uuid,
    supply_chain_manager_id uuid,
    buyer_id uuid,
    status character varying(255),
    goals text,
    budget numeric(18,4),
    actual_spend numeric(18,4),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: program_code_seq; Type: SEQUENCE; Schema: pm; Owner: -
--

CREATE SEQUENCE pm.program_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.project (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_code character varying(255) DEFAULT pm.generate_project_code() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    program_id uuid,
    project_manager_id uuid,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    status character varying(255),
    budget numeric(18,4),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: project_code_seq; Type: SEQUENCE; Schema: pm; Owner: -
--

CREATE SEQUENCE pm.project_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: resource_allocation; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.resource_allocation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    project_id uuid NOT NULL,
    task_id uuid,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    allocated_hours_per_day numeric(4,2) DEFAULT 8.0 NOT NULL,
    allocation_percent integer DEFAULT 100 NOT NULL,
    allocation_type character varying(50) DEFAULT 'Project'::character varying NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_date_range CHECK ((end_date >= start_date)),
    CONSTRAINT resource_allocation_allocated_hours_per_day_check CHECK (((allocated_hours_per_day > (0)::numeric) AND (allocated_hours_per_day <= (24)::numeric))),
    CONSTRAINT resource_allocation_allocation_percent_check CHECK (((allocation_percent > 0) AND (allocation_percent <= 100))),
    CONSTRAINT resource_allocation_allocation_type_check CHECK (((allocation_type)::text = ANY (ARRAY[('Project'::character varying)::text, ('Task'::character varying)::text, ('Overhead'::character varying)::text, ('Leave'::character varying)::text, ('Training'::character varying)::text])))
);


--
-- Name: TABLE resource_allocation; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.resource_allocation IS 'Resource allocation tracking for capacity planning';


--
-- Name: COLUMN resource_allocation.user_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.user_id IS 'User being allocated to the resource';


--
-- Name: COLUMN resource_allocation.project_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.project_id IS 'Project the resource is allocated to';


--
-- Name: COLUMN resource_allocation.task_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.task_id IS 'Optional: Specific task within the project';


--
-- Name: COLUMN resource_allocation.start_date; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.start_date IS 'Start date of allocation period';


--
-- Name: COLUMN resource_allocation.end_date; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.end_date IS 'End date of allocation period';


--
-- Name: COLUMN resource_allocation.allocated_hours_per_day; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.allocated_hours_per_day IS 'Hours per day allocated to this work';


--
-- Name: COLUMN resource_allocation.allocation_percent; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.allocation_percent IS 'Percentage of daily capacity (100% = full time)';


--
-- Name: COLUMN resource_allocation.allocation_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.resource_allocation.allocation_type IS 'Type of allocation (Project, Task, Overhead, Leave, Training)';


--
-- Name: task; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.task (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    project_id uuid,
    assigned_to_id uuid,
    status character varying(255) NOT NULL,
    due_date timestamp with time zone,
    priority character varying(255) NOT NULL,
    milestone_id uuid,
    parent_task_id uuid,
    task_code character varying(50) DEFAULT pm.generate_task_code(),
    start_date timestamp with time zone,
    estimated_hours numeric(8,2),
    actual_hours numeric(8,2),
    progress_percent integer DEFAULT 0 NOT NULL,
    task_type character varying(50) DEFAULT 'Task'::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    board_column_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_progress_percent CHECK (((progress_percent >= 0) AND (progress_percent <= 100))),
    CONSTRAINT chk_task_type CHECK (((task_type)::text = ANY (ARRAY[('Task'::character varying)::text, ('Milestone'::character varying)::text, ('SubTask'::character varying)::text]))),
    CONSTRAINT task_priority_check CHECK (((priority)::text = ANY (ARRAY[('High'::character varying)::text, ('Medium'::character varying)::text, ('Low'::character varying)::text]))),
    CONSTRAINT task_status_check CHECK (((status)::text = ANY ('{Completed,"In Progress","To Do",Logged,Review}'::text[])))
);


--
-- Name: COLUMN task.parent_task_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.parent_task_id IS 'Self-referential FK for subtask hierarchy';


--
-- Name: COLUMN task.task_code; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.task_code IS 'Auto-generated unique task code (TSK-XXXXXX)';


--
-- Name: COLUMN task.start_date; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.start_date IS 'Task start date for Gantt chart';


--
-- Name: COLUMN task.estimated_hours; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.estimated_hours IS 'Estimated hours to complete task';


--
-- Name: COLUMN task.actual_hours; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.actual_hours IS 'Actual hours logged against task';


--
-- Name: COLUMN task.progress_percent; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.progress_percent IS 'Completion percentage (0-100)';


--
-- Name: COLUMN task.task_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.task_type IS 'Task, Milestone, or SubTask';


--
-- Name: COLUMN task.sort_order; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.sort_order IS 'Sort order within parent or project';


--
-- Name: COLUMN task.board_column_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task.board_column_id IS 'FK to pm.board_column for Kanban boards';


--
-- Name: task_activity; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.task_activity (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    activity_type character varying(50) NOT NULL,
    field_changed character varying(100),
    old_value text,
    new_value text,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    CONSTRAINT task_activity_activity_type_check CHECK (((activity_type)::text = ANY (ARRAY[('Created'::character varying)::text, ('Updated'::character varying)::text, ('Deleted'::character varying)::text, ('Restored'::character varying)::text, ('StatusChanged'::character varying)::text, ('PriorityChanged'::character varying)::text, ('AssigneeAdded'::character varying)::text, ('AssigneeRemoved'::character varying)::text, ('DueDateChanged'::character varying)::text, ('StartDateChanged'::character varying)::text, ('ProgressChanged'::character varying)::text, ('CommentAdded'::character varying)::text, ('CommentEdited'::character varying)::text, ('CommentDeleted'::character varying)::text, ('DependencyAdded'::character varying)::text, ('DependencyRemoved'::character varying)::text, ('SubtaskAdded'::character varying)::text, ('SubtaskRemoved'::character varying)::text, ('AttachmentAdded'::character varying)::text, ('AttachmentRemoved'::character varying)::text, ('Moved'::character varying)::text, ('TimeLogged'::character varying)::text])))
);


--
-- Name: TABLE task_activity; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.task_activity IS 'Activity log for task changes - read-only audit trail';


--
-- Name: COLUMN task_activity.activity_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_activity.activity_type IS 'Type of activity that occurred';


--
-- Name: COLUMN task_activity.field_changed; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_activity.field_changed IS 'Name of field that was changed (for Updates)';


--
-- Name: COLUMN task_activity.old_value; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_activity.old_value IS 'Previous value (for tracking changes)';


--
-- Name: COLUMN task_activity.new_value; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_activity.new_value IS 'New value (for tracking changes)';


--
-- Name: COLUMN task_activity.description; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_activity.description IS 'Human-readable description of the activity';


--
-- Name: task_assignee; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.task_assignee (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    user_id uuid NOT NULL,
    assignee_role character varying(50) DEFAULT 'Primary'::character varying NOT NULL,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT task_assignee_assignee_role_check CHECK (((assignee_role)::text = ANY (ARRAY[('Primary'::character varying)::text, ('Secondary'::character varying)::text, ('Reviewer'::character varying)::text, ('Watcher'::character varying)::text])))
);


--
-- Name: COLUMN task_assignee.assignee_role; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_assignee.assignee_role IS 'Primary=main assignee, Secondary=helper, Reviewer=approval, Watcher=notifications only';


--
-- Name: COLUMN task_assignee.assigned_at; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_assignee.assigned_at IS 'When the user member was assigned to this task';


--
-- Name: task_code_seq; Type: SEQUENCE; Schema: pm; Owner: -
--

CREATE SEQUENCE pm.task_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: task_comment; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.task_comment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    parent_comment_id uuid,
    content text NOT NULL,
    mentions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE task_comment; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.task_comment IS 'Comments and discussions on tasks';


--
-- Name: COLUMN task_comment.parent_comment_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_comment.parent_comment_id IS 'Self-referential FK for threaded replies';


--
-- Name: COLUMN task_comment.content; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_comment.content IS 'Comment text content (may include markdown)';


--
-- Name: COLUMN task_comment.mentions; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_comment.mentions IS 'JSON array of user IDs mentioned with @, e.g., ["uuid1", "uuid2"]';


--
-- Name: task_dependency; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.task_dependency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    predecessor_task_id uuid NOT NULL,
    successor_task_id uuid NOT NULL,
    dependency_type character varying(10) DEFAULT 'FS'::character varying NOT NULL,
    lag_days integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_no_self_dependency CHECK ((predecessor_task_id <> successor_task_id)),
    CONSTRAINT task_dependency_dependency_type_check CHECK (((dependency_type)::text = ANY (ARRAY[('FS'::character varying)::text, ('SS'::character varying)::text, ('FF'::character varying)::text, ('SF'::character varying)::text])))
);


--
-- Name: COLUMN task_dependency.dependency_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_dependency.dependency_type IS 'FS=Finish-to-Start, SS=Start-to-Start, FF=Finish-to-Finish, SF=Start-to-Finish';


--
-- Name: COLUMN task_dependency.lag_days; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.task_dependency.lag_days IS 'Number of days delay between linked tasks (can be negative for lead)';


--
-- Name: time_entry; Type: TABLE; Schema: pm; Owner: -
--

CREATE TABLE pm.time_entry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    user_id uuid NOT NULL,
    entry_date timestamp with time zone NOT NULL,
    hours_worked numeric(5,2) NOT NULL,
    description text,
    billable boolean DEFAULT true NOT NULL,
    work_type character varying(50) DEFAULT 'Development'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT time_entry_hours_worked_check CHECK (((hours_worked > (0)::numeric) AND (hours_worked <= (24)::numeric)))
);


--
-- Name: TABLE time_entry; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON TABLE pm.time_entry IS 'Time entries logged against tasks';


--
-- Name: COLUMN time_entry.task_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.task_id IS 'Reference to the task this time was logged against';


--
-- Name: COLUMN time_entry.user_id; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.user_id IS 'User member who logged the time';


--
-- Name: COLUMN time_entry.entry_date; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.entry_date IS 'Date the work was performed';


--
-- Name: COLUMN time_entry.hours_worked; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.hours_worked IS 'Number of hours worked (max 24)';


--
-- Name: COLUMN time_entry.billable; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.billable IS 'Whether this time is billable to the client';


--
-- Name: COLUMN time_entry.work_type; Type: COMMENT; Schema: pm; Owner: -
--

COMMENT ON COLUMN pm.time_entry.work_type IS 'Type of work performed (Development, Design, Testing, etc.)';


--
-- Name: bin_management; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.bin_management (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    location_id uuid,
    bin_code character varying(225) NOT NULL,
    aisle character varying(255),
    rack character varying(255),
    capacity integer,
    unit_of_measure_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: company; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.company (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_code character varying(50) DEFAULT sc.generate_company_code(),
    vendor_code character varying(50) DEFAULT sc.generate_vendor_code(),
    customer_code character varying(50) DEFAULT sc.generate_customer_code(),
    partner_code character varying(50) DEFAULT sc.generate_partner_code(),
    name character varying(255) NOT NULL,
    contact_name character varying(100),
    phone_number character varying(20),
    alternate_phone character varying(20),
    website text,
    tax_id character varying(50),
    currency_code character(3),
    quality_score integer DEFAULT 0,
    category character varying(100),
    department character varying(100),
    payment_term_id uuid,
    currency_id uuid,
    logo_url text,
    notes text,
    total_orders integer DEFAULT 0,
    total_spent double precision DEFAULT 0,
    avg_order_value double precision DEFAULT 0,
    on_time_delivery_rate double precision DEFAULT 0,
    member_since timestamp with time zone,
    last_activity_date timestamp with time zone,
    email character varying(255),
    is_vendor boolean,
    is_customer boolean,
    is_partner boolean,
    pan_number character varying(10),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT company_pan_check CHECK (((is_vendor = true) OR (pan_number IS NULL)))
);


--
-- Name: company_address; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.company_address (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    address_id uuid NOT NULL,
    address_type character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: company_bank_account; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.company_bank_account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    bank_account_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: company_code_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.company_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: company_contact; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.company_contact (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    contact_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: company_part; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.company_part (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    part_id uuid NOT NULL,
    unit_price numeric(18,4),
    currency_id uuid,
    lead_time_days integer,
    min_order_quantity integer,
    order_multiple integer,
    is_preferred boolean DEFAULT false NOT NULL,
    valid_from date,
    valid_to date,
    vendor_part_number character varying(255),
    manufacturer_part_number character varying(255),
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: customer_code_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.customer_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_receipt_note; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.goods_receipt_note (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    grn_number character varying(255) DEFAULT sc.generate_grn_number() NOT NULL,
    purchase_order_id uuid,
    received_date date NOT NULL,
    received_by_id uuid,
    description text,
    vendor_reference_id uuid,
    location_id uuid NOT NULL,
    reference_number character varying(255),
    invoice_number character varying(255),
    invoice_date date,
    status character varying(255) DEFAULT 'In Process'::character varying NOT NULL,
    vendor_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT goods_receipt_note_status_check CHECK (((status)::text = ANY (ARRAY[('In Process'::character varying)::text, ('Completed'::character varying)::text, ('Partially Completed'::character varying)::text, ('Rejected'::character varying)::text, ('Quality Checked'::character varying)::text, ('Closed'::character varying)::text])))
);


--
-- Name: grn_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.grn_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    grn_id uuid NOT NULL,
    part_id uuid NOT NULL,
    po_line_item_id uuid,
    received_quantity integer,
    tracking_method character varying(50),
    tracking_id character varying(255),
    manufacturing_date date,
    expiry_date date,
    qc_status character varying(50) DEFAULT 'Pending'::character varying,
    qc_date timestamp with time zone,
    checked_by_id uuid,
    remark text,
    disposition character varying(50),
    qc_remark text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT grn_line_item_disposition_check CHECK (((disposition)::text = ANY (ARRAY[('Accepted'::character varying)::text, ('Return'::character varying)::text, ('Scrap'::character varying)::text, ('Rework'::character varying)::text, ('Quarantine'::character varying)::text]))),
    CONSTRAINT grn_line_item_qc_status_check CHECK (((qc_status)::text = ANY (ARRAY[('Pending'::character varying)::text, ('Pass'::character varying)::text, ('Fail'::character varying)::text, ('Accepted'::character varying)::text]))),
    CONSTRAINT grn_line_item_tracking_method_check CHECK (((tracking_method IS NULL) OR ((tracking_method)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text]))))
);


--
-- Name: grn_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.grn_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_part; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.inventory_part (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_id uuid NOT NULL,
    location_id uuid,
    bin_id uuid,
    sku_code character varying(20),
    unit_price numeric(18,4),
    reorder_level integer DEFAULT 0 NOT NULL,
    qty_onhand integer DEFAULT 0 NOT NULL,
    qty_reserved integer DEFAULT 0 NOT NULL,
    qty_available integer GENERATED ALWAYS AS (((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_failed) - qty_qc_pending)) STORED,
    consumed_quantity integer DEFAULT 0 NOT NULL,
    qty_issued integer DEFAULT 0 NOT NULL,
    qty_qc_pending integer DEFAULT 0 NOT NULL,
    qty_scrapped integer DEFAULT 0 NOT NULL,
    qty_qc_failed integer DEFAULT 0 NOT NULL,
    qty_returned integer DEFAULT 0 NOT NULL,
    tracking_type character varying(20),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: inventory_stock; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.inventory_stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_id uuid NOT NULL,
    bin_id uuid,
    location_id uuid,
    tracking_type character varying(20),
    tracking_id character varying(100),
    qty_onhand integer DEFAULT 0 NOT NULL,
    qty_available integer GENERATED ALWAYS AS ((((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_failed) - qty_qc_pending))::numeric(18,4)) STORED NOT NULL,
    qty_reserved integer DEFAULT 0 NOT NULL,
    qty_issued integer DEFAULT 0,
    qty_consumed integer DEFAULT 0 NOT NULL,
    qty_qc_pending integer DEFAULT 0 NOT NULL,
    qty_qc_failed integer DEFAULT 0 NOT NULL,
    qty_scrapped integer DEFAULT 0 NOT NULL,
    qty_returned integer DEFAULT 0 NOT NULL,
    unit_price numeric(18,4),
    currency character varying(255) DEFAULT 'INR'::character varying,
    project_id uuid,
    department character varying(255),
    assigned_user_id uuid,
    conversion_rate numeric(18,4) DEFAULT 1,
    issued_price numeric(18,4) GENERATED ALWAYS AS (((((qty_issued)::numeric * unit_price) * conversion_rate))::numeric(18,4)) STORED,
    reserved_price numeric(18,4) GENERATED ALWAYS AS (((((qty_reserved)::numeric * unit_price) * conversion_rate))::numeric(18,4)) STORED,
    available_price numeric(18,4) GENERATED ALWAYS AS (((((((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_pending) - qty_qc_failed))::numeric * unit_price) * conversion_rate))::numeric(18,4)) STORED,
    total_price numeric(18,4) GENERATED ALWAYS AS (((((((qty_issued)::numeric * unit_price) * conversion_rate) + (((qty_reserved)::numeric * unit_price) * conversion_rate)) + (((((((qty_onhand - qty_reserved) - qty_issued) - qty_qc_pending) - qty_qc_failed))::numeric * unit_price) * conversion_rate)))::numeric(18,4)) STORED,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: inventory_transaction; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.inventory_transaction (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    part_id uuid NOT NULL,
    from_location_id uuid,
    transaction_type character varying(255) NOT NULL,
    current_quantity integer,
    previous_quantity integer,
    transacted_quantity integer NOT NULL,
    reference_type character varying(255),
    reference_id uuid,
    transaction_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    to_location_id uuid,
    tracking_type character varying(50),
    tracking_id character varying(255),
    project_id uuid,
    department character varying(255),
    assigned_user_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT inventory_transaction_tracking_type_check CHECK (((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text]))),
    CONSTRAINT inventory_transaction_transaction_type_check CHECK (((transaction_type)::text = ANY (ARRAY['Received'::text, 'OnOrder'::text, 'Consumed'::text, 'Adjustment'::text, 'Returned'::text, 'Reserved'::text, 'Defective'::text, 'OnHold'::text, 'Transfer'::text, 'QC Failed'::text, 'Issued'::text])))
);


--
-- Name: partner_code_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.partner_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_term; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.payment_term (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(100),
    due_days integer NOT NULL,
    discount_days integer,
    discount_percent numeric(5,2),
    payment_terms text,
    payment_term_type character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT payment_term_discount_days_check CHECK ((discount_days >= 0)),
    CONSTRAINT payment_term_discount_percent_check CHECK (((discount_percent >= (0)::numeric) AND (discount_percent <= (100)::numeric))),
    CONSTRAINT payment_term_due_days_check CHECK ((due_days >= 0))
);


--
-- Name: po_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.po_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_id uuid NOT NULL,
    part_id uuid,
    ordered_quantity integer NOT NULL,
    received_quantity integer,
    pending_quantity integer,
    unit_price numeric(18,4),
    total_price numeric(18,4),
    conversion_rate numeric(18,4) DEFAULT 1,
    currency character varying(255),
    tax numeric(18,4),
    tax_type character varying(50),
    description text,
    hsn character varying(255),
    discount numeric(18,4),
    discount_type character varying(50),
    actual_delivery_date date,
    expected_delivery_date date,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: purchase_order; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.purchase_order (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    number character varying(255) DEFAULT sc.generate_purchase_order_number() NOT NULL,
    company_id uuid NOT NULL,
    project_id uuid,
    po_type character varying(255),
    buyer_id uuid,
    supply_chain_lead_id uuid,
    requisition_id uuid,
    payment_term_id uuid,
    currency_id uuid,
    order_date date NOT NULL,
    actual_delivery_date date,
    expected_delivery_date date,
    discount numeric(18,4),
    discount_type character varying(50),
    tax_option character varying(255),
    total_amount numeric(18,4) NOT NULL,
    quotation_reference_number character varying(255),
    shipment_reference_number character varying(255),
    status character varying(255) DEFAULT 'Draft'::character varying NOT NULL,
    revision_history character varying(255),
    round_off numeric(18,4),
    billing_address_id uuid NOT NULL,
    delivery_address_id uuid,
    shipping_address_id uuid,
    vendor_billing_address_id uuid,
    vendor_billing_contact_id uuid,
    delivery_status character varying(255) NOT NULL,
    quotation_reference_id uuid,
    po_terms text,
    description text,
    customer_instructions text,
    delivery_terms text,
    terms_and_conditions text,
    approved_by character varying(255),
    approved_date timestamp with time zone,
    rejected_by character varying(255),
    rejected_date timestamp with time zone,
    department_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_purchase_order_status CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Issued'::character varying)::text, ('Rejected'::character varying)::text, ('Partially Delivered'::character varying)::text, ('Delivered'::character varying)::text, ('Closed'::character varying)::text, ('Cancelled'::character varying)::text, ('Billed'::character varying)::text, ('Partially Billed'::character varying)::text])))
);


--
-- Name: purchase_order_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.purchase_order_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: req_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.req_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: requisition; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.requisition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    req_number character varying(255) DEFAULT sc.generate_req_number() NOT NULL,
    requested_by_id uuid NOT NULL,
    title character varying(255),
    project_id uuid,
    request_date date NOT NULL,
    required_by_date date,
    justification text,
    priority character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'Draft'::character varying NOT NULL,
    total_estimated_amount numeric(18,4),
    approved_by character varying(255),
    approved_date timestamp with time zone,
    rejected_by character varying(255),
    rejected_date timestamp with time zone,
    approver_comment text,
    department_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT chk_requisition_status CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Processing'::character varying)::text, ('PoCreated'::character varying)::text, ('Closed'::character varying)::text, ('Cancelled'::character varying)::text])))
);


--
-- Name: requisition_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.requisition_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requisition_id uuid NOT NULL,
    part_id uuid NOT NULL,
    quantity integer NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: scrap_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.scrap_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scrap_request_id uuid NOT NULL,
    part_id uuid NOT NULL,
    tracking_type character varying(50),
    tracking_id character varying(255),
    scrap_quantity integer NOT NULL,
    reason text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT scrap_line_item_tracking_type_check CHECK (((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text])))
);


--
-- Name: scrap_number_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.scrap_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scrap_request; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.scrap_request (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scrap_number character varying(255) DEFAULT sc.generate_scrap_number() NOT NULL,
    location_id uuid,
    raised_by_id uuid,
    scrap_date date,
    reason text,
    po_id uuid,
    grn_id uuid,
    wo_id uuid,
    status character varying(50) DEFAULT 'Draft'::character varying NOT NULL,
    approved_by character varying(255),
    approved_date timestamp with time zone,
    rejected_by character varying(255),
    rejected_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT scrap_request_status_check CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Disposed'::character varying)::text])))
);


--
-- Name: stock_movement; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.stock_movement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    movement_number character varying(255) DEFAULT sc.generate_stock_movement_number() NOT NULL,
    movement_type character varying(50) NOT NULL,
    movement_reason character varying(100),
    movement_date date NOT NULL,
    from_location_id uuid,
    from_bin_id uuid,
    to_location_id uuid,
    to_bin_id uuid,
    performed_by_id uuid,
    work_order_id uuid,
    reference_number character varying(255),
    notes text,
    status character varying(50) DEFAULT 'Completed'::character varying NOT NULL,
    expected_return_date date,
    project_date date,
    project_id uuid,
    department character varying(255),
    assigned_user_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE stock_movement; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.stock_movement IS 'Stock movement header for Transfer, Adjustment, and Issue operations';


--
-- Name: COLUMN stock_movement.movement_type; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.stock_movement.movement_type IS 'Transfer, Adjustment, or Issue';


--
-- Name: COLUMN stock_movement.movement_reason; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.stock_movement.movement_reason IS 'Reason code for the movement';


--
-- Name: COLUMN stock_movement.status; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.stock_movement.status IS 'Completed or Cancelled';


--
-- Name: stock_movement_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.stock_movement_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stock_movement_id uuid NOT NULL,
    part_id uuid NOT NULL,
    quantity integer NOT NULL,
    tracking_type character varying(50),
    tracking_id character varying(255),
    reason character varying(255),
    notes text,
    adjustment_type character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT stock_movement_line_item_adjustment_type_check CHECK (((adjustment_type)::text = ANY (ARRAY[('Increase'::character varying)::text, ('Decrease'::character varying)::text]))),
    CONSTRAINT stock_movement_line_item_quantity_check CHECK ((quantity > 0))
);


--
-- Name: tender; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.tender (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tender_number character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'Draft'::character varying NOT NULL,
    requisition_id uuid,
    project_id uuid,
    publish_date date,
    closing_date date NOT NULL,
    approved_by character varying(255),
    approved_date timestamp with time zone,
    awarded_vendor_id uuid,
    awarded_date timestamp with time zone,
    awarded_by character varying(255),
    buyer_id uuid,
    terms text,
    payment_term_id uuid,
    currency_id uuid,
    rejected_by character varying(255),
    rejected_date timestamp with time zone,
    approver_comment text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE tender; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.tender IS 'Tender/RFQ management table for procurement';


--
-- Name: COLUMN tender.status; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.tender.status IS 'Draft, Submitted, Published, Closed, Awarded, Cancelled';


--
-- Name: tender_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.tender_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tender_id uuid NOT NULL,
    part_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_of_measure_id uuid,
    description text,
    specifications text,
    line_number integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE tender_line_item; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.tender_line_item IS 'Line items/parts requested in a tender';


--
-- Name: tender_quotation; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.tender_quotation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tender_id uuid NOT NULL,
    company_id uuid NOT NULL,
    quotation_number character varying(100),
    quotation_date date NOT NULL,
    valid_until date,
    total_amount numeric(18,4) NOT NULL,
    currency_id uuid,
    lead_time_days integer,
    notes text,
    terms_and_conditions text,
    document_id uuid,
    is_selected boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE tender_quotation; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.tender_quotation IS 'Vendor quotation responses to tenders';


--
-- Name: COLUMN tender_quotation.is_selected; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.tender_quotation.is_selected IS 'True if this is the winning quotation';


--
-- Name: tender_quotation_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.tender_quotation_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tender_quotation_id uuid NOT NULL,
    tender_line_item_id uuid NOT NULL,
    unit_price numeric(18,4) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    total_price numeric(18,4) NOT NULL,
    lead_time_days integer,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE tender_quotation_line_item; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.tender_quotation_line_item IS 'Line item pricing in vendor quotations';


--
-- Name: tender_vendor; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.tender_vendor (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tender_id uuid NOT NULL,
    company_id uuid NOT NULL,
    invited_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    response_deadline date,
    status character varying(50) DEFAULT 'Invited'::character varying NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255)
);


--
-- Name: TABLE tender_vendor; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON TABLE sc.tender_vendor IS 'Vendors invited to respond to a tender';


--
-- Name: COLUMN tender_vendor.status; Type: COMMENT; Schema: sc; Owner: -
--

COMMENT ON COLUMN sc.tender_vendor.status IS 'Invited, Responded, NoResponse, Declined';


--
-- Name: vendor_code_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.vendor_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_return_line_item; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.vendor_return_line_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    return_request_id uuid NOT NULL,
    part_id uuid NOT NULL,
    grn_line_item_id uuid,
    tracking_type character varying(50),
    tracking_id character varying(255),
    return_quantity integer,
    reason text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT vendor_return_line_item_tracking_type_check CHECK (((tracking_type)::text = ANY (ARRAY[('None'::character varying)::text, ('Batch'::character varying)::text, ('Serial'::character varying)::text])))
);


--
-- Name: vendor_return_number_seq; Type: SEQUENCE; Schema: sc; Owner: -
--

CREATE SEQUENCE sc.vendor_return_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_return_request; Type: TABLE; Schema: sc; Owner: -
--

CREATE TABLE sc.vendor_return_request (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    return_number character varying(255) DEFAULT sc.generate_vendor_return_number() NOT NULL,
    vendor_id uuid NOT NULL,
    po_id uuid,
    grn_id uuid,
    wo_id uuid,
    return_date date,
    raised_by_id uuid,
    reason text,
    status character varying(50) DEFAULT 'Draft'::character varying NOT NULL,
    location_id uuid,
    approved_by character varying(255),
    approved_date timestamp with time zone,
    rejected_by character varying(255),
    rejected_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp with time zone,
    updated_by character varying(255),
    deleted_at timestamp with time zone,
    deleted_by character varying(255),
    CONSTRAINT vendor_return_request_status_check CHECK (((status)::text = ANY (ARRAY[('Draft'::character varying)::text, ('Submitted'::character varying)::text, ('Approved'::character varying)::text, ('Rejected'::character varying)::text, ('Shipped'::character varying)::text, ('Closed'::character varying)::text])))
);


--
-- Name: app app_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.app
    ADD CONSTRAINT app_pkey PRIMARY KEY (id);


--
-- Name: bulk_upload bulk_upload_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.bulk_upload
    ADD CONSTRAINT bulk_upload_pkey PRIMARY KEY (id);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: feature_bit feature_bit_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.feature_bit
    ADD CONSTRAINT feature_bit_pkey PRIMARY KEY (id);


--
-- Name: issue issue_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.issue
    ADD CONSTRAINT issue_pkey PRIMARY KEY (id);


--
-- Name: option_set option_set_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.option_set
    ADD CONSTRAINT option_set_pkey PRIMARY KEY (id);


--
-- Name: organization_address organization_address_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.organization_address
    ADD CONSTRAINT organization_address_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);


--
-- Name: role_filter role_filter_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role_filter
    ADD CONSTRAINT role_filter_pkey PRIMARY KEY (id);


--
-- Name: role_permission role_permission_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role_permission
    ADD CONSTRAINT role_permission_pkey PRIMARY KEY (id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (id);


--
-- Name: fcm_token PK_fcm_token; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.fcm_token
    ADD CONSTRAINT "PK_fcm_token" PRIMARY KEY (email, device_id);


--
-- Name: additional_recipient_configuration additional_recipient_configuration_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.additional_recipient_configuration
    ADD CONSTRAINT additional_recipient_configuration_pkey PRIMARY KEY (id);


--
-- Name: address address_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (id);


--
-- Name: approval_configuration approval_configuration_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval_configuration
    ADD CONSTRAINT approval_configuration_pkey PRIMARY KEY (id);


--
-- Name: approval_log approval_log_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval_log
    ADD CONSTRAINT approval_log_pkey PRIMARY KEY (id);


--
-- Name: approval_notification_recipient approval_notification_recipient_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval_notification_recipient
    ADD CONSTRAINT approval_notification_recipient_pkey PRIMARY KEY (id);


--
-- Name: approval approval_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval
    ADD CONSTRAINT approval_pkey PRIMARY KEY (id);


--
-- Name: bank_account bank_account_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.bank_account
    ADD CONSTRAINT bank_account_pkey PRIMARY KEY (id);


--
-- Name: contact contact_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.contact
    ADD CONSTRAINT contact_pkey PRIMARY KEY (id);


--
-- Name: country country_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.country
    ADD CONSTRAINT country_pkey PRIMARY KEY (id);


--
-- Name: currency currency_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.currency
    ADD CONSTRAINT currency_pkey PRIMARY KEY (id);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: document document_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.document
    ADD CONSTRAINT document_pkey PRIMARY KEY (id);


--
-- Name: image image_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- Name: video video_pkey; Type: CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.video
    ADD CONSTRAINT video_pkey PRIMARY KEY (id);


--
-- Name: assembly_location assembly_location_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.assembly_location
    ADD CONSTRAINT assembly_location_pkey PRIMARY KEY (id);


--
-- Name: ebom ebom_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.ebom
    ADD CONSTRAINT ebom_pkey PRIMARY KEY (id);


--
-- Name: eco_log eco_log_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_log
    ADD CONSTRAINT eco_log_pkey PRIMARY KEY (id);


--
-- Name: eco_part eco_part_id_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_part
    ADD CONSTRAINT eco_part_id_pkey PRIMARY KEY (id);


--
-- Name: eco eco_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco
    ADD CONSTRAINT eco_pkey PRIMARY KEY (id);


--
-- Name: email_log email_log_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.email_log
    ADD CONSTRAINT email_log_pkey PRIMARY KEY (id);


--
-- Name: email_template email_template_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.email_template
    ADD CONSTRAINT email_template_pkey PRIMARY KEY (id);


--
-- Name: guide_check_out_history guide_check_out_history_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_check_out_history
    ADD CONSTRAINT guide_check_out_history_pkey PRIMARY KEY (id);


--
-- Name: guide_ebom guide_ebom_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_ebom
    ADD CONSTRAINT guide_ebom_pkey PRIMARY KEY (id);


--
-- Name: guide_mbom guide_mbom_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_mbom
    ADD CONSTRAINT guide_mbom_pkey PRIMARY KEY (id);


--
-- Name: guide guide_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_pkey PRIMARY KEY (id);


--
-- Name: guide_step_equipment guide_step_equipment_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_pkey PRIMARY KEY (id);


--
-- Name: guide_step guide_step_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step
    ADD CONSTRAINT guide_step_pkey PRIMARY KEY (id);


--
-- Name: guide_step_task guide_step_task_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_task
    ADD CONSTRAINT guide_step_task_pkey PRIMARY KEY (id);


--
-- Name: guide_type guide_type_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_type
    ADD CONSTRAINT guide_type_pkey PRIMARY KEY (id);


--
-- Name: kit_bom_comment kit_bom_comment_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_bom_comment
    ADD CONSTRAINT kit_bom_comment_pkey PRIMARY KEY (id);


--
-- Name: kit kit_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit
    ADD CONSTRAINT kit_pkey PRIMARY KEY (id);


--
-- Name: kit_serial kit_serial_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_serial
    ADD CONSTRAINT kit_serial_pkey PRIMARY KEY (id);


--
-- Name: location location_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);


--
-- Name: machine machine_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.machine
    ADD CONSTRAINT machine_pkey PRIMARY KEY (id);


--
-- Name: machine_type machine_type_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.machine_type
    ADD CONSTRAINT machine_type_pkey PRIMARY KEY (id);


--
-- Name: material_kit material_kit_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit
    ADD CONSTRAINT material_kit_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: news_type news_type_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.news_type
    ADD CONSTRAINT news_type_pkey PRIMARY KEY (id);


--
-- Name: part_level part_level_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_level
    ADD CONSTRAINT part_level_pkey PRIMARY KEY (id);


--
-- Name: part part_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_pkey PRIMARY KEY (id);


--
-- Name: part_type_category part_type_category_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_type_category
    ADD CONSTRAINT part_type_category_pkey PRIMARY KEY (id);


--
-- Name: part_type part_type_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_type
    ADD CONSTRAINT part_type_pkey PRIMARY KEY (id);


--
-- Name: platform platform_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.platform
    ADD CONSTRAINT platform_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: subsystem subsystem_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.subsystem
    ADD CONSTRAINT subsystem_pkey PRIMARY KEY (id);


--
-- Name: tool tool_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.tool
    ADD CONSTRAINT tool_pkey PRIMARY KEY (id);


--
-- Name: tool_type tool_type_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.tool_type
    ADD CONSTRAINT tool_type_pkey PRIMARY KEY (id);


--
-- Name: unit_of_measure unit_of_measure_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.unit_of_measure
    ADD CONSTRAINT unit_of_measure_pkey PRIMARY KEY (id);


--
-- Name: work_order work_order_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_pkey PRIMARY KEY (id);


--
-- Name: work_order_step work_order_step_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT work_order_step_pkey PRIMARY KEY (id);


--
-- Name: work_order_task work_order_task_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_task
    ADD CONSTRAINT work_order_task_pkey PRIMARY KEY (id);


--
-- Name: work_package work_package_pkey; Type: CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package
    ADD CONSTRAINT work_package_pkey PRIMARY KEY (id);


--
-- Name: board_column board_column_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.board_column
    ADD CONSTRAINT board_column_pkey PRIMARY KEY (id);


--
-- Name: dashboard_widget dashboard_widget_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.dashboard_widget
    ADD CONSTRAINT dashboard_widget_pkey PRIMARY KEY (id);


--
-- Name: milestone milestone_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.milestone
    ADD CONSTRAINT milestone_pkey PRIMARY KEY (id);


--
-- Name: program program_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.program
    ADD CONSTRAINT program_pkey PRIMARY KEY (id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: resource_allocation resource_allocation_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.resource_allocation
    ADD CONSTRAINT resource_allocation_pkey PRIMARY KEY (id);


--
-- Name: task_activity task_activity_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_activity
    ADD CONSTRAINT task_activity_pkey PRIMARY KEY (id);


--
-- Name: task_assignee task_assignee_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_assignee
    ADD CONSTRAINT task_assignee_pkey PRIMARY KEY (id);


--
-- Name: task_comment task_comment_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_comment
    ADD CONSTRAINT task_comment_pkey PRIMARY KEY (id);


--
-- Name: task_dependency task_dependency_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_dependency
    ADD CONSTRAINT task_dependency_pkey PRIMARY KEY (id);


--
-- Name: task task_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);


--
-- Name: time_entry time_entry_pkey; Type: CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.time_entry
    ADD CONSTRAINT time_entry_pkey PRIMARY KEY (id);


--
-- Name: bin_management bin_management_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.bin_management
    ADD CONSTRAINT bin_management_pkey PRIMARY KEY (id);


--
-- Name: company_address company_address_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_address
    ADD CONSTRAINT company_address_pkey PRIMARY KEY (id);


--
-- Name: company_bank_account company_bank_account_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_bank_account
    ADD CONSTRAINT company_bank_account_pkey PRIMARY KEY (id);


--
-- Name: company_contact company_contact_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_contact
    ADD CONSTRAINT company_contact_pkey PRIMARY KEY (id);


--
-- Name: company_part company_part_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_part
    ADD CONSTRAINT company_part_pkey PRIMARY KEY (id);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- Name: goods_receipt_note goods_receipt_note_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_pkey PRIMARY KEY (id);


--
-- Name: grn_line_item grn_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.grn_line_item
    ADD CONSTRAINT grn_line_item_pkey PRIMARY KEY (id);


--
-- Name: inventory_part inventory_part_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_part
    ADD CONSTRAINT inventory_part_pkey PRIMARY KEY (id);


--
-- Name: inventory_stock inventory_stock_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT inventory_stock_pkey PRIMARY KEY (id);


--
-- Name: inventory_transaction inventory_transaction_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT inventory_transaction_pkey PRIMARY KEY (id);


--
-- Name: payment_term payment_term_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.payment_term
    ADD CONSTRAINT payment_term_pkey PRIMARY KEY (id);


--
-- Name: po_line_item po_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.po_line_item
    ADD CONSTRAINT po_line_item_pkey PRIMARY KEY (id);


--
-- Name: purchase_order purchase_order_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_pkey PRIMARY KEY (id);


--
-- Name: requisition_line_item requisition_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition_line_item
    ADD CONSTRAINT requisition_line_item_pkey PRIMARY KEY (id);


--
-- Name: requisition requisition_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition
    ADD CONSTRAINT requisition_pkey PRIMARY KEY (id);


--
-- Name: scrap_line_item scrap_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_line_item
    ADD CONSTRAINT scrap_line_item_pkey PRIMARY KEY (id);


--
-- Name: scrap_request scrap_request_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_pkey PRIMARY KEY (id);


--
-- Name: stock_movement_line_item stock_movement_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement_line_item
    ADD CONSTRAINT stock_movement_line_item_pkey PRIMARY KEY (id);


--
-- Name: stock_movement stock_movement_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT stock_movement_pkey PRIMARY KEY (id);


--
-- Name: tender_line_item tender_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_line_item
    ADD CONSTRAINT tender_line_item_pkey PRIMARY KEY (id);


--
-- Name: tender tender_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_pkey PRIMARY KEY (id);


--
-- Name: tender_quotation_line_item tender_quotation_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation_line_item
    ADD CONSTRAINT tender_quotation_line_item_pkey PRIMARY KEY (id);


--
-- Name: tender_quotation tender_quotation_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation
    ADD CONSTRAINT tender_quotation_pkey PRIMARY KEY (id);


--
-- Name: tender_vendor tender_vendor_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_vendor
    ADD CONSTRAINT tender_vendor_pkey PRIMARY KEY (id);


--
-- Name: vendor_return_line_item vendor_return_line_item_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_line_item
    ADD CONSTRAINT vendor_return_line_item_pkey PRIMARY KEY (id);


--
-- Name: vendor_return_request vendor_return_request_pkey; Type: CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_pkey PRIMARY KEY (id);


--
-- Name: IX_customer_customer_address_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_customer_customer_address_id" ON application.customer USING btree (customer_address_id);


--
-- Name: IX_issue_guide_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_issue_guide_id" ON application.issue USING btree (guide_id);


--
-- Name: IX_issue_product_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_issue_product_id" ON application.issue USING btree (product_id);


--
-- Name: IX_issue_work_order_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_issue_work_order_id" ON application.issue USING btree (work_order_id);


--
-- Name: IX_organization_address_address_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_organization_address_address_id" ON application.organization_address USING btree (address_id);


--
-- Name: IX_organization_address_organization_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_organization_address_organization_id" ON application.organization_address USING btree (organization_id);


--
-- Name: IX_role_app_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_role_app_id" ON application.role USING btree (app_id);


--
-- Name: IX_role_filter_role_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_role_filter_role_id" ON application.role_filter USING btree (role_id);


--
-- Name: IX_staff_manager_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_staff_manager_id" ON application.staff USING btree (manager_id);


--
-- Name: IX_staff_organization_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_staff_organization_id" ON application.staff USING btree (organization_id);


--
-- Name: IX_user_role_role_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_user_role_role_id" ON application.user_role USING btree (role_id);


--
-- Name: IX_user_role_user_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX "IX_user_role_user_id" ON application.user_role USING btree (user_id);


--
-- Name: app_app_name_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX app_app_name_key ON application.app USING btree (app_name);


--
-- Name: app_app_number_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX app_app_number_key ON application.app USING btree (app_number);


--
-- Name: feature_bit_feature_name_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX feature_bit_feature_name_key ON application.feature_bit USING btree (feature_name);


--
-- Name: ix_user_department_id; Type: INDEX; Schema: application; Owner: -
--

CREATE INDEX ix_user_department_id ON application."user" USING btree (department_id) WHERE (deleted_at IS NULL);


--
-- Name: option_set_display_name_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX option_set_display_name_key ON application.option_set USING btree (display_name);


--
-- Name: option_set_name_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX option_set_name_key ON application.option_set USING btree (name);


--
-- Name: permission_name_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX permission_name_key ON application.permission USING btree (name);


--
-- Name: role_permission_role_id_permission_deleted_at_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX role_permission_role_id_permission_deleted_at_key ON application.role_permission USING btree (role_id, permission, deleted_at);


--
-- Name: role_role_name_app_id_deleted_at_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX role_role_name_app_id_deleted_at_key ON application.role USING btree (role_name, app_id, deleted_at);


--
-- Name: staff_email_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX staff_email_key ON application.staff USING btree (email);


--
-- Name: uq_customer_tax_number; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX uq_customer_tax_number ON application.customer USING btree (tax_number);


--
-- Name: user_email_deleted_at_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX user_email_deleted_at_key ON application."user" USING btree (email, deleted_at);


--
-- Name: user_user_number_key; Type: INDEX; Schema: application; Owner: -
--

CREATE UNIQUE INDEX user_user_number_key ON application."user" USING btree (user_number);


--
-- Name: IX_address_country_id; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX "IX_address_country_id" ON common.address USING btree (country_id);


--
-- Name: IX_approval_approver_id; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX "IX_approval_approver_id" ON common.approval USING btree (approver_id);


--
-- Name: IX_bank_account_address_id; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX "IX_bank_account_address_id" ON common.bank_account USING btree (address_id);


--
-- Name: IX_bank_account_currency_id; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX "IX_bank_account_currency_id" ON common.bank_account USING btree (currency_id);


--
-- Name: IX_contact_company_id; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX "IX_contact_company_id" ON common.contact USING btree (company_id);


--
-- Name: IX_department_head_of_department_user_id; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX "IX_department_head_of_department_user_id" ON common.department USING btree (head_of_department_user_id);


--
-- Name: IX_department_parent_department_id; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX "IX_department_parent_department_id" ON common.department USING btree (parent_department_id);


--
-- Name: approval_entity_id_stage_number_approver_id_deleted_at_key; Type: INDEX; Schema: common; Owner: -
--

CREATE UNIQUE INDEX approval_entity_id_stage_number_approver_id_deleted_at_key ON common.approval USING btree (entity_id, stage_number, approver_id, deleted_at);


--
-- Name: country_iso2_code_key; Type: INDEX; Schema: common; Owner: -
--

CREATE UNIQUE INDEX country_iso2_code_key ON common.country USING btree (iso2_code);


--
-- Name: country_iso3_code_key; Type: INDEX; Schema: common; Owner: -
--

CREATE UNIQUE INDEX country_iso3_code_key ON common.country USING btree (iso3_code);


--
-- Name: country_name_key; Type: INDEX; Schema: common; Owner: -
--

CREATE UNIQUE INDEX country_name_key ON common.country USING btree (name);


--
-- Name: country_numeric_code_key; Type: INDEX; Schema: common; Owner: -
--

CREATE UNIQUE INDEX country_numeric_code_key ON common.country USING btree (numeric_code);


--
-- Name: idx_additional_recipient_config_template; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_additional_recipient_config_template ON common.additional_recipient_configuration USING btree (template_code) WHERE (deleted_at IS NULL);


--
-- Name: idx_approval_configuration_entity_type; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_approval_configuration_entity_type ON common.approval_configuration USING btree (entity_type) WHERE (deleted_at IS NULL);


--
-- Name: idx_approval_log_action_at; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_approval_log_action_at ON common.approval_log USING btree (action_at DESC);


--
-- Name: idx_approval_log_entity; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_approval_log_entity ON common.approval_log USING btree (entity_type, entity_id);


--
-- Name: idx_approval_notification_recipient_entity; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_approval_notification_recipient_entity ON common.approval_notification_recipient USING btree (entity_type, entity_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_approval_notification_recipient_user; Type: INDEX; Schema: common; Owner: -
--

CREATE INDEX idx_approval_notification_recipient_user ON common.approval_notification_recipient USING btree (recipient_user_id);


--
-- Name: uq_approval_configuration_entity_type; Type: INDEX; Schema: common; Owner: -
--

CREATE UNIQUE INDEX uq_approval_configuration_entity_type ON common.approval_configuration USING btree (entity_type, deleted_at);


--
-- Name: ux_department_code_active; Type: INDEX; Schema: common; Owner: -
--

CREATE UNIQUE INDEX ux_department_code_active ON common.department USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: IX_ebom_assembly_location_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_ebom_assembly_location_id" ON mes.ebom USING btree (assembly_location_id);


--
-- Name: IX_ebom_child_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_ebom_child_part_id" ON mes.ebom USING btree (child_part_id);


--
-- Name: IX_eco_log_eco_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_eco_log_eco_id" ON mes.eco_log USING btree (eco_id);


--
-- Name: IX_eco_part_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_eco_part_part_id" ON mes.eco_part USING btree (part_id);


--
-- Name: IX_guide_check_out_history_guide_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_check_out_history_guide_id" ON mes.guide_check_out_history USING btree (guide_id);


--
-- Name: IX_guide_clone_from_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_clone_from_id" ON mes.guide USING btree (clone_from_id);


--
-- Name: IX_guide_ebom_child_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_ebom_child_part_id" ON mes.guide_ebom USING btree (child_part_id);


--
-- Name: IX_guide_ebom_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_ebom_part_id" ON mes.guide_ebom USING btree (part_id);


--
-- Name: IX_guide_guide_type_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_guide_type_id" ON mes.guide USING btree (guide_type_id);


--
-- Name: IX_guide_mbom_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_mbom_part_id" ON mes.guide_mbom USING btree (part_id);


--
-- Name: IX_guide_platform_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_platform_id" ON mes.guide USING btree (platform_id);


--
-- Name: IX_guide_step_equipment_guide_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_step_equipment_guide_id" ON mes.guide_step_equipment USING btree (guide_id);


--
-- Name: IX_guide_step_equipment_guide_step_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_step_equipment_guide_step_id" ON mes.guide_step_equipment USING btree (guide_step_id);


--
-- Name: IX_guide_step_equipment_machine_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_step_equipment_machine_id" ON mes.guide_step_equipment USING btree (machine_id);


--
-- Name: IX_guide_step_equipment_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_step_equipment_part_id" ON mes.guide_step_equipment USING btree (part_id);


--
-- Name: IX_guide_step_equipment_tool_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_step_equipment_tool_id" ON mes.guide_step_equipment USING btree (tool_id);


--
-- Name: IX_guide_step_guide_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_step_guide_id" ON mes.guide_step USING btree (guide_id);


--
-- Name: IX_guide_step_task_guide_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_step_task_guide_id" ON mes.guide_step_task USING btree (guide_id);


--
-- Name: IX_guide_step_task_guide_step_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_guide_step_task_guide_step_id" ON mes.guide_step_task USING btree (guide_step_id);


--
-- Name: IX_kit_bom_comment_kit_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_kit_bom_comment_kit_id" ON mes.kit_bom_comment USING btree (kit_id);


--
-- Name: IX_kit_bom_comment_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_kit_bom_comment_part_id" ON mes.kit_bom_comment USING btree (part_id);


--
-- Name: IX_kit_location_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_kit_location_id" ON mes.kit USING btree (location_id);


--
-- Name: IX_kit_material_kit_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_kit_material_kit_id" ON mes.kit USING btree (material_kit_id);


--
-- Name: IX_kit_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_kit_part_id" ON mes.kit USING btree (part_id);


--
-- Name: IX_kit_serial_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_kit_serial_part_id" ON mes.kit_serial USING btree (part_id);


--
-- Name: IX_machine_machine_type_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_machine_machine_type_id" ON mes.machine USING btree (machine_type_id);


--
-- Name: IX_material_kit_location_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_material_kit_location_id" ON mes.material_kit USING btree (location_id);


--
-- Name: IX_material_kit_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_material_kit_part_id" ON mes.material_kit USING btree (part_id);


--
-- Name: IX_news_news_type_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_news_news_type_id" ON mes.news USING btree (news_type_id);


--
-- Name: IX_part_country_of_origin_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_part_country_of_origin_id" ON mes.part USING btree (country_of_origin_id);


--
-- Name: IX_part_eco_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_part_eco_id" ON mes.part USING btree (eco_id);


--
-- Name: IX_part_part_type_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_part_part_type_id" ON mes.part USING btree (part_type_id);


--
-- Name: IX_part_type_part_level_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_part_type_part_level_id" ON mes.part_type USING btree (part_level_id);


--
-- Name: IX_part_type_part_type_category_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_part_type_part_type_category_id" ON mes.part_type USING btree (part_type_category_id);


--
-- Name: IX_part_unit_of_measure_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_part_unit_of_measure_id" ON mes.part USING btree (unit_of_measure_id);


--
-- Name: IX_product_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_product_part_id" ON mes.product USING btree (part_id);


--
-- Name: IX_product_platform_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_product_platform_id" ON mes.product USING btree (platform_id);


--
-- Name: IX_tool_tool_type_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_tool_tool_type_id" ON mes.tool USING btree (tool_type_id);


--
-- Name: IX_work_order_guide_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_order_guide_id" ON mes.work_order USING btree (guide_id);


--
-- Name: IX_work_order_manager_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_order_manager_id" ON mes.work_order USING btree (manager_id);


--
-- Name: IX_work_order_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_order_part_id" ON mes.work_order USING btree (part_id);


--
-- Name: IX_work_order_product_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_order_product_id" ON mes.work_order USING btree (product_id);


--
-- Name: IX_work_order_step_guide_step_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_order_step_guide_step_id" ON mes.work_order_step USING btree (guide_step_id);


--
-- Name: IX_work_order_step_work_order_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_order_step_work_order_id" ON mes.work_order_step USING btree (work_order_id);


--
-- Name: IX_work_order_task_guide_step_task_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_order_task_guide_step_task_id" ON mes.work_order_task USING btree (guide_step_task_id);


--
-- Name: IX_work_order_task_work_order_step_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_order_task_work_order_step_id" ON mes.work_order_task USING btree (work_order_step_id);


--
-- Name: IX_work_order_technician_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_order_technician_id" ON mes.work_order USING btree (technician_id);


--
-- Name: IX_work_order_work_package_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_order_work_package_id" ON mes.work_order USING btree (work_package_id);


--
-- Name: IX_work_package_guide_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_package_guide_id" ON mes.work_package USING btree (guide_id);


--
-- Name: IX_work_package_manager_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_package_manager_id" ON mes.work_package USING btree (manager_id);


--
-- Name: IX_work_package_part_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_package_part_id" ON mes.work_package USING btree (part_id);


--
-- Name: IX_work_package_product_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_package_product_id" ON mes.work_package USING btree (product_id);


--
-- Name: IX_work_package_technician_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX "IX_work_package_technician_id" ON mes.work_package USING btree (technician_id);


--
-- Name: ebom_part_id_child_part_id_deleted_at_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX ebom_part_id_child_part_id_deleted_at_key ON mes.ebom USING btree (part_id, child_part_id, deleted_at);


--
-- Name: eco_part_eco_id_part_id_deleted_at_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX eco_part_eco_id_part_id_deleted_at_key ON mes.eco_part USING btree (eco_id, part_id, deleted_at);


--
-- Name: fki_guide_step_image_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX fki_guide_step_image_id_fkey ON mes.guide_step USING btree (image_id);


--
-- Name: guide_ebom_guide_id_part_id_child_part_id_deleted_at_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX guide_ebom_guide_id_part_id_child_part_id_deleted_at_key ON mes.guide_ebom USING btree (guide_id, part_id, child_part_id, deleted_at);


--
-- Name: guide_mbom_guide_id_part_id_deleted_at_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX guide_mbom_guide_id_part_id_deleted_at_key ON mes.guide_mbom USING btree (guide_id, part_id, deleted_at);


--
-- Name: guide_part_id_number_version_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX guide_part_id_number_version_key ON mes.guide USING btree (part_id, number, version);


--
-- Name: guide_sequence_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX guide_sequence_key ON mes.guide USING btree (sequence);


--
-- Name: guide_step_image_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX guide_step_image_id_fkey ON mes.guide_step USING btree (image_id);


--
-- Name: guide_step_video_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX guide_step_video_id_fkey ON mes.guide_step USING btree (video_id);


--
-- Name: idx_email_log_created; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_email_log_created ON mes.email_log USING btree (created_at);


--
-- Name: idx_email_log_entity; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_email_log_entity ON mes.email_log USING btree (entity_type, entity_id);


--
-- Name: idx_email_log_status; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_email_log_status ON mes.email_log USING btree (status);


--
-- Name: idx_email_template_code; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX idx_email_template_code ON mes.email_template USING btree (template_code);


--
-- Name: idx_part_grade; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_grade ON mes.part USING btree (grade) WHERE (deleted_at IS NULL);


--
-- Name: idx_part_level_active; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_level_active ON mes.part_level USING btree (is_active) WHERE (deleted_at IS NULL);


--
-- Name: idx_part_level_code; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_level_code ON mes.part_level USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: idx_part_level_sort_order; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_level_sort_order ON mes.part_level USING btree (sort_order) WHERE (deleted_at IS NULL);


--
-- Name: idx_part_subsystem_id; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_subsystem_id ON mes.part USING btree (subsystem_id);


--
-- Name: idx_part_suffix_version; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_part_suffix_version ON mes.part USING btree (part_number_suffix, version DESC) WHERE ((item_type IS NULL) AND (deleted_by IS NULL));


--
-- Name: idx_subsystem_active; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_subsystem_active ON mes.subsystem USING btree (is_active) WHERE (deleted_at IS NULL);


--
-- Name: idx_subsystem_code; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX idx_subsystem_code ON mes.subsystem USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: kit_number_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX kit_number_key ON mes.kit USING btree (number);


--
-- Name: kit_serial_kit_id_part_id_serialno_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX kit_serial_kit_id_part_id_serialno_key ON mes.kit_serial USING btree (kit_id, part_id, serialno);


--
-- Name: location_number_name_deleted_at_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX location_number_name_deleted_at_key ON mes.location USING btree (number, name, deleted_at);


--
-- Name: machine_number_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX machine_number_key ON mes.machine USING btree (number);


--
-- Name: material_kit_image_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX material_kit_image_id_fkey ON mes.material_kit USING btree (image_id);


--
-- Name: material_kit_number_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX material_kit_number_key ON mes.material_kit USING btree (number);


--
-- Name: material_kit_sequence_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX material_kit_sequence_key ON mes.material_kit USING btree (sequence);


--
-- Name: news_title_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX news_title_key ON mes.news USING btree (title);


--
-- Name: part_level_code_deleted_at_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX part_level_code_deleted_at_key ON mes.part_level USING btree (code, deleted_at);


--
-- Name: part_manufacturing_part_number_deleted_at_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX part_manufacturing_part_number_deleted_at_key ON mes.part USING btree (manufacturing_part_number, deleted_at);


--
-- Name: part_part_number_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX part_part_number_key ON mes.part USING btree (part_number);


--
-- Name: platform_code_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX platform_code_key ON mes.platform USING btree (code);


--
-- Name: product_image_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX product_image_id_fkey ON mes.product USING btree (image_id);


--
-- Name: product_number_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX product_number_key ON mes.product USING btree (number);


--
-- Name: product_sequence_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX product_sequence_key ON mes.product USING btree (sequence);


--
-- Name: subsystem_code_deleted_at_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX subsystem_code_deleted_at_key ON mes.subsystem USING btree (code, deleted_at);


--
-- Name: tool_number_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX tool_number_key ON mes.tool USING btree (number);


--
-- Name: work_order_kit_id_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX work_order_kit_id_key ON mes.work_order USING btree (kit_id);


--
-- Name: work_order_number_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX work_order_number_key ON mes.work_order USING btree (number);


--
-- Name: work_order_step_image_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX work_order_step_image_id_fkey ON mes.work_order_step USING btree (image_id);


--
-- Name: work_order_step_manager_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX work_order_step_manager_id_fkey ON mes.work_order_step USING btree (manager_id);


--
-- Name: work_order_step_technician_id_fkey; Type: INDEX; Schema: mes; Owner: -
--

CREATE INDEX work_order_step_technician_id_fkey ON mes.work_order_step USING btree (technician_id);


--
-- Name: work_order_task_work_order_id_guide_step_task_id_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX work_order_task_work_order_id_guide_step_task_id_key ON mes.work_order_task USING btree (work_order_id, guide_step_task_id);


--
-- Name: work_package_number_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX work_package_number_key ON mes.work_package USING btree (number);


--
-- Name: work_package_sequence_key; Type: INDEX; Schema: mes; Owner: -
--

CREATE UNIQUE INDEX work_package_sequence_key ON mes.work_package USING btree (sequence);


--
-- Name: IX_milestone_project_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_milestone_project_id" ON pm.milestone USING btree (project_id);


--
-- Name: IX_program_buyer_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_program_buyer_id" ON pm.program USING btree (buyer_id);


--
-- Name: IX_program_customer_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_program_customer_id" ON pm.program USING btree (customer_id);


--
-- Name: IX_program_program_manager_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_program_program_manager_id" ON pm.program USING btree (program_manager_id);


--
-- Name: IX_program_supply_chain_manager_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_program_supply_chain_manager_id" ON pm.program USING btree (supply_chain_manager_id);


--
-- Name: IX_project_program_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_project_program_id" ON pm.project USING btree (program_id);


--
-- Name: IX_project_project_manager_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_project_project_manager_id" ON pm.project USING btree (project_manager_id);


--
-- Name: IX_resource_allocation_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_resource_allocation_task_id" ON pm.resource_allocation USING btree (task_id);


--
-- Name: IX_task_assigned_to_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_task_assigned_to_id" ON pm.task USING btree (assigned_to_id);


--
-- Name: IX_task_board_column_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_task_board_column_id" ON pm.task USING btree (board_column_id);


--
-- Name: IX_task_milestone_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_task_milestone_id" ON pm.task USING btree (milestone_id);


--
-- Name: IX_task_parent_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_task_parent_task_id" ON pm.task USING btree (parent_task_id);


--
-- Name: IX_task_project_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX "IX_task_project_id" ON pm.task USING btree (project_id);


--
-- Name: idx_board_column_position; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_board_column_position ON pm.board_column USING btree (project_id, "position") WHERE (deleted_at IS NULL);


--
-- Name: idx_board_column_project_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_board_column_project_id ON pm.board_column USING btree (project_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_dashboard_widget_project_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_dashboard_widget_project_id ON pm.dashboard_widget USING btree (project_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_dashboard_widget_user_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_dashboard_widget_user_id ON pm.dashboard_widget USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_resource_allocation_dates; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_resource_allocation_dates ON pm.resource_allocation USING btree (start_date, end_date) WHERE (deleted_at IS NULL);


--
-- Name: idx_resource_allocation_project_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_resource_allocation_project_id ON pm.resource_allocation USING btree (project_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_resource_allocation_user_dates; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_resource_allocation_user_dates ON pm.resource_allocation USING btree (user_id, start_date, end_date) WHERE (deleted_at IS NULL);


--
-- Name: idx_resource_allocation_user_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_resource_allocation_user_id ON pm.resource_allocation USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_activity_created_by; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_activity_created_by ON pm.task_activity USING btree (created_by, created_at DESC);


--
-- Name: idx_task_activity_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_activity_task_id ON pm.task_activity USING btree (task_id, created_at DESC);


--
-- Name: idx_task_activity_type; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_activity_type ON pm.task_activity USING btree (task_id, activity_type);


--
-- Name: idx_task_assignee_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_assignee_task_id ON pm.task_assignee USING btree (task_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_assignee_user_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_assignee_user_id ON pm.task_assignee USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_comment_created_at; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_comment_created_at ON pm.task_comment USING btree (task_id, created_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_comment_mentions; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_comment_mentions ON pm.task_comment USING gin (mentions) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_comment_parent_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_comment_parent_id ON pm.task_comment USING btree (parent_comment_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_comment_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_comment_task_id ON pm.task_comment USING btree (task_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_dependency_predecessor; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_dependency_predecessor ON pm.task_dependency USING btree (predecessor_task_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_task_dependency_successor; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_task_dependency_successor ON pm.task_dependency USING btree (successor_task_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_time_entry_date_range; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_time_entry_date_range ON pm.time_entry USING btree (user_id, entry_date) WHERE (deleted_at IS NULL);


--
-- Name: idx_time_entry_entry_date; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_time_entry_entry_date ON pm.time_entry USING btree (entry_date) WHERE (deleted_at IS NULL);


--
-- Name: idx_time_entry_task_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_time_entry_task_id ON pm.time_entry USING btree (task_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_time_entry_task_user; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_time_entry_task_user ON pm.time_entry USING btree (task_id, user_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_time_entry_user_id; Type: INDEX; Schema: pm; Owner: -
--

CREATE INDEX idx_time_entry_user_id ON pm.time_entry USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: uq_task_assignee; Type: INDEX; Schema: pm; Owner: -
--

CREATE UNIQUE INDEX uq_task_assignee ON pm.task_assignee USING btree (task_id, user_id);


--
-- Name: uq_task_dependency; Type: INDEX; Schema: pm; Owner: -
--

CREATE UNIQUE INDEX uq_task_dependency ON pm.task_dependency USING btree (predecessor_task_id, successor_task_id);


--
-- Name: IX_bin_management_location_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_bin_management_location_id" ON sc.bin_management USING btree (location_id);


--
-- Name: IX_bin_management_unit_of_measure_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_bin_management_unit_of_measure_id" ON sc.bin_management USING btree (unit_of_measure_id);


--
-- Name: IX_company_address_address_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_address_address_id" ON sc.company_address USING btree (address_id);


--
-- Name: IX_company_address_company_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_address_company_id" ON sc.company_address USING btree (company_id);


--
-- Name: IX_company_bank_account_bank_account_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_bank_account_bank_account_id" ON sc.company_bank_account USING btree (bank_account_id);


--
-- Name: IX_company_bank_account_company_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_bank_account_company_id" ON sc.company_bank_account USING btree (company_id);


--
-- Name: IX_company_contact_company_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_contact_company_id" ON sc.company_contact USING btree (company_id);


--
-- Name: IX_company_contact_contact_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_contact_contact_id" ON sc.company_contact USING btree (contact_id);


--
-- Name: IX_company_currency_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_currency_id" ON sc.company USING btree (currency_id);


--
-- Name: IX_company_part_company_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_part_company_id" ON sc.company_part USING btree (company_id);


--
-- Name: IX_company_part_currency_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_part_currency_id" ON sc.company_part USING btree (currency_id);


--
-- Name: IX_company_part_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_part_part_id" ON sc.company_part USING btree (part_id);


--
-- Name: IX_company_payment_term_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_company_payment_term_id" ON sc.company USING btree (payment_term_id);


--
-- Name: IX_goods_receipt_note_location_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_goods_receipt_note_location_id" ON sc.goods_receipt_note USING btree (location_id);


--
-- Name: IX_goods_receipt_note_purchase_order_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_goods_receipt_note_purchase_order_id" ON sc.goods_receipt_note USING btree (purchase_order_id);


--
-- Name: IX_goods_receipt_note_received_by_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_goods_receipt_note_received_by_id" ON sc.goods_receipt_note USING btree (received_by_id);


--
-- Name: IX_goods_receipt_note_vendor_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_goods_receipt_note_vendor_id" ON sc.goods_receipt_note USING btree (vendor_id);


--
-- Name: IX_goods_receipt_note_vendor_reference_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_goods_receipt_note_vendor_reference_id" ON sc.goods_receipt_note USING btree (vendor_reference_id);


--
-- Name: IX_grn_line_item_checked_by_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_grn_line_item_checked_by_id" ON sc.grn_line_item USING btree (checked_by_id);


--
-- Name: IX_grn_line_item_grn_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_grn_line_item_grn_id" ON sc.grn_line_item USING btree (grn_id);


--
-- Name: IX_grn_line_item_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_grn_line_item_part_id" ON sc.grn_line_item USING btree (part_id);


--
-- Name: IX_grn_line_item_po_line_item_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_grn_line_item_po_line_item_id" ON sc.grn_line_item USING btree (po_line_item_id);


--
-- Name: IX_inventory_part_bin_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_part_bin_id" ON sc.inventory_part USING btree (bin_id);


--
-- Name: IX_inventory_part_location_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_part_location_id" ON sc.inventory_part USING btree (location_id);


--
-- Name: IX_inventory_part_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_part_part_id" ON sc.inventory_part USING btree (part_id);


--
-- Name: IX_inventory_stock_assigned_user_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_stock_assigned_user_id" ON sc.inventory_stock USING btree (assigned_user_id);


--
-- Name: IX_inventory_stock_bin_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_stock_bin_id" ON sc.inventory_stock USING btree (bin_id);


--
-- Name: IX_inventory_stock_location_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_stock_location_id" ON sc.inventory_stock USING btree (location_id);


--
-- Name: IX_inventory_stock_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_stock_part_id" ON sc.inventory_stock USING btree (part_id);


--
-- Name: IX_inventory_stock_project_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_stock_project_id" ON sc.inventory_stock USING btree (project_id);


--
-- Name: IX_inventory_transaction_assigned_user_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_transaction_assigned_user_id" ON sc.inventory_transaction USING btree (assigned_user_id);


--
-- Name: IX_inventory_transaction_from_location_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_transaction_from_location_id" ON sc.inventory_transaction USING btree (from_location_id);


--
-- Name: IX_inventory_transaction_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_transaction_part_id" ON sc.inventory_transaction USING btree (part_id);


--
-- Name: IX_inventory_transaction_project_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_transaction_project_id" ON sc.inventory_transaction USING btree (project_id);


--
-- Name: IX_inventory_transaction_to_location_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_inventory_transaction_to_location_id" ON sc.inventory_transaction USING btree (to_location_id);


--
-- Name: IX_po_line_item_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_po_line_item_part_id" ON sc.po_line_item USING btree (part_id);


--
-- Name: IX_po_line_item_purchase_order_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_po_line_item_purchase_order_id" ON sc.po_line_item USING btree (purchase_order_id);


--
-- Name: IX_purchase_order_billing_address_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_billing_address_id" ON sc.purchase_order USING btree (billing_address_id);


--
-- Name: IX_purchase_order_buyer_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_buyer_id" ON sc.purchase_order USING btree (buyer_id);


--
-- Name: IX_purchase_order_company_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_company_id" ON sc.purchase_order USING btree (company_id);


--
-- Name: IX_purchase_order_currency_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_currency_id" ON sc.purchase_order USING btree (currency_id);


--
-- Name: IX_purchase_order_delivery_address_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_delivery_address_id" ON sc.purchase_order USING btree (delivery_address_id);


--
-- Name: IX_purchase_order_payment_term_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_payment_term_id" ON sc.purchase_order USING btree (payment_term_id);


--
-- Name: IX_purchase_order_project_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_project_id" ON sc.purchase_order USING btree (project_id);


--
-- Name: IX_purchase_order_quotation_reference_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_quotation_reference_id" ON sc.purchase_order USING btree (quotation_reference_id);


--
-- Name: IX_purchase_order_requisition_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_requisition_id" ON sc.purchase_order USING btree (requisition_id);


--
-- Name: IX_purchase_order_shipping_address_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_shipping_address_id" ON sc.purchase_order USING btree (shipping_address_id);


--
-- Name: IX_purchase_order_supply_chain_lead_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_supply_chain_lead_id" ON sc.purchase_order USING btree (supply_chain_lead_id);


--
-- Name: IX_purchase_order_vendor_billing_address_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_vendor_billing_address_id" ON sc.purchase_order USING btree (vendor_billing_address_id);


--
-- Name: IX_purchase_order_vendor_billing_contact_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_purchase_order_vendor_billing_contact_id" ON sc.purchase_order USING btree (vendor_billing_contact_id);


--
-- Name: IX_requisition_line_item_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_requisition_line_item_part_id" ON sc.requisition_line_item USING btree (part_id);


--
-- Name: IX_requisition_line_item_requisition_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_requisition_line_item_requisition_id" ON sc.requisition_line_item USING btree (requisition_id);


--
-- Name: IX_requisition_project_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_requisition_project_id" ON sc.requisition USING btree (project_id);


--
-- Name: IX_requisition_requested_by_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_requisition_requested_by_id" ON sc.requisition USING btree (requested_by_id);


--
-- Name: IX_scrap_line_item_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_scrap_line_item_part_id" ON sc.scrap_line_item USING btree (part_id);


--
-- Name: IX_scrap_line_item_scrap_request_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_scrap_line_item_scrap_request_id" ON sc.scrap_line_item USING btree (scrap_request_id);


--
-- Name: IX_scrap_request_grn_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_scrap_request_grn_id" ON sc.scrap_request USING btree (grn_id);


--
-- Name: IX_scrap_request_location_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_scrap_request_location_id" ON sc.scrap_request USING btree (location_id);


--
-- Name: IX_scrap_request_po_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_scrap_request_po_id" ON sc.scrap_request USING btree (po_id);


--
-- Name: IX_scrap_request_raised_by_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_scrap_request_raised_by_id" ON sc.scrap_request USING btree (raised_by_id);


--
-- Name: IX_scrap_request_wo_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_scrap_request_wo_id" ON sc.scrap_request USING btree (wo_id);


--
-- Name: IX_stock_movement_assigned_user_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_stock_movement_assigned_user_id" ON sc.stock_movement USING btree (assigned_user_id);


--
-- Name: IX_stock_movement_from_bin_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_stock_movement_from_bin_id" ON sc.stock_movement USING btree (from_bin_id);


--
-- Name: IX_stock_movement_performed_by_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_stock_movement_performed_by_id" ON sc.stock_movement USING btree (performed_by_id);


--
-- Name: IX_stock_movement_project_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_stock_movement_project_id" ON sc.stock_movement USING btree (project_id);


--
-- Name: IX_stock_movement_to_bin_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_stock_movement_to_bin_id" ON sc.stock_movement USING btree (to_bin_id);


--
-- Name: IX_stock_movement_work_order_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_stock_movement_work_order_id" ON sc.stock_movement USING btree (work_order_id);


--
-- Name: IX_tender_awarded_vendor_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_tender_awarded_vendor_id" ON sc.tender USING btree (awarded_vendor_id);


--
-- Name: IX_tender_currency_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_tender_currency_id" ON sc.tender USING btree (currency_id);


--
-- Name: IX_tender_line_item_unit_of_measure_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_tender_line_item_unit_of_measure_id" ON sc.tender_line_item USING btree (unit_of_measure_id);


--
-- Name: IX_tender_payment_term_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_tender_payment_term_id" ON sc.tender USING btree (payment_term_id);


--
-- Name: IX_tender_quotation_company_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_tender_quotation_company_id" ON sc.tender_quotation USING btree (company_id);


--
-- Name: IX_tender_quotation_currency_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_tender_quotation_currency_id" ON sc.tender_quotation USING btree (currency_id);


--
-- Name: IX_tender_quotation_document_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_tender_quotation_document_id" ON sc.tender_quotation USING btree (document_id);


--
-- Name: IX_tender_quotation_line_item_tender_line_item_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_tender_quotation_line_item_tender_line_item_id" ON sc.tender_quotation_line_item USING btree (tender_line_item_id);


--
-- Name: IX_tender_quotation_line_item_tender_quotation_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_tender_quotation_line_item_tender_quotation_id" ON sc.tender_quotation_line_item USING btree (tender_quotation_id);


--
-- Name: IX_tender_quotation_tender_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_tender_quotation_tender_id" ON sc.tender_quotation USING btree (tender_id);


--
-- Name: IX_vendor_return_line_item_grn_line_item_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_vendor_return_line_item_grn_line_item_id" ON sc.vendor_return_line_item USING btree (grn_line_item_id);


--
-- Name: IX_vendor_return_line_item_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_vendor_return_line_item_part_id" ON sc.vendor_return_line_item USING btree (part_id);


--
-- Name: IX_vendor_return_line_item_return_request_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_vendor_return_line_item_return_request_id" ON sc.vendor_return_line_item USING btree (return_request_id);


--
-- Name: IX_vendor_return_request_grn_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_vendor_return_request_grn_id" ON sc.vendor_return_request USING btree (grn_id);


--
-- Name: IX_vendor_return_request_location_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_vendor_return_request_location_id" ON sc.vendor_return_request USING btree (location_id);


--
-- Name: IX_vendor_return_request_po_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_vendor_return_request_po_id" ON sc.vendor_return_request USING btree (po_id);


--
-- Name: IX_vendor_return_request_raised_by_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_vendor_return_request_raised_by_id" ON sc.vendor_return_request USING btree (raised_by_id);


--
-- Name: IX_vendor_return_request_vendor_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_vendor_return_request_vendor_id" ON sc.vendor_return_request USING btree (vendor_id);


--
-- Name: IX_vendor_return_request_wo_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX "IX_vendor_return_request_wo_id" ON sc.vendor_return_request USING btree (wo_id);


--
-- Name: idx_company_part_is_preferred; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_company_part_is_preferred ON sc.company_part USING btree (is_preferred) WHERE (is_preferred = true);


--
-- Name: idx_stock_movement_date; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_date ON sc.stock_movement USING btree (movement_date) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_from_location; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_from_location ON sc.stock_movement USING btree (from_location_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_line_item_movement; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_line_item_movement ON sc.stock_movement_line_item USING btree (stock_movement_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_line_item_part; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_line_item_part ON sc.stock_movement_line_item USING btree (part_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_status; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_status ON sc.stock_movement USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_to_location; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_to_location ON sc.stock_movement USING btree (to_location_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_stock_movement_type; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_stock_movement_type ON sc.stock_movement USING btree (movement_type) WHERE (deleted_at IS NULL);


--
-- Name: idx_tender_buyer_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_buyer_id ON sc.tender USING btree (buyer_id);


--
-- Name: idx_tender_closing_date; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_closing_date ON sc.tender USING btree (closing_date);


--
-- Name: idx_tender_deleted_by; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_deleted_by ON sc.tender USING btree (deleted_by) WHERE (deleted_by IS NULL);


--
-- Name: idx_tender_line_item_deleted_by; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_line_item_deleted_by ON sc.tender_line_item USING btree (deleted_by) WHERE (deleted_by IS NULL);


--
-- Name: idx_tender_line_item_part_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_line_item_part_id ON sc.tender_line_item USING btree (part_id);


--
-- Name: idx_tender_line_item_tender_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_line_item_tender_id ON sc.tender_line_item USING btree (tender_id);


--
-- Name: idx_tender_project_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_project_id ON sc.tender USING btree (project_id);


--
-- Name: idx_tender_requisition_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_requisition_id ON sc.tender USING btree (requisition_id);


--
-- Name: idx_tender_status; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_status ON sc.tender USING btree (status);


--
-- Name: idx_tender_vendor_company_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_vendor_company_id ON sc.tender_vendor USING btree (company_id);


--
-- Name: idx_tender_vendor_deleted_by; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_vendor_deleted_by ON sc.tender_vendor USING btree (deleted_by) WHERE (deleted_by IS NULL);


--
-- Name: idx_tender_vendor_status; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_vendor_status ON sc.tender_vendor USING btree (status);


--
-- Name: idx_tender_vendor_tender_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX idx_tender_vendor_tender_id ON sc.tender_vendor USING btree (tender_id);


--
-- Name: idx_tender_vendor_unique; Type: INDEX; Schema: sc; Owner: -
--

CREATE UNIQUE INDEX idx_tender_vendor_unique ON sc.tender_vendor USING btree (tender_id, company_id) WHERE (deleted_by IS NULL);


--
-- Name: ix_purchase_order_department_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX ix_purchase_order_department_id ON sc.purchase_order USING btree (department_id) WHERE (deleted_at IS NULL);


--
-- Name: ix_requisition_department_id; Type: INDEX; Schema: sc; Owner: -
--

CREATE INDEX ix_requisition_department_id ON sc.requisition USING btree (department_id) WHERE (deleted_at IS NULL);


--
-- Name: stock_movement_movement_number_key; Type: INDEX; Schema: sc; Owner: -
--

CREATE UNIQUE INDEX stock_movement_movement_number_key ON sc.stock_movement USING btree (movement_number);


--
-- Name: tender_number_key; Type: INDEX; Schema: sc; Owner: -
--

CREATE UNIQUE INDEX tender_number_key ON sc.tender USING btree (tender_number);


--
-- Name: uq_tender_vendor; Type: INDEX; Schema: sc; Owner: -
--

CREATE UNIQUE INDEX uq_tender_vendor ON sc.tender_vendor USING btree (tender_id, company_id);


--
-- Name: customer fk_customer_address; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.customer
    ADD CONSTRAINT fk_customer_address FOREIGN KEY (customer_address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: user fk_user_department; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application."user"
    ADD CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;


--
-- Name: issue issue_guide_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.issue
    ADD CONSTRAINT issue_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL;


--
-- Name: issue issue_product_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.issue
    ADD CONSTRAINT issue_product_id_fkey FOREIGN KEY (product_id) REFERENCES mes.product(id) ON DELETE SET NULL;


--
-- Name: issue issue_work_order_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.issue
    ADD CONSTRAINT issue_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE SET NULL;


--
-- Name: organization_address organization_address_address_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.organization_address
    ADD CONSTRAINT organization_address_address_id_fkey FOREIGN KEY (address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: organization_address organization_address_organization_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.organization_address
    ADD CONSTRAINT organization_address_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES application.organization(id) ON DELETE SET NULL;


--
-- Name: role role_app_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role
    ADD CONSTRAINT role_app_id_fkey FOREIGN KEY (app_id) REFERENCES application.app(id) ON DELETE SET NULL;


--
-- Name: role_filter role_filter_role_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role_filter
    ADD CONSTRAINT role_filter_role_id_fkey FOREIGN KEY (role_id) REFERENCES application.role(id);


--
-- Name: role_permission role_permission_role_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.role_permission
    ADD CONSTRAINT role_permission_role_id_fkey FOREIGN KEY (role_id) REFERENCES application.role(id);


--
-- Name: staff user_manager_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.staff
    ADD CONSTRAINT user_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: staff user_organization_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.staff
    ADD CONSTRAINT user_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES application.organization(id) ON DELETE SET NULL;


--
-- Name: user_role user_role_role_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.user_role
    ADD CONSTRAINT user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES application.role(id) ON DELETE CASCADE;


--
-- Name: user_role user_role_user_id_fkey; Type: FK CONSTRAINT; Schema: application; Owner: -
--

ALTER TABLE ONLY application.user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES application."user"(id) ON DELETE CASCADE;


--
-- Name: address FK_address_country_country_id; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.address
    ADD CONSTRAINT "FK_address_country_country_id" FOREIGN KEY (country_id) REFERENCES common.country(id) ON DELETE CASCADE;


--
-- Name: approval FK_approval_user_approver_id; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval
    ADD CONSTRAINT "FK_approval_user_approver_id" FOREIGN KEY (approver_id) REFERENCES application."user"(id) ON DELETE CASCADE;


--
-- Name: bank_account bank_account_address_id_fkey; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.bank_account
    ADD CONSTRAINT bank_account_address_id_fkey FOREIGN KEY (address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: bank_account bank_account_currency_id_fkey; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.bank_account
    ADD CONSTRAINT bank_account_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: contact contact_company_id_fkey; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.contact
    ADD CONSTRAINT contact_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: approval_notification_recipient fk_approval_notification_recipient_user; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.approval_notification_recipient
    ADD CONSTRAINT fk_approval_notification_recipient_user FOREIGN KEY (recipient_user_id) REFERENCES application."user"(id) ON DELETE CASCADE;


--
-- Name: department fk_department_head; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.department
    ADD CONSTRAINT fk_department_head FOREIGN KEY (head_of_department_user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: department fk_department_parent; Type: FK CONSTRAINT; Schema: common; Owner: -
--

ALTER TABLE ONLY common.department
    ADD CONSTRAINT fk_department_parent FOREIGN KEY (parent_department_id) REFERENCES common.department(id) ON DELETE SET NULL;


--
-- Name: part FK_part_country_country_of_origin_id; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT "FK_part_country_country_of_origin_id" FOREIGN KEY (country_of_origin_id) REFERENCES common.country(id);


--
-- Name: work_order_step FK_work_order_step_user_manager_id; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT "FK_work_order_step_user_manager_id" FOREIGN KEY (manager_id) REFERENCES application."user"(id);


--
-- Name: work_order_step FK_work_order_step_user_technician_id; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT "FK_work_order_step_user_technician_id" FOREIGN KEY (technician_id) REFERENCES application."user"(id);


--
-- Name: ebom ebom_assembly_location_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.ebom
    ADD CONSTRAINT ebom_assembly_location_id_fkey FOREIGN KEY (assembly_location_id) REFERENCES mes.assembly_location(id) ON DELETE SET NULL;


--
-- Name: ebom ebom_child_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.ebom
    ADD CONSTRAINT ebom_child_part_id_fkey FOREIGN KEY (child_part_id) REFERENCES mes.part(id);


--
-- Name: ebom ebom_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.ebom
    ADD CONSTRAINT ebom_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id);


--
-- Name: eco_log eco_log_eco_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_log
    ADD CONSTRAINT eco_log_eco_id_fkey FOREIGN KEY (eco_id) REFERENCES mes.eco(id);


--
-- Name: eco_part eco_part_eco_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_part
    ADD CONSTRAINT eco_part_eco_id_fkey FOREIGN KEY (eco_id) REFERENCES mes.eco(id);


--
-- Name: eco_part eco_part_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.eco_part
    ADD CONSTRAINT eco_part_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id);


--
-- Name: guide_check_out_history guide_check_out_history_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_check_out_history
    ADD CONSTRAINT guide_check_out_history_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE;


--
-- Name: guide guide_clone_from_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_clone_from_id_fkey FOREIGN KEY (clone_from_id) REFERENCES mes.guide(id) ON DELETE SET NULL;


--
-- Name: guide_ebom guide_ebom_child_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_ebom
    ADD CONSTRAINT guide_ebom_child_part_id_fkey FOREIGN KEY (child_part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: guide_ebom guide_ebom_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_ebom
    ADD CONSTRAINT guide_ebom_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL;


--
-- Name: guide_ebom guide_ebom_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_ebom
    ADD CONSTRAINT guide_ebom_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: guide guide_guide_type_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_guide_type_id_fkey FOREIGN KEY (guide_type_id) REFERENCES mes.guide_type(id) ON DELETE SET NULL;


--
-- Name: guide_mbom guide_mbom_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_mbom
    ADD CONSTRAINT guide_mbom_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id);


--
-- Name: guide_mbom guide_mbom_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_mbom
    ADD CONSTRAINT guide_mbom_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id);


--
-- Name: guide guide_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: guide guide_platform_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide
    ADD CONSTRAINT guide_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES mes.platform(id) ON DELETE SET NULL;


--
-- Name: guide_step_equipment guide_step_equipment_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE;


--
-- Name: guide_step_equipment guide_step_equipment_guide_step_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_guide_step_id_fkey FOREIGN KEY (guide_step_id) REFERENCES mes.guide_step(id) ON DELETE CASCADE;


--
-- Name: guide_step_equipment guide_step_equipment_machine_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_machine_id_fkey FOREIGN KEY (machine_id) REFERENCES mes.machine(id) ON DELETE SET NULL;


--
-- Name: guide_step_equipment guide_step_equipment_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: guide_step_equipment guide_step_equipment_tool_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_equipment
    ADD CONSTRAINT guide_step_equipment_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES mes.tool(id) ON DELETE SET NULL;


--
-- Name: guide_step guide_step_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step
    ADD CONSTRAINT guide_step_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE;


--
-- Name: guide_step guide_step_image_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step
    ADD CONSTRAINT guide_step_image_id_fkey FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL;


--
-- Name: guide_step_task guide_step_task_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_task
    ADD CONSTRAINT guide_step_task_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE CASCADE;


--
-- Name: guide_step_task guide_step_task_guide_step_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step_task
    ADD CONSTRAINT guide_step_task_guide_step_id_fkey FOREIGN KEY (guide_step_id) REFERENCES mes.guide_step(id) ON DELETE CASCADE;


--
-- Name: guide_step guide_step_video_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.guide_step
    ADD CONSTRAINT guide_step_video_id_fkey FOREIGN KEY (video_id) REFERENCES common.video(id) ON DELETE SET NULL;


--
-- Name: kit_bom_comment kit_bom_comment_kit_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_bom_comment
    ADD CONSTRAINT kit_bom_comment_kit_id_fkey FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL;


--
-- Name: kit_bom_comment kit_bom_comment_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_bom_comment
    ADD CONSTRAINT kit_bom_comment_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: kit kit_location_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit
    ADD CONSTRAINT kit_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: kit kit_material_kit_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit
    ADD CONSTRAINT kit_material_kit_id_fkey FOREIGN KEY (material_kit_id) REFERENCES mes.material_kit(id) ON DELETE SET NULL;


--
-- Name: kit kit_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit
    ADD CONSTRAINT kit_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: kit_serial kit_serial_kit_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_serial
    ADD CONSTRAINT kit_serial_kit_id_fkey FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL;


--
-- Name: kit_serial kit_serial_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.kit_serial
    ADD CONSTRAINT kit_serial_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: machine machine_machine_type_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.machine
    ADD CONSTRAINT machine_machine_type_id_fkey FOREIGN KEY (machine_type_id) REFERENCES mes.machine_type(id) ON DELETE SET NULL;


--
-- Name: material_kit material_kit_image_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit
    ADD CONSTRAINT material_kit_image_id_fkey FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL;


--
-- Name: material_kit material_kit_location_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit
    ADD CONSTRAINT material_kit_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: material_kit material_kit_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.material_kit
    ADD CONSTRAINT material_kit_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: news news_news_type_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.news
    ADD CONSTRAINT news_news_type_id_fkey FOREIGN KEY (news_type_id) REFERENCES mes.news_type(id) ON DELETE SET NULL;


--
-- Name: part part_eco_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_eco_id_fkey FOREIGN KEY (eco_id) REFERENCES mes.eco(id) ON DELETE SET NULL;


--
-- Name: part part_part_type_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_part_type_id_fkey FOREIGN KEY (part_type_id) REFERENCES mes.part_type(id) ON DELETE SET NULL;


--
-- Name: part part_subsystem_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_subsystem_id_fkey FOREIGN KEY (subsystem_id) REFERENCES mes.subsystem(id) ON DELETE SET NULL;


--
-- Name: part_type part_type_part_level_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_type
    ADD CONSTRAINT part_type_part_level_id_fkey FOREIGN KEY (part_level_id) REFERENCES mes.part_level(id) ON DELETE SET NULL;


--
-- Name: part_type part_type_part_type_category_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part_type
    ADD CONSTRAINT part_type_part_type_category_id_fkey FOREIGN KEY (part_type_category_id) REFERENCES mes.part_type_category(id) ON DELETE SET NULL;


--
-- Name: part part_unit_of_measure_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.part
    ADD CONSTRAINT part_unit_of_measure_id_fkey FOREIGN KEY (unit_of_measure_id) REFERENCES mes.unit_of_measure(id) ON DELETE SET NULL;


--
-- Name: product product_image_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product
    ADD CONSTRAINT product_image_id_fkey FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL;


--
-- Name: product product_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product
    ADD CONSTRAINT product_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: product product_platform_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.product
    ADD CONSTRAINT product_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES mes.platform(id) ON DELETE SET NULL;


--
-- Name: tool tool_tool_type_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.tool
    ADD CONSTRAINT tool_tool_type_id_fkey FOREIGN KEY (tool_type_id) REFERENCES mes.tool_type(id) ON DELETE SET NULL;


--
-- Name: work_order work_order_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL;


--
-- Name: work_order work_order_kit_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_kit_id_fkey FOREIGN KEY (kit_id) REFERENCES mes.kit(id) ON DELETE SET NULL;


--
-- Name: work_order work_order_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id);


--
-- Name: work_order work_order_product_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_product_id_fkey FOREIGN KEY (product_id) REFERENCES mes.product(id) ON DELETE SET NULL;


--
-- Name: work_order_step work_order_step_guide_step_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT work_order_step_guide_step_id_fkey FOREIGN KEY (guide_step_id) REFERENCES mes.guide_step(id);


--
-- Name: work_order_step work_order_step_image_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT work_order_step_image_id_fkey FOREIGN KEY (image_id) REFERENCES common.image(id) ON DELETE SET NULL;


--
-- Name: work_order_step work_order_step_work_order_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_step
    ADD CONSTRAINT work_order_step_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE CASCADE;


--
-- Name: work_order_task work_order_task_guide_step_task_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_task
    ADD CONSTRAINT work_order_task_guide_step_task_id_fkey FOREIGN KEY (guide_step_task_id) REFERENCES mes.guide_step_task(id);


--
-- Name: work_order_task work_order_task_work_order_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_task
    ADD CONSTRAINT work_order_task_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE CASCADE;


--
-- Name: work_order_task work_order_task_work_order_step_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order_task
    ADD CONSTRAINT work_order_task_work_order_step_id_fkey FOREIGN KEY (work_order_step_id) REFERENCES mes.work_order_step(id) ON DELETE SET NULL;


--
-- Name: work_order work_order_work_package_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_order
    ADD CONSTRAINT work_order_work_package_id_fkey FOREIGN KEY (work_package_id) REFERENCES mes.work_package(id) ON DELETE SET NULL;


--
-- Name: work_package work_package_guide_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package
    ADD CONSTRAINT work_package_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES mes.guide(id) ON DELETE SET NULL;


--
-- Name: work_package work_package_part_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package
    ADD CONSTRAINT work_package_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id);


--
-- Name: work_package work_package_product_id_fkey; Type: FK CONSTRAINT; Schema: mes; Owner: -
--

ALTER TABLE ONLY mes.work_package
    ADD CONSTRAINT work_package_product_id_fkey FOREIGN KEY (product_id) REFERENCES mes.product(id) ON DELETE SET NULL;


--
-- Name: board_column board_column_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.board_column
    ADD CONSTRAINT board_column_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE CASCADE;


--
-- Name: dashboard_widget dashboard_widget_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.dashboard_widget
    ADD CONSTRAINT dashboard_widget_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE CASCADE;


--
-- Name: milestone milestone_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.milestone
    ADD CONSTRAINT milestone_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: program program_buyer_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.program
    ADD CONSTRAINT program_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: program program_customer_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.program
    ADD CONSTRAINT program_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES application.customer(id) ON DELETE SET NULL;


--
-- Name: program program_program_manager_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.program
    ADD CONSTRAINT program_program_manager_id_fkey FOREIGN KEY (program_manager_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: program program_supply_chain_manager_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.program
    ADD CONSTRAINT program_supply_chain_manager_id_fkey FOREIGN KEY (supply_chain_manager_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: project project_program_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.project
    ADD CONSTRAINT project_program_id_fkey FOREIGN KEY (program_id) REFERENCES pm.program(id) ON DELETE SET NULL;


--
-- Name: project project_project_manager_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.project
    ADD CONSTRAINT project_project_manager_id_fkey FOREIGN KEY (project_manager_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: resource_allocation resource_allocation_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.resource_allocation
    ADD CONSTRAINT resource_allocation_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE CASCADE;


--
-- Name: resource_allocation resource_allocation_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.resource_allocation
    ADD CONSTRAINT resource_allocation_task_id_fkey FOREIGN KEY (task_id) REFERENCES pm.task(id) ON DELETE SET NULL;


--
-- Name: resource_allocation resource_allocation_user_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.resource_allocation
    ADD CONSTRAINT resource_allocation_user_id_fkey FOREIGN KEY (user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: task_activity task_activity_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_activity
    ADD CONSTRAINT task_activity_task_id_fkey FOREIGN KEY (task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: task task_assigned_to_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: task_assignee task_assignee_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_assignee
    ADD CONSTRAINT task_assignee_task_id_fkey FOREIGN KEY (task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: task_assignee task_assignee_user_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_assignee
    ADD CONSTRAINT task_assignee_user_id_fkey FOREIGN KEY (user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: task task_board_column_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_board_column_id_fkey FOREIGN KEY (board_column_id) REFERENCES pm.board_column(id) ON DELETE SET NULL;


--
-- Name: task_comment task_comment_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_comment
    ADD CONSTRAINT task_comment_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES pm.task_comment(id) ON DELETE SET NULL;


--
-- Name: task_comment task_comment_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_comment
    ADD CONSTRAINT task_comment_task_id_fkey FOREIGN KEY (task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: task_dependency task_dependency_predecessor_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_dependency
    ADD CONSTRAINT task_dependency_predecessor_fkey FOREIGN KEY (predecessor_task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: task_dependency task_dependency_successor_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task_dependency
    ADD CONSTRAINT task_dependency_successor_fkey FOREIGN KEY (successor_task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: task task_milestone_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES pm.milestone(id) ON DELETE SET NULL;


--
-- Name: task task_parent_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_parent_task_id_fkey FOREIGN KEY (parent_task_id) REFERENCES pm.task(id) ON DELETE SET NULL;


--
-- Name: task task_project_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.task
    ADD CONSTRAINT task_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: time_entry time_entry_task_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.time_entry
    ADD CONSTRAINT time_entry_task_id_fkey FOREIGN KEY (task_id) REFERENCES pm.task(id) ON DELETE CASCADE;


--
-- Name: time_entry time_entry_user_id_fkey; Type: FK CONSTRAINT; Schema: pm; Owner: -
--

ALTER TABLE ONLY pm.time_entry
    ADD CONSTRAINT time_entry_user_id_fkey FOREIGN KEY (user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: purchase_order FK_purchase_order_document_quotation_reference_id; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT "FK_purchase_order_document_quotation_reference_id" FOREIGN KEY (quotation_reference_id) REFERENCES common.document(id);


--
-- Name: bin_management bin_management_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.bin_management
    ADD CONSTRAINT bin_management_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: bin_management bin_management_unit_of_measure_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.bin_management
    ADD CONSTRAINT bin_management_unit_of_measure_id_fkey FOREIGN KEY (unit_of_measure_id) REFERENCES mes.unit_of_measure(id) ON DELETE SET NULL;


--
-- Name: company_address company_address_address_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_address
    ADD CONSTRAINT company_address_address_id_fkey FOREIGN KEY (address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: company_address company_address_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_address
    ADD CONSTRAINT company_address_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: company_bank_account company_bank_account_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_bank_account
    ADD CONSTRAINT company_bank_account_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES common.bank_account(id) ON DELETE SET NULL;


--
-- Name: company_bank_account company_bank_account_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_bank_account
    ADD CONSTRAINT company_bank_account_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: company_contact company_contact_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_contact
    ADD CONSTRAINT company_contact_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: company_contact company_contact_contact_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_contact
    ADD CONSTRAINT company_contact_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES common.contact(id) ON DELETE SET NULL;


--
-- Name: company company_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company
    ADD CONSTRAINT company_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: company_part company_part_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_part
    ADD CONSTRAINT company_part_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: company_part company_part_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_part
    ADD CONSTRAINT company_part_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: company_part company_part_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company_part
    ADD CONSTRAINT company_part_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: company company_payment_term_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.company
    ADD CONSTRAINT company_payment_term_id_fkey FOREIGN KEY (payment_term_id) REFERENCES sc.payment_term(id) ON DELETE SET NULL;


--
-- Name: inventory_stock fk_inventory_stock_assigned_user; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT fk_inventory_stock_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: inventory_transaction fk_inventory_transaction_assigned_user; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT fk_inventory_transaction_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: inventory_transaction fk_inventory_transaction_from_location; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT fk_inventory_transaction_from_location FOREIGN KEY (from_location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: inventory_transaction fk_inventory_transaction_project; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT fk_inventory_transaction_project FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: inventory_transaction fk_inventory_transaction_to_location; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT fk_inventory_transaction_to_location FOREIGN KEY (to_location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: purchase_order fk_purchase_order_department; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT fk_purchase_order_department FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;


--
-- Name: requisition fk_requisition_department; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition
    ADD CONSTRAINT fk_requisition_department FOREIGN KEY (department_id) REFERENCES common.department(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_assigned_user; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_from_bin; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_from_bin FOREIGN KEY (from_bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_from_location; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_from_location FOREIGN KEY (from_location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: stock_movement_line_item fk_stock_movement_line_item_movement; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement_line_item
    ADD CONSTRAINT fk_stock_movement_line_item_movement FOREIGN KEY (stock_movement_id) REFERENCES sc.stock_movement(id) ON DELETE CASCADE;


--
-- Name: stock_movement_line_item fk_stock_movement_line_item_part; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement_line_item
    ADD CONSTRAINT fk_stock_movement_line_item_part FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_performed_by; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_performed_by FOREIGN KEY (performed_by_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_to_bin; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_to_bin FOREIGN KEY (to_bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_to_location; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_to_location FOREIGN KEY (to_location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: stock_movement fk_stock_movement_work_order; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT fk_stock_movement_work_order FOREIGN KEY (work_order_id) REFERENCES mes.work_order(id) ON DELETE SET NULL;


--
-- Name: vendor_return_request fk_vendor_return_request_wo_id; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT fk_vendor_return_request_wo_id FOREIGN KEY (wo_id) REFERENCES mes.work_order(id) ON DELETE SET NULL;


--
-- Name: goods_receipt_note goods_receipt_note_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: goods_receipt_note goods_receipt_note_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES sc.purchase_order(id) ON DELETE SET NULL;


--
-- Name: goods_receipt_note goods_receipt_note_received_by_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_received_by_id_fkey FOREIGN KEY (received_by_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: goods_receipt_note goods_receipt_note_vendor_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: grn_line_item grn_line_item_checked_by_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.grn_line_item
    ADD CONSTRAINT grn_line_item_checked_by_id_fkey FOREIGN KEY (checked_by_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: grn_line_item grn_line_item_grn_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.grn_line_item
    ADD CONSTRAINT grn_line_item_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES sc.goods_receipt_note(id) ON DELETE SET NULL;


--
-- Name: grn_line_item grn_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.grn_line_item
    ADD CONSTRAINT grn_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: grn_line_item grn_line_item_po_line_item_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.grn_line_item
    ADD CONSTRAINT grn_line_item_po_line_item_id_fkey FOREIGN KEY (po_line_item_id) REFERENCES sc.po_line_item(id) ON DELETE SET NULL;


--
-- Name: inventory_part inventory_part_bin_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_part
    ADD CONSTRAINT inventory_part_bin_id_fkey FOREIGN KEY (bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL;


--
-- Name: inventory_part inventory_part_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_part
    ADD CONSTRAINT inventory_part_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: inventory_part inventory_part_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_part
    ADD CONSTRAINT inventory_part_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: inventory_stock inventory_stock_bin_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT inventory_stock_bin_id_fkey FOREIGN KEY (bin_id) REFERENCES sc.bin_management(id) ON DELETE SET NULL;


--
-- Name: inventory_stock inventory_stock_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT inventory_stock_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: inventory_stock inventory_stock_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT inventory_stock_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: inventory_stock inventory_stock_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_stock
    ADD CONSTRAINT inventory_stock_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: inventory_transaction inventory_transaction_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.inventory_transaction
    ADD CONSTRAINT inventory_transaction_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: po_line_item po_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.po_line_item
    ADD CONSTRAINT po_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: po_line_item po_line_item_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.po_line_item
    ADD CONSTRAINT po_line_item_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES sc.purchase_order(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_billing_address_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_buyer_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_delivery_address_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_delivery_address_id_fkey FOREIGN KEY (delivery_address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_payment_term_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_payment_term_id_fkey FOREIGN KEY (payment_term_id) REFERENCES sc.payment_term(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_requisition_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES sc.requisition(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_shipping_address_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_supply_chain_lead_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_supply_chain_lead_id_fkey FOREIGN KEY (supply_chain_lead_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_vendor_billing_address_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_vendor_billing_address_id_fkey FOREIGN KEY (vendor_billing_address_id) REFERENCES common.address(id) ON DELETE SET NULL;


--
-- Name: purchase_order purchase_order_vendor_billing_contact_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.purchase_order
    ADD CONSTRAINT purchase_order_vendor_billing_contact_id_fkey FOREIGN KEY (vendor_billing_contact_id) REFERENCES common.contact(id) ON DELETE SET NULL;


--
-- Name: requisition_line_item requisition_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition_line_item
    ADD CONSTRAINT requisition_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: requisition_line_item requisition_line_item_requisition_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition_line_item
    ADD CONSTRAINT requisition_line_item_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES sc.requisition(id) ON DELETE SET NULL;


--
-- Name: requisition requisition_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition
    ADD CONSTRAINT requisition_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: requisition requisition_requested_by_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.requisition
    ADD CONSTRAINT requisition_requested_by_id_fkey FOREIGN KEY (requested_by_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: scrap_line_item scrap_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_line_item
    ADD CONSTRAINT scrap_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: scrap_line_item scrap_line_item_scrap_request_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_line_item
    ADD CONSTRAINT scrap_line_item_scrap_request_id_fkey FOREIGN KEY (scrap_request_id) REFERENCES sc.scrap_request(id) ON DELETE CASCADE;


--
-- Name: scrap_request scrap_request_grn_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES sc.goods_receipt_note(id) ON DELETE SET NULL;


--
-- Name: scrap_request scrap_request_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: scrap_request scrap_request_po_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_po_id_fkey FOREIGN KEY (po_id) REFERENCES sc.purchase_order(id) ON DELETE SET NULL;


--
-- Name: scrap_request scrap_request_raised_by_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_raised_by_id_fkey FOREIGN KEY (raised_by_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: scrap_request scrap_request_wo_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.scrap_request
    ADD CONSTRAINT scrap_request_wo_id_fkey FOREIGN KEY (wo_id) REFERENCES mes.work_order(id) ON DELETE SET NULL;


--
-- Name: stock_movement stock_movement_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.stock_movement
    ADD CONSTRAINT stock_movement_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: tender tender_awarded_vendor_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_awarded_vendor_id_fkey FOREIGN KEY (awarded_vendor_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: tender tender_buyer_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: tender tender_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: tender_line_item tender_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_line_item
    ADD CONSTRAINT tender_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: tender_line_item tender_line_item_tender_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_line_item
    ADD CONSTRAINT tender_line_item_tender_id_fkey FOREIGN KEY (tender_id) REFERENCES sc.tender(id) ON DELETE CASCADE;


--
-- Name: tender_line_item tender_line_item_unit_of_measure_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_line_item
    ADD CONSTRAINT tender_line_item_unit_of_measure_id_fkey FOREIGN KEY (unit_of_measure_id) REFERENCES mes.unit_of_measure(id) ON DELETE SET NULL;


--
-- Name: tender tender_payment_term_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_payment_term_id_fkey FOREIGN KEY (payment_term_id) REFERENCES sc.payment_term(id) ON DELETE SET NULL;


--
-- Name: tender tender_project_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_project_id_fkey FOREIGN KEY (project_id) REFERENCES pm.project(id) ON DELETE SET NULL;


--
-- Name: tender_quotation tender_quotation_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation
    ADD CONSTRAINT tender_quotation_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: tender_quotation tender_quotation_currency_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation
    ADD CONSTRAINT tender_quotation_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES common.currency(id) ON DELETE SET NULL;


--
-- Name: tender_quotation tender_quotation_document_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation
    ADD CONSTRAINT tender_quotation_document_id_fkey FOREIGN KEY (document_id) REFERENCES common.document(id) ON DELETE SET NULL;


--
-- Name: tender_quotation_line_item tender_quotation_line_item_tender_line_item_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation_line_item
    ADD CONSTRAINT tender_quotation_line_item_tender_line_item_id_fkey FOREIGN KEY (tender_line_item_id) REFERENCES sc.tender_line_item(id) ON DELETE SET NULL;


--
-- Name: tender_quotation_line_item tender_quotation_line_item_tender_quotation_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation_line_item
    ADD CONSTRAINT tender_quotation_line_item_tender_quotation_id_fkey FOREIGN KEY (tender_quotation_id) REFERENCES sc.tender_quotation(id) ON DELETE CASCADE;


--
-- Name: tender_quotation tender_quotation_tender_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_quotation
    ADD CONSTRAINT tender_quotation_tender_id_fkey FOREIGN KEY (tender_id) REFERENCES sc.tender(id) ON DELETE CASCADE;


--
-- Name: tender tender_requisition_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender
    ADD CONSTRAINT tender_requisition_id_fkey FOREIGN KEY (requisition_id) REFERENCES sc.requisition(id) ON DELETE SET NULL;


--
-- Name: tender_vendor tender_vendor_company_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_vendor
    ADD CONSTRAINT tender_vendor_company_id_fkey FOREIGN KEY (company_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- Name: tender_vendor tender_vendor_tender_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.tender_vendor
    ADD CONSTRAINT tender_vendor_tender_id_fkey FOREIGN KEY (tender_id) REFERENCES sc.tender(id) ON DELETE CASCADE;


--
-- Name: vendor_return_line_item vendor_return_line_item_grn_line_item_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_line_item
    ADD CONSTRAINT vendor_return_line_item_grn_line_item_id_fkey FOREIGN KEY (grn_line_item_id) REFERENCES sc.grn_line_item(id) ON DELETE SET NULL;


--
-- Name: vendor_return_line_item vendor_return_line_item_part_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_line_item
    ADD CONSTRAINT vendor_return_line_item_part_id_fkey FOREIGN KEY (part_id) REFERENCES mes.part(id) ON DELETE SET NULL;


--
-- Name: vendor_return_line_item vendor_return_line_item_return_request_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_line_item
    ADD CONSTRAINT vendor_return_line_item_return_request_id_fkey FOREIGN KEY (return_request_id) REFERENCES sc.vendor_return_request(id) ON DELETE CASCADE;


--
-- Name: vendor_return_request vendor_return_request_grn_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES sc.goods_receipt_note(id) ON DELETE SET NULL;


--
-- Name: vendor_return_request vendor_return_request_location_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_location_id_fkey FOREIGN KEY (location_id) REFERENCES mes.location(id) ON DELETE SET NULL;


--
-- Name: vendor_return_request vendor_return_request_po_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_po_id_fkey FOREIGN KEY (po_id) REFERENCES sc.purchase_order(id) ON DELETE SET NULL;


--
-- Name: vendor_return_request vendor_return_request_raised_by_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_raised_by_id_fkey FOREIGN KEY (raised_by_id) REFERENCES application."user"(id) ON DELETE SET NULL;


--
-- Name: vendor_return_request vendor_return_request_vendor_id_fkey; Type: FK CONSTRAINT; Schema: sc; Owner: -
--

ALTER TABLE ONLY sc.vendor_return_request
    ADD CONSTRAINT vendor_return_request_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES sc.company(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict u0FaYQAlJnLlcXDo9Bty5RmVG8k8eVY9qRiXc5oS4Iq3ot7sizEaayoTh75MqAB

