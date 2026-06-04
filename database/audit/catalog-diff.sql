-- ============================================================================
-- catalog-diff.sql  —  Authoritative catalog-level schema-diff gate
-- ============================================================================
-- Compares an EF-built schema (the database this script is RUN AGAINST, by
-- convention `cmp_ef`) against a ground-truth schema (a second database
-- `cmp_ground` on the SAME server, loaded from a pg_dump of UAT/Dev).
--
-- WHY THIS EXISTS: the prior "MATCH" verdict was a FALSE POSITIVE because it
-- only SAMPLED columns. This gate compares EVERY column / constraint / index
-- over the 107 baseline-managed tables (database/audit/managed-tables.txt) and
-- reports a per-category BLOCKING drift count. It is the exit criterion for the
-- upcoming reconciliation, so it must be trustworthy.
--
-- DESIGN
--   * Run against cmp_ef:  psql -d cmp_ef -v ground=cmp_ground -f catalog-diff.sql
--   * Both sides of every comparison run the SAME self-contained query text
--     (with a managed-table predicate inlined) — the LOCAL/EF side via
--     dblink('dbname='||current_database(),...) and the GROUND side via
--     dblink('dbname=cmp_ground',...). Running both via dblink guarantees the
--     two fact sets are produced by byte-identical SQL.
--   * Every category is compared SYMMETRICALLY (both directions): each fact is
--     a (KEY=object identity, VALUE=fingerprint) pair, and the drift count is a
--     FULL OUTER JOIN on KEY counting every DISTINCT object that is EF-only,
--     ground-only, OR present-on-both-with-a-differing-fingerprint exactly once
--     (see pg_temp._drift_count()). This counts differing OBJECTS (columns,
--     FK edges, ...) the way dev-vs-baseline.diff does, and avoids the SQL
--     set-operator precedence trap where `A EXCEPT B UNION ALL C EXCEPT D`
--     binds left-to-right rather than as two independent differences.
--     (INDEXES are intentionally ASYMMETRIC — see category 5.)
--   * Scope = the 107 managed tables only (audit schema EXCLUDED).
--   * Allow-listed COSMETIC differences (database/audit/diff-allowlist.md) are
--     normalised out of the BLOCKING categories inline, with comments.
--
-- OUTPUT: one labelled COUNT per category, then TOTAL_BLOCKING.
-- ============================================================================

\set ON_ERROR_STOP on
\timing off
\pset pager off

-- Ground-truth DB name (defaults to cmp_ground; override with -v ground=...)
\if :{?ground}
\else
  \set ground cmp_ground
\endif

CREATE EXTENSION IF NOT EXISTS dblink;

-- dblink conn strings to the two databases on this same cluster.
SELECT format('dbname=%s', current_database()) AS _ef_conn,
       format('dbname=%L', :'ground')          AS _ground_conn \gset

-- ----------------------------------------------------------------------------
-- 0. The managed-table universe (107 tables). MUST equal managed-tables.txt.
--    Kept inline so the .sql is self-contained and reproducible.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS _managed;
CREATE TEMP TABLE _managed(schema_name text, table_name text);
INSERT INTO _managed(schema_name, table_name) VALUES
 ('application','app'),('application','bulk_upload'),('application','customer'),
 ('application','feature_bit'),('application','issue'),('application','option_set'),
 ('application','organization'),('application','organization_address'),
 ('application','permission'),('application','role'),('application','role_filter'),
 ('application','role_permission'),('application','staff'),('application','user'),
 ('application','user_role'),
 ('common','additional_recipient_configuration'),('common','address'),
 ('common','approval'),('common','approval_configuration'),('common','approval_log'),
 ('common','approval_notification_recipient'),('common','bank_account'),
 ('common','contact'),('common','country'),('common','currency'),
 ('common','department'),('common','document'),('common','fcm_token'),
 ('common','image'),('common','video'),
 ('mes','assembly_location'),('mes','ebom'),('mes','eco'),('mes','eco_log'),
 ('mes','eco_part'),('mes','email_log'),('mes','email_template'),('mes','guide'),
 ('mes','guide_check_out_history'),('mes','guide_ebom'),('mes','guide_mbom'),
 ('mes','guide_step'),('mes','guide_step_equipment'),('mes','guide_step_task'),
 ('mes','guide_type'),('mes','kit'),('mes','kit_bom_comment'),('mes','kit_serial'),
 ('mes','location'),('mes','machine'),('mes','machine_type'),('mes','material_kit'),
 ('mes','news'),('mes','news_type'),('mes','part'),('mes','part_level'),
 ('mes','part_type'),('mes','part_type_category'),('mes','platform'),
 ('mes','product'),('mes','subsystem'),('mes','tool'),('mes','tool_type'),
 ('mes','unit_of_measure'),('mes','work_order'),('mes','work_order_step'),
 ('mes','work_order_task'),('mes','work_package'),
 ('pm','board_column'),('pm','dashboard_widget'),('pm','milestone'),
 ('pm','program'),('pm','project'),('pm','resource_allocation'),('pm','task'),
 ('pm','task_activity'),('pm','task_assignee'),('pm','task_comment'),
 ('pm','task_dependency'),('pm','time_entry'),
 ('sc','bin_management'),('sc','company'),('sc','company_address'),
 ('sc','company_bank_account'),('sc','company_contact'),('sc','company_part'),
 ('sc','goods_receipt_note'),('sc','grn_line_item'),('sc','inventory_part'),
 ('sc','inventory_stock'),('sc','inventory_transaction'),('sc','payment_term'),
 ('sc','po_line_item'),('sc','purchase_order'),('sc','requisition'),
 ('sc','requisition_line_item'),('sc','scrap_line_item'),('sc','scrap_request'),
 ('sc','stock_movement'),('sc','stock_movement_line_item'),('sc','tender'),
 ('sc','tender_line_item'),('sc','tender_quotation'),
 ('sc','tender_quotation_line_item'),('sc','tender_vendor'),
 ('sc','vendor_return_line_item'),('sc','vendor_return_request');

SELECT count(*) AS managed_table_count FROM _managed;

-- The managed (schema,table) set rendered as a SQL VALUES-IN list, substituted
-- into each category query in place of the literal token __MGD__.
SELECT string_agg(format('(%L,%L)', schema_name, table_name), ',') AS mgd
  FROM _managed \gset

-- ============================================================================
-- SCOPE ASSERTION (critical — prevents a false pass)
-- Before ANY comparison, assert the managed-table COLUMN universe count is
-- EQUAL on both DBs. If a managed table is missing on one side, its columns
-- simply would not appear in EXCEPT and the gate could under-report. A scope
-- mismatch FAILS HARD here ("scope mismatch") before anything is reported.
-- ============================================================================
SELECT
  (SELECT remote_count FROM dblink(:'_ef_conn',
     'SELECT count(*) FROM information_schema.columns c WHERE (c.table_schema, c.table_name) IN ('
     || :'mgd' || ')') AS t(remote_count bigint)) AS ef_universe,
  (SELECT remote_count FROM dblink(:'_ground_conn',
     'SELECT count(*) FROM information_schema.columns c WHERE (c.table_schema, c.table_name) IN ('
     || :'mgd' || ')') AS t(remote_count bigint)) AS ground_universe
\gset scope_

\echo '--------------------------------------------------------------------'
\echo 'SCOPE ASSERTION  (managed-table column universe must match)'
\echo '  EF column universe     :' :scope_ef_universe
\echo '  GROUND column universe :' :scope_ground_universe

-- Compute equality as a boolean psql variable, then branch with \if.
SELECT (:scope_ef_universe = :scope_ground_universe) AS scope_ok \gset
\if :scope_ok
\else
  \echo '  *** SCOPE MISMATCH — managed-table column universe differs between cmp_ef and ground.'
  \echo '  *** A managed table is missing on one side; drift counts would be untrustworthy.'
  \echo '  *** Refusing to report drift. FAIL.'
  -- Force a hard, non-zero exit (ON_ERROR_STOP aborts the script here).
  SELECT 'scope mismatch'::int AS fail_on_scope_mismatch;
\endif
\echo '  SCOPE OK'
\echo '--------------------------------------------------------------------'

-- ============================================================================
-- Shared scratch.  For each category we run ONE query on BOTH sides via dblink
-- (same query text => byte-identical fact production). Each fact row is
--   k = the OBJECT IDENTITY (stable key, e.g. table.column or the FK's
--       referencing table+columns) and
--   v = the full normalised FINGERPRINT of that object.
-- The managed-table predicate is inlined into each query body via the psql
-- variable :'mgd' (a ready-made SQL VALUES list, e.g. ('a','b'),...). The query
-- body is a SQL dollar-quoted literal $q$...$q$ (multi-line, valid in SQL) —
-- NOT a psql \set (psql \set does not support dollar-quoting).
--
-- DRIFT COUNT (symmetric, both directions, per-OBJECT):  _drift_count() does a
-- FULL OUTER JOIN on k and counts each DISTINCT object that is EF-only,
-- ground-only, OR present on both with a differing fingerprint — exactly ONCE.
-- This matches the dev-vs-baseline.diff convention (it counts differing columns
-- /edges, not raw symmetric rows) and avoids SQL set-operator precedence traps.
-- ============================================================================
DROP TABLE IF EXISTS _ef_facts;     CREATE TEMP TABLE _ef_facts(k text, v text);
DROP TABLE IF EXISTS _ground_facts; CREATE TEMP TABLE _ground_facts(k text, v text);
DROP TABLE IF EXISTS _drift;        CREATE TEMP TABLE _drift(category text, count int);

CREATE OR REPLACE FUNCTION pg_temp._drift_count() RETURNS int LANGUAGE sql AS $fn$
  SELECT count(*)::int FROM (
    SELECT coalesce(e.k, g.k) AS k
    FROM _ef_facts e FULL OUTER JOIN _ground_facts g ON e.k = g.k
    WHERE e.k IS NULL                       -- ground-only object (missing in EF)
       OR g.k IS NULL                       -- EF-only object (extra in EF)
       OR e.v IS DISTINCT FROM g.v           -- same object, fingerprint differs
    GROUP BY coalesce(e.k, g.k)
  ) d;
$fn$;

-- ----------------------------------------------------------------------------
-- 1. COLUMNS
--    (table_schema, table_name, column_name, data_type, udt_name, is_nullable,
--     column_default, character_maximum_length, numeric_precision,
--     numeric_scale, is_generated, generation_expression)
--    udt_name distinguishes timestamp vs timestamptz, int4 vs int8.
--    column_default catches nextval()/literal DEFAULT losses.
--    NORMALISATION (cosmetic, diff-allowlist.md §2e): a default that is a bare
--    numeric literal is canonicalised via trim_scale() so DEFAULT 0 == 0.0.
-- ----------------------------------------------------------------------------
TRUNCATE _ef_facts; TRUNCATE _ground_facts;
INSERT INTO _ef_facts     SELECT * FROM dblink(:'_ef_conn',     $q$
  SELECT format('%s|%s|%s', table_schema, table_name, column_name) AS k,
         format('%s|%s|%s|%s|%s|%s|%s|%s|%s',
           data_type, udt_name, is_nullable,
           CASE WHEN column_default ~ '^[0-9]+(\.[0-9]+)?$'
                THEN trim_scale(column_default::numeric)::text
                ELSE coalesce(column_default,'') END,
           coalesce(character_maximum_length::text,''),
           coalesce(numeric_precision::text,''),
           coalesce(numeric_scale::text,''),
           is_generated, coalesce(generation_expression,'')) AS v
  FROM information_schema.columns c
  WHERE (c.table_schema, c.table_name) IN ($q$ || :'mgd' || $q$)
$q$) AS t(k text, v text);
INSERT INTO _ground_facts SELECT * FROM dblink(:'_ground_conn', $q$
  SELECT format('%s|%s|%s', table_schema, table_name, column_name) AS k,
         format('%s|%s|%s|%s|%s|%s|%s|%s|%s',
           data_type, udt_name, is_nullable,
           CASE WHEN column_default ~ '^[0-9]+(\.[0-9]+)?$'
                THEN trim_scale(column_default::numeric)::text
                ELSE coalesce(column_default,'') END,
           coalesce(character_maximum_length::text,''),
           coalesce(numeric_precision::text,''),
           coalesce(numeric_scale::text,''),
           is_generated, coalesce(generation_expression,'')) AS v
  FROM information_schema.columns c
  WHERE (c.table_schema, c.table_name) IN ($q$ || :'mgd' || $q$)
$q$) AS t(k text, v text);
INSERT INTO _drift SELECT 'columns', pg_temp._drift_count();

-- ----------------------------------------------------------------------------
-- 2. FOREIGN KEYS  (pg_constraint contype='f')
--    Fingerprint = conrelid::regclass + the BY-NAME constraint body from
--    pg_get_constraintdef:  FOREIGN KEY (cols) REFERENCES tgt(cols)
--    [ON UPDATE ...] [ON DELETE ...].  This is fully NAME-BASED for the
--    referencing & referenced columns (so it does NOT depend on physical
--    attnum/column ORDER, which legitimately differs EF-vs-dump), and the
--    constraint NAME itself is absent from the body -> name-independent.
--    confdeltype (ON DELETE) and confupdtype (ON UPDATE) are carried IN the body.
--    NORMALISATION (cosmetic, diff-allowlist.md §3 NOT-VALID-only): a trailing
--    ' NOT VALID' is stripped, so a NOT-VALID-only flag diff is NOT blocking.
-- ----------------------------------------------------------------------------
TRUNCATE _ef_facts; TRUNCATE _ground_facts;
INSERT INTO _ef_facts     SELECT * FROM dblink(:'_ef_conn',     $q$
  SELECT
    format('%s|%s', con.conrelid::regclass::text,
      (SELECT string_agg(a.attname, ',' ORDER BY x.ord)
         FROM unnest(con.conkey) WITH ORDINALITY AS x(att,ord)
         JOIN pg_attribute a ON a.attrelid=con.conrelid AND a.attnum=x.att)) AS k,
    regexp_replace(pg_get_constraintdef(con.oid), '\s+NOT VALID$', '') AS v
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace ns ON ns.oid = rel.relnamespace
  WHERE con.contype='f' AND (ns.nspname, rel.relname) IN ($q$ || :'mgd' || $q$)
$q$) AS t(k text, v text);
INSERT INTO _ground_facts SELECT * FROM dblink(:'_ground_conn', $q$
  SELECT
    format('%s|%s', con.conrelid::regclass::text,
      (SELECT string_agg(a.attname, ',' ORDER BY x.ord)
         FROM unnest(con.conkey) WITH ORDINALITY AS x(att,ord)
         JOIN pg_attribute a ON a.attrelid=con.conrelid AND a.attnum=x.att)) AS k,
    regexp_replace(pg_get_constraintdef(con.oid), '\s+NOT VALID$', '') AS v
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace ns ON ns.oid = rel.relnamespace
  WHERE con.contype='f' AND (ns.nspname, rel.relname) IN ($q$ || :'mgd' || $q$)
$q$) AS t(k text, v text);
INSERT INTO _drift SELECT 'foreign_keys', pg_temp._drift_count();

-- ----------------------------------------------------------------------------
-- 3. CHECK CONSTRAINTS  (pg_constraint contype='c')
--    key = conrelid + the constrained column(s) (so a WIDENED check on the same
--    column — e.g. sc.goods_receipt_note status gaining 'Quality Checked' —
--    counts as ONE differing object, not one add + one drop).
--    value = pg_get_constraintdef body (name absent -> name-independent).
--    NORMALISATION (cosmetic): strip a trailing ' NOT VALID' so a NOT-VALID-only
--    CHECK diff is not blocking (consistent with the FK NOT-VALID allowance).
-- ----------------------------------------------------------------------------
TRUNCATE _ef_facts; TRUNCATE _ground_facts;
INSERT INTO _ef_facts     SELECT * FROM dblink(:'_ef_conn',     $q$
  SELECT
    format('%s|%s', con.conrelid::regclass::text,
      coalesce((SELECT string_agg(a.attname, ',' ORDER BY a.attname)
         FROM unnest(con.conkey) AS x(att)
         JOIN pg_attribute a ON a.attrelid=con.conrelid AND a.attnum=x.att), '')) AS k,
    regexp_replace(pg_get_constraintdef(con.oid), '\s+NOT VALID$', '') AS v
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace ns ON ns.oid = rel.relnamespace
  WHERE con.contype='c' AND (ns.nspname, rel.relname) IN ($q$ || :'mgd' || $q$)
$q$) AS t(k text, v text);
INSERT INTO _ground_facts SELECT * FROM dblink(:'_ground_conn', $q$
  SELECT
    format('%s|%s', con.conrelid::regclass::text,
      coalesce((SELECT string_agg(a.attname, ',' ORDER BY a.attname)
         FROM unnest(con.conkey) AS x(att)
         JOIN pg_attribute a ON a.attrelid=con.conrelid AND a.attnum=x.att), '')) AS k,
    regexp_replace(pg_get_constraintdef(con.oid), '\s+NOT VALID$', '') AS v
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace ns ON ns.oid = rel.relnamespace
  WHERE con.contype='c' AND (ns.nspname, rel.relname) IN ($q$ || :'mgd' || $q$)
$q$) AS t(k text, v text);
INSERT INTO _drift SELECT 'checks', pg_temp._drift_count();

-- ----------------------------------------------------------------------------
-- 4. PRIMARY KEY / UNIQUE  (contype IN ('p','u') + unique indexes)
--    Compared by (kind, table, ordered column-name list, predicate), NAME-FREE.
--    NORMALISATION (cosmetic, diff-allowlist.md):
--      * UNIQUE CONSTRAINT (ground) vs UNIQUE INDEX (EF) treated as EQUIVALENT:
--        both unioned and labelled 'u'. PK stays 'p'.
--      * PK_/UQ_ naming differences irrelevant (name not in the tuple).
--      * a unique index that BACKS a unique constraint is excluded (counted as
--        the constraint) so constraint-vs-index is not double-diffed.
-- ----------------------------------------------------------------------------
TRUNCATE _ef_facts; TRUNCATE _ground_facts;
INSERT INTO _ef_facts     SELECT * FROM dblink(:'_ef_conn',     $q$
  WITH con_keys AS (
    SELECT (CASE con.contype WHEN 'p' THEN 'p' ELSE 'u' END) AS kind,
           con.conrelid::regclass::text AS rel,
           (SELECT string_agg(a.attname, ',' ORDER BY x.ord)
              FROM unnest(con.conkey) WITH ORDINALITY AS x(att,ord)
              JOIN pg_attribute a ON a.attrelid=con.conrelid AND a.attnum=x.att) AS cols,
           '' AS predicate
    FROM pg_constraint con JOIN pg_class rel ON rel.oid=con.conrelid
    JOIN pg_namespace ns ON ns.oid=rel.relnamespace
    WHERE con.contype IN ('p','u') AND (ns.nspname, rel.relname) IN ($q$ || :'mgd' || $q$)
  ),
  uniq_idx AS (
    SELECT 'u' AS kind, (idx.indrelid::regclass)::text AS rel,
           (SELECT string_agg(a.attname, ',' ORDER BY k.ord)
              FROM unnest(idx.indkey) WITH ORDINALITY AS k(att,ord)
              JOIN pg_attribute a ON a.attrelid=idx.indrelid AND a.attnum=k.att
              WHERE k.att<>0) AS cols,
           coalesce(pg_get_expr(idx.indpred, idx.indrelid),'') AS predicate
    FROM pg_index idx JOIN pg_class rel ON rel.oid=idx.indrelid
    JOIN pg_namespace ns ON ns.oid=rel.relnamespace
    WHERE idx.indisunique AND NOT idx.indisprimary
      AND NOT EXISTS (SELECT 1 FROM pg_constraint c2 WHERE c2.conindid=idx.indexrelid)
      AND (ns.nspname, rel.relname) IN ($q$ || :'mgd' || $q$)
  ),
  unified AS (SELECT kind,rel,cols,predicate FROM con_keys
              UNION SELECT kind,rel,cols,predicate FROM uniq_idx)
  SELECT format('%s|%s|%s|%s', kind, rel, cols, predicate) AS k, '1' AS v FROM unified
$q$) AS t(k text, v text);
INSERT INTO _ground_facts SELECT * FROM dblink(:'_ground_conn', $q$
  WITH con_keys AS (
    SELECT (CASE con.contype WHEN 'p' THEN 'p' ELSE 'u' END) AS kind,
           con.conrelid::regclass::text AS rel,
           (SELECT string_agg(a.attname, ',' ORDER BY x.ord)
              FROM unnest(con.conkey) WITH ORDINALITY AS x(att,ord)
              JOIN pg_attribute a ON a.attrelid=con.conrelid AND a.attnum=x.att) AS cols,
           '' AS predicate
    FROM pg_constraint con JOIN pg_class rel ON rel.oid=con.conrelid
    JOIN pg_namespace ns ON ns.oid=rel.relnamespace
    WHERE con.contype IN ('p','u') AND (ns.nspname, rel.relname) IN ($q$ || :'mgd' || $q$)
  ),
  uniq_idx AS (
    SELECT 'u' AS kind, (idx.indrelid::regclass)::text AS rel,
           (SELECT string_agg(a.attname, ',' ORDER BY k.ord)
              FROM unnest(idx.indkey) WITH ORDINALITY AS k(att,ord)
              JOIN pg_attribute a ON a.attrelid=idx.indrelid AND a.attnum=k.att
              WHERE k.att<>0) AS cols,
           coalesce(pg_get_expr(idx.indpred, idx.indrelid),'') AS predicate
    FROM pg_index idx JOIN pg_class rel ON rel.oid=idx.indrelid
    JOIN pg_namespace ns ON ns.oid=rel.relnamespace
    WHERE idx.indisunique AND NOT idx.indisprimary
      AND NOT EXISTS (SELECT 1 FROM pg_constraint c2 WHERE c2.conindid=idx.indexrelid)
      AND (ns.nspname, rel.relname) IN ($q$ || :'mgd' || $q$)
  ),
  unified AS (SELECT kind,rel,cols,predicate FROM con_keys
              UNION SELECT kind,rel,cols,predicate FROM uniq_idx)
  SELECT format('%s|%s|%s|%s', kind, rel, cols, predicate) AS k, '1' AS v FROM unified
$q$) AS t(k text, v text);
INSERT INTO _drift SELECT 'pk_unique', pg_temp._drift_count();

-- ----------------------------------------------------------------------------
-- 5. INDEXES  (non-unique; unique handled in cat 4)
--    Keyed by (table, per-column indexdef, predicate), NAME-FREE & storage-free.
--    NORMALISATION (cosmetic, diff-allowlist.md):
--      * index NAME stripped (EF IX_* / UAT idx_* naming-only).
--      * storage params (fillfactor/deduplicate_items) excluded — each key
--        column is rendered via pg_get_indexdef(idx, colno, true) (omits them).
--      * EF auto btree-per-FK indexes are purely ADDITIVE perf indexes and are
--        ALLOW-LISTED: we count ONLY indexes present on GROUND but MISSING from
--        EF (a real loss, e.g. a dropped partial soft-delete filter). EF-only
--        additive indexes are intentionally NOT blocking.
-- ----------------------------------------------------------------------------
-- key = table + indexed-column-expression list; value = partial predicate.
TRUNCATE _ef_facts; TRUNCATE _ground_facts;
INSERT INTO _ef_facts     SELECT * FROM dblink(:'_ef_conn',     $q$
  SELECT
    format('%s|%s', (idx.indrelid::regclass)::text,
      (SELECT string_agg(pg_get_indexdef(idx.indexrelid, k.ord::int, true), ',' ORDER BY k.ord)
         FROM generate_series(1, idx.indnkeyatts) AS k(ord))) AS k,
    coalesce(pg_get_expr(idx.indpred, idx.indrelid),'') AS v
  FROM pg_index idx JOIN pg_class rel ON rel.oid=idx.indrelid
  JOIN pg_namespace ns ON ns.oid=rel.relnamespace
  WHERE NOT idx.indisprimary AND NOT idx.indisunique
    AND NOT EXISTS (SELECT 1 FROM pg_constraint c2 WHERE c2.conindid=idx.indexrelid)
    AND (ns.nspname, rel.relname) IN ($q$ || :'mgd' || $q$)
$q$) AS t(k text, v text);
INSERT INTO _ground_facts SELECT * FROM dblink(:'_ground_conn', $q$
  SELECT
    format('%s|%s', (idx.indrelid::regclass)::text,
      (SELECT string_agg(pg_get_indexdef(idx.indexrelid, k.ord::int, true), ',' ORDER BY k.ord)
         FROM generate_series(1, idx.indnkeyatts) AS k(ord))) AS k,
    coalesce(pg_get_expr(idx.indpred, idx.indrelid),'') AS v
  FROM pg_index idx JOIN pg_class rel ON rel.oid=idx.indrelid
  JOIN pg_namespace ns ON ns.oid=rel.relnamespace
  WHERE NOT idx.indisprimary AND NOT idx.indisunique
    AND NOT EXISTS (SELECT 1 FROM pg_constraint c2 WHERE c2.conindid=idx.indexrelid)
    AND (ns.nspname, rel.relname) IN ($q$ || :'mgd' || $q$)
$q$) AS t(k text, v text);
-- ASYMMETRIC on purpose: count GROUND-side index objects (rel,cols) that are
-- MISSING from EF, OR present on EF but with a different partial predicate
-- (e.g. EF dropped a WHERE deleted_at IS NULL filter). EF-only ADDITIVE indexes
-- (EF auto btree-per-FK) are allow-listed (diff-allowlist.md) and NOT counted.
INSERT INTO _drift SELECT 'indexes', count(*)::int FROM (
  SELECT g.k FROM _ground_facts g
  LEFT JOIN _ef_facts e ON e.k = g.k AND e.v = g.v
  WHERE e.k IS NULL
  GROUP BY g.k
) d;

-- ----------------------------------------------------------------------------
-- 6. SEQUENCES  (information_schema.sequences: schema, name, data_type)
--    Restricted to the 5 managed schemas. NAME matters (DEFAULTs & generate_*
--    functions reference sequences by name); data_type catches int4/int8 drift.
-- ----------------------------------------------------------------------------
TRUNCATE _ef_facts; TRUNCATE _ground_facts;
INSERT INTO _ef_facts     SELECT * FROM dblink(:'_ef_conn',     $q$
  SELECT format('%s|%s', sequence_schema, sequence_name) AS k, data_type AS v
  FROM information_schema.sequences
  WHERE sequence_schema IN ('application','common','mes','pm','sc')
$q$) AS t(k text, v text);
INSERT INTO _ground_facts SELECT * FROM dblink(:'_ground_conn', $q$
  SELECT format('%s|%s', sequence_schema, sequence_name) AS k, data_type AS v
  FROM information_schema.sequences
  WHERE sequence_schema IN ('application','common','mes','pm','sc')
$q$) AS t(k text, v text);
INSERT INTO _drift SELECT 'sequences', pg_temp._drift_count();

-- ============================================================================
-- REPORT
-- ============================================================================
\echo ''
\echo '==================== CATALOG DIFF — PER CATEGORY ===================='
SELECT category, count AS blocking_drift
FROM _drift
ORDER BY array_position(
  ARRAY['columns','foreign_keys','checks','pk_unique','indexes','sequences'], category);

\echo '--------------------------------------------------------------------'
SELECT sum(count) AS "TOTAL_BLOCKING" FROM _drift;
\echo '===================================================================='
