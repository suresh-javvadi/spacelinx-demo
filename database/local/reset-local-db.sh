#!/usr/bin/env bash
# Tear down the local SpaceLinx database and its data volume, then rebuild from scratch.
# Any optional arg (admin email) is forwarded to setup-local-db.sh.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "==> Removing local database container + data volume (all local data lost)..."
docker compose -f "$HERE/docker-compose.yml" down -v
echo "==> Rebuilding from scratch..."
exec "$HERE/setup-local-db.sh" "$@"
