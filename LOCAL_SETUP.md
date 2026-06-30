# SpaceLinx — Local Setup & Run Guide

A practical, copy-paste guide to get the whole stack (Database → API → Frontend)
running on your own machine. Two paths are covered:

- **Path A — Demo / no-login** (fastest; what the public SARSPACE demo uses)
- **Path B — Full app with Azure AD login** (needs real secrets)

> Paths and commands assume the repo root is `d:\Working Repo\SpaceLinx`.

---

## 1. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **.NET SDK** | 10.x | For the API + EF Core migrations |
| **Node.js** | 18+ (LTS) | For the React/Vite frontend |
| **Docker Desktop** | latest | For the local PostgreSQL 16 container |
| **Git** | any | Source control |

Quick version checks:

```bash
dotnet --version
node --version
npm --version
docker --version
```

---

## 2. Database (local PostgreSQL in Docker)

The repo ships a one-command throwaway Postgres 16 built from the **same EF migrations +
procedures + views + seed** that CI applies to Dev/UAT/Prod — so your local schema matches
the real environments.

```bash
# from the repo root
database/local/setup-local-db.sh                 # schema + reference data
database/local/setup-local-db.sh you@tenant.com  # also bootstrap you as Super Admin
```

This starts Postgres on **localhost:5433** (5433 to avoid clashing with any system Postgres
on 5432) and applies, in order: EF migrations → procedures → views → seed.

**Connection string (local):**

```
Host=localhost;Port=5433;Database=spacelinx;Username=spacelinx;Password=spacelinx
```

Everyday DB commands:

| Action | Command |
|--------|---------|
| Start / re-apply (idempotent) | `database/local/setup-local-db.sh` |
| Stop (keep data) | `docker compose -f database/local/docker-compose.yml stop` |
| Reset (wipe + rebuild) | `database/local/reset-local-db.sh` |
| Open a psql shell | `docker compose -f database/local/docker-compose.yml exec db psql -U spacelinx -d spacelinx` |

> **Alternative:** you can also point the API at the hosted **Neon** demo DB instead of running
> Docker — just use the Neon connection string in the next step. (Keep that string private.)

---

## 3. API (ASP.NET Core 10)

The API reads its config from `appsettings.*.json` + **user-secrets** (so secrets never land
in the repo). The committed `appsettings.Development.json` leaves connection strings blank.

```bash
cd src/SpaceLinx.Api/SpaceLinx.Api

# 1) Tell the API where the DB is (one-time; stored outside the repo)
dotnet user-secrets set "PostgreSql:ConnectionString" "Host=localhost;Port=5433;Database=spacelinx;Username=spacelinx;Password=spacelinx"

# 2) (Path A only) turn on no-login demo mode
dotnet user-secrets set "DemoMode:Enabled" "true"

# 3) Run it
dotnet run --project SpaceLinx.Api
```

- API runs on **http://localhost:5197** → Swagger at **http://localhost:5197/swagger**
- CORS already allows `http://localhost:5173` (the Vite dev server) in
  `appsettings.Development.json`.

**Path B extras (full Azure AD login):** also set dev values in user-secrets for `Redis`,
`BlobStorage`, and the `AzureAd` section. The DB and most endpoints work fine without them —
they're only needed for caching, file uploads, and real authentication.

```bash
# Build / migration helpers
dotnet build SpaceLinx.Api.sln
dotnet ef migrations add <Name> --project SpaceLinx.Api/SpaceLinx.Api.csproj
dotnet ef database update --project SpaceLinx.Api/SpaceLinx.Api.csproj
```

---

## 4. Frontend (React 18 + Vite 5)

```bash
cd src/spacelinx-mes
npm install
npm run dev
```

- Dev server: **http://localhost:5173**

### How env files work (Vite)

Loaded in priority order — later overrides earlier:

| File | Committed? | Purpose |
|------|-----------|---------|
| `.env`, `.env.development` | ✅ yes | Shared team defaults |
| `.env.development.local`, `*.local` | ❌ gitignored | **Your personal/local overrides** (secrets, local API URL) |

`npm run dev` automatically picks up `.env.development.local`. The repo's local override already
points the frontend at the local API in demo mode:

```env
VITE_API_BASE_URL='http://localhost:5197/api/'
VITE_DEMO_MODE='true'
VITE_DEMO_EMAIL='demo@spacelinx.dev'
```

- **Path A (demo):** keep the `.local` file as-is → opens straight in as a Super Admin, no login.
- **Path B (Azure AD):** remove/rename the `.local` file (or set `VITE_DEMO_MODE='false'`) so the
  real MSAL login is used; the committed `.env.development` points at the Dev API.

### Build commands

```bash
npm run dev          # local dev server
npm run build        # production build
npm run build:dev    # build against Dev env
npm run build:demo   # build against demo env (.env.demo)
npm run build:uat    # build against UAT env
npm run lint         # ESLint (zero warnings tolerance)
npm run preview      # preview a production build locally
```

---

## 5. The fast path (TL;DR)

Three terminals from the repo root:

```bash
# Terminal 1 — database
database/local/setup-local-db.sh

# Terminal 2 — API (no-login demo)
cd src/SpaceLinx.Api/SpaceLinx.Api
dotnet user-secrets set "PostgreSql:ConnectionString" "Host=localhost;Port=5433;Database=spacelinx;Username=spacelinx;Password=spacelinx"
dotnet user-secrets set "DemoMode:Enabled" "true"
dotnet run --project SpaceLinx.Api

# Terminal 3 — frontend
cd src/spacelinx-mes
npm install
npm run dev
```

Open **http://localhost:5173** → you're in.

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Frontend loads but API calls fail | Confirm the API is on `:5197` and `VITE_API_BASE_URL` matches; check the browser Network tab. |
| CORS error in console | The origin must be in `Cors:AllowedOrigins` (Dev config already has `http://localhost:5173`). |
| `column ... does not exist` / stale view | Re-run `database/local/setup-local-db.sh` (or `reset-local-db.sh`) to re-apply migrations + views. |
| Port 5432 conflict | The local DB intentionally uses **5433**; nothing to change. |
| Vite build runs out of memory | Set `NODE_OPTIONS=--max-old-space-size=4096` before the build. |
| `dotnet ef` not found | Run `dotnet tool restore` in `src/SpaceLinx.Api` (restores the local `dotnet-ef` tool). |
| Login screen instead of demo | Ensure `.env.development.local` has `VITE_DEMO_MODE='true'` **and** the API has `DemoMode:Enabled=true`. |

---

## 7. Ports & URLs cheat-sheet

| Service | Local URL |
|---------|-----------|
| Frontend (Vite) | http://localhost:5173 |
| API | http://localhost:5197 |
| Swagger | http://localhost:5197/swagger |
| PostgreSQL | localhost:5433 (`spacelinx`/`spacelinx`) |

> ⚠️ **Never** enable `DemoMode` or commit real secrets/connection strings. Local DB
> credentials (`spacelinx`/`spacelinx`) are for Docker only.
