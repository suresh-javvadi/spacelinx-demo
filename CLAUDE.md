# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Overview

SpaceLinx is an Enterprise Manufacturing Execution System (MES) and Product Lifecycle Management (PLM) platform. This is a mono-repo containing three layers:

| Layer | Path | Tech |
|-------|------|------|
| **API** | `src/SpaceLinx.Api/` | ASP.NET Core 10, EF Core 10, PostgreSQL |
| **Frontend** | `src/spacelinx-mes/` | React 18, Vite 5, MUI v5, Ant Design |
| **Database** | `database/` | PostgreSQL (SSDT project + SQL migrations) |

Each layer has its own `CLAUDE.md` with detailed documentation.

## Quick Start

### API
```bash
cd src/SpaceLinx.Api
dotnet build SpaceLinx.Api.sln
dotnet run --project SpaceLinx.Api/SpaceLinx.Api.csproj
```

### Frontend
```bash
cd src/spacelinx-mes
npm install
npm run dev          # Development server at localhost:5173
npm run build        # Production build
npm run lint         # ESLint (zero warnings tolerance)
```

## Architecture

```
Frontend (React 18 + Vite)
  │  Auth: Azure AD (MSAL) │ State: Redux │ UI: MUI + Ant Design
  │
  │  REST API (HTTPS)
  ▼
API (ASP.NET Core 10)
  │  Auth: JWT Bearer │ ORM: EF Core 10 │ Cache: Redis
  │
  │  EF Core
  ▼
PostgreSQL
  Schemas: mes, sc, application, common, pm, vm, dap, imagery
  Patterns: UUID PKs, soft delete, audit trails
```

## Branch Strategy

- `main` — protected, always deployable, auto-deploys to Dev
- `release/v*` — temporary release branches, auto-deploy to UAT
- `v*` tags — deployed to Prod with manual approval gate
- `feature/<work-item-id>-desc` — short-lived, squash-merged to main
- `bugfix/<work-item-id>-desc` — short-lived, squash-merged to main

## CI/CD Pipeline

Defined in `azure-pipelines.yml`:
- **Build**: .NET 10 API + React frontend
- **Dev**: auto on `main` merge
- **UAT**: auto on `release/v*` branch
- **Prod**: on `v*` tag with manual approval

## Key Patterns

### API
- Controllers inherit `GenericRestController<T, T1, T2, T3, T4>` for CRUD
- DTOs: `WriteModel`, `ReadModel`, `UpdateModel`, `RefModel` per entity
- Auth: `[SpaceLinxAuthroize]` attribute for role-based filtering
- Soft delete: `DeletedBy`/`DeletedAt` on `BaseModel`

### Frontend
- Services: `src/services/{entity}Service.js` wrapping axios
- Permissions: `ENTITY.ACTION` format via `hasPermission()` in `UserContext`
- Routes: React Router v6 with `renderProtectedComponent()` in `Content.jsx`
- Headers: `SPACELINX-TENANT-ID` and `SPACELINX-APP-NAME` on all API requests

### Database
- Migrations handled offline via SQL scripts, NOT EF Core migration tooling
- SSDT project in `database/SpaceLinx/` for schema definitions

## Environment Variables

### Frontend (Vite)
- `VITE_API_BASE_URL` — Backend API URL
- `VITE_MSAL_CLIENT_ID` — Azure AD client ID
- `VITE_MSAL_TENANT_ID` — Tenant identifier
- `VITE_APP_NAME` — Application name (SPACELINX)

### API (appsettings.json)
- `PostgreSql:ConnectionString` — Database connection
- `Redis:ConnectionString` — Redis cache
- `AzureAd` — JWT authentication config
- `BlobStorage:ConnectionString` — Azure Blob Storage

## Environments

| Environment | API | Frontend |
|-------------|-----|----------|
| Dev | spacelinxapidev.azurewebsites.net | spacelinxmesdev.azurewebsites.net |
| UAT | spacelinxapiuat.azurewebsites.net | spacelinxmesuat.azurewebsites.net |
| Prod | spacelinxapiprod.azurewebsites.net | spacelinxmesprod.azurewebsites.net |
