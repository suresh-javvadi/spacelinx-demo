#!/usr/bin/env bash
# ============================================================================
# run-catalog-diff.sh — driver for the catalog-level schema-diff gate.
#
# Creates the ground-truth database `cmp_ground` and loads a UAT/Dev pg_dump
# into it, then runs database/audit/catalog-diff.sql comparing the (already
# built by the caller) `cmp_ef` database against `cmp_ground`, printing the
# per-category drift counts and TOTAL_BLOCKING.
#
# PRECONDITION: the caller has already built the EF schema into `cmp_ef` on the
# same PostgreSQL server (e.g. via `dotnet ef database update --connection
# ...Database=cmp_ef...` plus procedures/views). This script does NOT build EF.
#
# Usage:
#   run-catalog-diff.sh <ground_sql_path> [options]
#
# Options (env or flags; all have container-friendly defaults):
#   --container NAME   docker container running PostgreSQL (default: $PG_CONTAINER or slx-gate)
#   --host HOST        if set, connect via host:port instead of docker exec
#   --port PORT        host port (default: 55437) — only with --host
#   --user USER        superuser role (default: postgres)
#   --password PASS    password for --host mode (default: postgres)
#   --ground-db NAME   ground DB name (default: cmp_ground)
#   --ef-db NAME       EF DB name (default: cmp_ef)
#
# Examples:
#   ./run-catalog-diff.sh database/audit/uat.schema.sql --container slx-gate
#   PGHOST mode:
#   ./run-catalog-diff.sh database/audit/uat.schema.sql --host localhost --port 55437
# ============================================================================
set -euo pipefail

GROUND_SQL="${1:-}"
if [[ -z "$GROUND_SQL" ]]; then
  echo "ERROR: ground-truth .sql path required as first argument" >&2
  exit 2
fi
shift || true
if [[ ! -f "$GROUND_SQL" ]]; then
  echo "ERROR: ground SQL file not found: $GROUND_SQL" >&2
  exit 2
fi

CONTAINER="${PG_CONTAINER:-slx-gate}"
HOST=""
PORT="55437"
PGUSER_="postgres"
PGPASS_="postgres"
GROUND_DB="cmp_ground"
EF_DB="cmp_ef"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --container) CONTAINER="$2"; shift 2;;
    --host)      HOST="$2"; shift 2;;
    --port)      PORT="$2"; shift 2;;
    --user)      PGUSER_="$2"; shift 2;;
    --password)  PGPASS_="$2"; shift 2;;
    --ground-db) GROUND_DB="$2"; shift 2;;
    --ef-db)     EF_DB="$2"; shift 2;;
    *) echo "ERROR: unknown option: $1" >&2; exit 2;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIFF_SQL="$SCRIPT_DIR/catalog-diff.sql"
if [[ ! -f "$DIFF_SQL" ]]; then
  echo "ERROR: catalog-diff.sql not found next to this script: $DIFF_SQL" >&2
  exit 2
fi

# ---- psql invocation abstraction (docker exec vs host) ---------------------
# psql_db <dbname> [extra psql args...]   -- reads SQL from stdin, stops on error
psql_db() {
  local db="$1"; shift
  if [[ -n "$HOST" ]]; then
    PGPASSWORD="$PGPASS_" psql -h "$HOST" -p "$PORT" -U "$PGUSER_" -d "$db" -v ON_ERROR_STOP=1 "$@"
  else
    docker exec -i -e PGPASSWORD="$PGPASS_" "$CONTAINER" \
      psql -U "$PGUSER_" -d "$db" -v ON_ERROR_STOP=1 "$@"
  fi
}

# psql_load <dbname>   -- lenient load of a pg_dump from stdin (NO ON_ERROR_STOP).
# pg_dumps from a newer pg_dump (e.g. 18) emit settings unknown to PG16
# (transaction_timeout) and idempotent guards; these are harmless and must not
# abort the load. Real success is asserted afterward by the managed-table count.
psql_load() {
  local db="$1"
  if [[ -n "$HOST" ]]; then
    PGPASSWORD="$PGPASS_" psql -h "$HOST" -p "$PORT" -U "$PGUSER_" -d "$db" -q
  else
    docker exec -i -e PGPASSWORD="$PGPASS_" "$CONTAINER" psql -U "$PGUSER_" -d "$db" -q
  fi
}

echo "==> Verifying cmp_ef ('$EF_DB') exists (caller must have built it)"
if ! psql_db postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$EF_DB'" | grep -q 1; then
  echo "ERROR: EF database '$EF_DB' does not exist. Build it first (dotnet ef database update --connection ...Database=$EF_DB...)." >&2
  exit 3
fi

echo "==> (Re)creating ground database '$GROUND_DB'"
psql_db postgres -c "DROP DATABASE IF EXISTS $GROUND_DB" >/dev/null
psql_db postgres -c "CREATE DATABASE $GROUND_DB" >/dev/null

echo "==> Loading ground-truth dump into '$GROUND_DB': $GROUND_SQL"
# Quiet the load but stop on real errors. Dumps create their own schemas/roles
# references; --no-owner/--no-privileges dumps tolerate missing roles, but in
# case the dump references roles, we pre-create the two app roles harmlessly.
for role in spacelinxadmin spacelinxuser; do
  psql_db postgres -tAc "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='$role') THEN CREATE ROLE $role; END IF; END \$\$;" >/dev/null 2>&1 || true
done
psql_load "$GROUND_DB" < "$GROUND_SQL" > /tmp/ground_load.log 2>&1 || true
# Assert the load actually produced the managed schema (not an empty DB).
LOADED_TABLES=$(psql_db "$GROUND_DB" -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema IN ('application','common','mes','pm','sc') AND table_type='BASE TABLE'")
LOADED_TABLES="${LOADED_TABLES//[[:space:]]/}"
if [[ "${LOADED_TABLES:-0}" -lt 100 ]]; then
  echo "ERROR: ground dump load produced only ${LOADED_TABLES:-0} base tables (<100). Tail of log:" >&2
  tail -n 30 /tmp/ground_load.log >&2
  exit 4
fi
echo "    loaded $LOADED_TABLES base tables into $GROUND_DB"
# Surface any non-trivial load errors (ignore the known forward-compat SET ones).
if grep -Eiv 'transaction_timeout|already exists|does not exist, skipping' /tmp/ground_load.log \
     | grep -qi 'ERROR'; then
  echo "    WARNING: ground load reported unexpected errors:" >&2
  grep -i ERROR /tmp/ground_load.log | grep -Eiv 'transaction_timeout|already exists' | head -10 >&2
fi

echo "==> Running catalog-diff.sql ($EF_DB  vs  $GROUND_DB)"
echo
psql_db "$EF_DB" -v ground="$GROUND_DB" -f - < "$DIFF_SQL"
