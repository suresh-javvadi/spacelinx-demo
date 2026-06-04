#!/usr/bin/env bash
# One-command local SpaceLinx database: brings up Postgres 16 in Docker and applies the
# EF Core migrations + procedures + views + seed in the SAME order as the CI pipeline
# (azure-pipelines.db-migrate.yml), so local development mirrors Dev/UAT/Prod.
#
# Usage:
#   database/local/setup-local-db.sh                 # schema + reference seed
#   database/local/setup-local-db.sh you@tenant.com  # also bootstrap you as Super Admin
#
# Re-runnable: migrations are idempotent, procedures/views are CREATE OR REPLACE, and the
# seed is INSERT-only (a no-op on populated tables). For a clean slate: reset-local-db.sh
set -euo pipefail

ADMIN_EMAIL="${1:-}"

# Resolve paths relative to this script so it runs from anywhere.
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
API_DIR="$REPO/src/SpaceLinx.Api"
COMPOSE=(docker compose -f "$HERE/docker-compose.yml")

# Local connection (matches docker-compose.yml). Host port defaults to 5433; override with
# SPACELINX_DB_PORT if that port is taken by another container.
PGUSER=spacelinx; PGDB=spacelinx; PGPASS=spacelinx
PGPORT="${SPACELINX_DB_PORT:-5433}"
export SPACELINX_DB_PORT="$PGPORT"   # ensure docker compose binds the same port
CONN="Host=localhost;Port=$PGPORT;Database=$PGDB;Username=$PGUSER;Password=$PGPASS"

echo "==> [1/5] Starting Postgres 16 container..."
"${COMPOSE[@]}" up -d

echo "==> [2/5] Waiting for Postgres to accept connections..."
for i in $(seq 1 40); do
  if "${COMPOSE[@]}" exec -T db pg_isready -U "$PGUSER" -d "$PGDB" >/dev/null 2>&1; then break; fi
  [ "$i" = 40 ] && { echo "ERROR: Postgres did not become ready in time" >&2; exit 1; }
  sleep 1
done

# Run a .sql file (piped on stdin) inside the container — no host psql needed.
psql_file() {
  "${COMPOSE[@]}" exec -T -e PGPASSWORD="$PGPASS" db \
    psql -U "$PGUSER" -d "$PGDB" -v ON_ERROR_STOP=1 \
    -v app_role=spacelinxuser -v read_role=spacelinx_audit_ro "$@"
}

echo "==> [3/5] Applying EF Core migrations (schema)..."
( cd "$API_DIR" \
  && dotnet tool restore \
  && dotnet ef database update \
       --project SpaceLinx.Model \
       --startup-project SpaceLinx.Api \
       --connection "$CONN" )

echo "==> [4/5] Applying procedures, then (re)creating views..."
for f in $(awk '/^- [0-9]/{print $2}' "$REPO/database/procedures/00_manifest.md"); do
  echo "    proc: $f"; psql_file < "$REPO/database/procedures/$f"
done
for f in $(awk '/^- [0-9]/{print $2}' "$REPO/database/repeatable/views/00_manifest.md"); do
  echo "    view: $f"; psql_file < "$REPO/database/repeatable/views/$f"
done

echo "==> [5/5] Seeding reference data (idempotent)..."
for f in 00_default_privileges.sql 10_reference_data.sql 12_currency_payment_department.sql; do
  echo "    seed: $f"; psql_file < "$REPO/database/seed/$f"
done
if [ -n "$ADMIN_EMAIL" ]; then
  echo "    seed: 20_bootstrap_admin.sql (admin_email=$ADMIN_EMAIL)"
  psql_file -v admin_email="$ADMIN_EMAIL" < "$REPO/database/seed/20_bootstrap_admin.sql"
else
  echo "    (skipping bootstrap admin — pass an email as the first arg to create one)"
fi

cat <<EOF

✅ Local SpaceLinx database is ready (Postgres 16 on localhost:$PGPORT).

   Point the API at it (run once, from $API_DIR/SpaceLinx.Api):
     dotnet user-secrets set "PostgreSql:ConnectionString" "$CONN"

   Run the API:   dotnet run --project SpaceLinx.Api
   Stop the DB:   docker compose -f database/local/docker-compose.yml stop
   Reset the DB:  database/local/reset-local-db.sh   (wipes all local data)
EOF
