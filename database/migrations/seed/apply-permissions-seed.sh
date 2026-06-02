#!/usr/bin/env bash
#
# apply-permissions-seed.sh — gated runner for the SpaceLinx permission seed (T1.2).
#
# Flow:  assert hardened seed -> connectivity -> read-only pre-flight ->
#        transactional DRY RUN (ROLLBACK, persists nothing) -> confirm -> APPLY -> verify.
#
# Connection comes from standard libpq env vars — NO secrets live in this file.
#   Required:  PGHOST  PGDATABASE  PGUSER   + a password via PGPASSFILE or PGPASSWORD
#   Strongly recommended for Azure Postgres:  PGSSLMODE=require
#
# Usage (prod example — do NOT paste the password on the command line):
#   export PGHOST=spacelinxprod.postgres.database.azure.com PGPORT=5432 \
#          PGDATABASE=spacelinx PGUSER=<prod-user> PGSSLMODE=require
#   printf 'prod DB password: '; read -rs PGPASSWORD; echo; export PGPASSWORD   # works in bash & zsh
#   ./database/migrations/seed/apply-permissions-seed.sh            # interactive (prompts before APPLY)
#   ./database/migrations/seed/apply-permissions-seed.sh --dry-run  # stop after the ROLLBACK dry-run
#   ./database/migrations/seed/apply-permissions-seed.sh --yes      # skip the confirm prompt (CI)
#
# The seed itself is idempotent and safe to re-run.
set -euo pipefail

SEED_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED="$SEED_DIR/permissions.seed.sql"
MODE="interactive"   # interactive | dry-run | yes
case "${1:-}" in
  --dry-run) MODE="dry-run" ;;
  --yes)     MODE="yes" ;;
  "")        ;;
  *) echo "Unknown arg: $1 (use --dry-run or --yes)" >&2; exit 2 ;;
esac

red()  { printf '\033[31m%s\033[0m\n' "$*"; }
grn()  { printf '\033[32m%s\033[0m\n' "$*"; }
bold() { printf '\033[1m%s\033[0m\n' "$*"; }

# --- 0. preconditions -------------------------------------------------------
# Homebrew's libpq is keg-only (psql not on PATH by default) — try to locate it.
if ! command -v psql >/dev/null 2>&1; then
  for d in "$(brew --prefix libpq 2>/dev/null)/bin" /opt/homebrew/opt/libpq/bin /usr/local/opt/libpq/bin; do
    if [ -x "$d/psql" ]; then PATH="$d:$PATH"; break; fi
  done
fi
command -v psql >/dev/null 2>&1 || {
  red "psql not found. Install a Postgres client (e.g. 'brew install libpq') or add it to PATH:"
  red "  export PATH=\"\$(brew --prefix libpq)/bin:\$PATH\""
  exit 1
}
[ -f "$SEED" ] || { red "Seed file not found: $SEED"; exit 1; }
: "${PGHOST:?set PGHOST}"; : "${PGDATABASE:?set PGDATABASE}"; : "${PGUSER:?set PGUSER}"
if [ -z "${PGPASSFILE:-}" ] && [ -z "${PGPASSWORD:-}" ]; then
  red "No password set. Export PGPASSWORD (via: read -rs PGPASSWORD; export PGPASSWORD) or PGPASSFILE."; exit 1
fi

# Refuse to run the OLD unguarded seed: prod almost certainly has roles holding
# BOTH VENDORS.DOC.DELETE and VENDORS.DOCUMENTS.DELETE, which the unguarded
# rename would hit against UNIQUE(role_id,permission,deleted_at) and roll back.
if ! grep -q "NOT EXISTS" "$SEED"; then
  red "Refusing to run: seed is the UNGUARDED version (missing the VENDORS.DOC.DELETE collision guard)."
  red "Use the hardened seed (PR #4198 / branch fix/seed-collision-guard) before seeding prod."
  exit 1
fi

PSQL=(psql -v ON_ERROR_STOP=1 -X)

bold "Target: $PGUSER@$PGHOST/$PGDATABASE   (seed: $SEED)"

# --- 1. connectivity --------------------------------------------------------
bold "[1/5] Connectivity"
"${PSQL[@]}" -At -c "SELECT 'connected to '||current_database()||' as '||current_user||' on '||version();"

# --- 2. read-only pre-flight ------------------------------------------------
bold "[2/5] Pre-flight (read-only)"
"${PSQL[@]}" <<'SQL'
SELECT count(*) AS perms_total,
       count(*) FILTER (WHERE deleted_at IS NULL) AS perms_active
  FROM application.permission;
\echo '-- typo grants active / roles holding BOTH typo and canonical (guard handles these) --'
SELECT 'typo_grants_active' AS k, count(*) AS n FROM application.role_permission
 WHERE permission='VENDORS.DOC.DELETE' AND deleted_at IS NULL
UNION ALL
SELECT 'collision_roles', count(*) FROM application.role_permission rp
 WHERE rp.permission='VENDORS.DOC.DELETE' AND rp.deleted_at IS NULL
   AND EXISTS (SELECT 1 FROM application.role_permission x WHERE x.role_id=rp.role_id
                AND x.permission='VENDORS.DOCUMENTS.DELETE' AND x.deleted_at IS NULL);
SQL

# --- 3. dry run (transactional, ROLLBACK) -----------------------------------
bold "[3/5] DRY RUN — runs the seed in a transaction and ROLLS BACK (nothing persisted)"
DRY="$(mktemp -t slx_seed_dry.XXXXXX).sql"
trap 'rm -f "$DRY"' EXIT
sed 's/^COMMIT;$/ROLLBACK;/' "$SEED" > "$DRY"
grep -q '^ROLLBACK;$' "$DRY" || { red "Could not build dry-run (no COMMIT; found to swap)."; exit 1; }
grn "Command tags below show rows that WOULD change (INSERT n = new perms, UPDATE n = grant/def changes):"
"${PSQL[@]}" -f "$DRY"

[ "$MODE" = "dry-run" ] && { grn "Dry run complete (--dry-run). Nothing applied."; exit 0; }

# --- 4. confirm + apply -----------------------------------------------------
if [ "$MODE" != "yes" ]; then
  bold "[4/5] APPLY to $PGDATABASE on $PGHOST?"
  printf "Type the database name ('%s') to proceed: " "$PGDATABASE"; read -r CONFIRM
  [ "$CONFIRM" = "$PGDATABASE" ] || { red "Confirmation mismatch — aborted. Nothing applied."; exit 1; }
fi
bold "[4/5] Applying seed…"
"${PSQL[@]}" -f "$SEED"
grn "Applied."

# --- 5. verify --------------------------------------------------------------
bold "[5/5] Verify"
"${PSQL[@]}" <<'SQL'
SELECT count(*) FILTER (WHERE deleted_at IS NULL) AS perms_active,
       count(*) FILTER (WHERE deleted_at IS NOT NULL) AS perms_soft_deleted
  FROM application.permission;
\echo '-- typo retired (expect is_active=f), canonical active --'
SELECT name, is_active FROM application.permission
 WHERE name IN ('VENDORS.DOC.DELETE','VENDORS.DOCUMENTS.DELETE') ORDER BY name;
\echo '-- no active typo grants should remain --'
SELECT count(*) AS typo_grants_remaining FROM application.role_permission
 WHERE permission='VENDORS.DOC.DELETE' AND deleted_at IS NULL;
SQL
grn "Done."
