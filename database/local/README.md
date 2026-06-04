# Local development database

A one-command, throwaway **PostgreSQL 16** for local development and testing. It is built
from the **same EF Core migrations + procedures + views + seed** that the CI pipeline applies
to Dev/UAT/Prod (`azure-pipelines.db-migrate.yml`), so your local schema is faithful to the
real environments — no manual scaffolding, no drift.

## Prerequisites
- Docker Desktop running
- .NET 10 SDK (the `dotnet-ef` 10.0.5 local tool is restored automatically)

## Quick start

```bash
# from the repo root
database/local/setup-local-db.sh                 # schema + reference data
database/local/setup-local-db.sh you@tenant.com  # also bootstrap you as Super Admin
```

This brings up Postgres 16 on **localhost:5433** (5433 to avoid clashing with any system
Postgres on 5432) and applies, in CI order:

1. **EF migrations** — `dotnet ef database update` (the schema: tables, the partitioned
   tamper-resistant `audit.change_log`, indexes, constraints).
2. **Procedures** — `database/procedures/` in manifest order.
3. **Views** — `database/repeatable/views/` in manifest order.
4. **Seed** — idempotent reference data (`database/seed/`), optionally a bootstrap admin.

## Point the API at it

The API reads `PostgreSql:ConnectionString` (see `ConfigureServices.cs`). Set it once via
user-secrets so it never lands in the repo:

```bash
cd src/SpaceLinx.Api/SpaceLinx.Api
dotnet user-secrets set "PostgreSql:ConnectionString" \
  "Host=localhost;Port=5433;Database=spacelinx;Username=spacelinx;Password=spacelinx"
dotnet run --project SpaceLinx.Api
```

> Running the full API also needs dev values for `Redis`, `BlobStorage`, and Azure AD in
> user-secrets. The database itself is fully functional without them — useful for running
> migrations, EF queries, and integration tests against a real Postgres.

## Everyday commands

| Action | Command |
|--------|---------|
| Start / apply (idempotent, re-runnable) | `database/local/setup-local-db.sh` |
| Stop (keep data) | `docker compose -f database/local/docker-compose.yml stop` |
| Reset (wipe + rebuild) | `database/local/reset-local-db.sh` |
| Open a psql shell | `docker compose -f database/local/docker-compose.yml exec db psql -U spacelinx -d spacelinx` |

## After you add a migration

`dotnet ef migrations add <Name>` then re-run `setup-local-db.sh` — `database update` applies
only the new migration. The local DB always reflects the current model, exactly as the
pipeline will apply it upstream.

## Notes
- **Local-only credentials** (`spacelinx`/`spacelinx`) — never used outside Docker.
- The group roles the schema/seed reference (`spacelinxadmin`, `spacelinxuser`,
  `spacelinx_audit_ro`) are created at container init (`init/00-roles.sql`).
- This is **not** production. It is a disposable mirror for development and CI-equivalent
  local testing.
