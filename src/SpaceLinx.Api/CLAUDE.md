# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Run Commands

```bash
# Build the solution
dotnet build SpaceLinx.Api.sln

# Run the API (from root directory)
dotnet run --project SpaceLinx.Api/SpaceLinx.Api.csproj

# Run with specific configuration
dotnet run --project SpaceLinx.Api/SpaceLinx.Api.csproj --configuration Release

# Add EF Core migration
dotnet ef migrations add <MigrationName> --project SpaceLinx.Api/SpaceLinx.Api.csproj

# Apply migrations
dotnet ef database update --project SpaceLinx.Api/SpaceLinx.Api.csproj
```

## Architecture Overview

This is an ASP.NET Core 9.0 REST API for PLM (Product Lifecycle Management) with PostgreSQL database.

### Project Structure

**SpaceLinx.Api** - Main API project containing:
- `Controllers/` - 81 REST controllers (most inherit from `GenericRestController`)
- `Services/` - 21 business logic services (all inherit from `BaseService`)
- `Interfaces/` - Service contracts
- `BackgroundServices/` - Hosted services for async tasks (BOM cache refresh, email queue)
- `Configuration/` - DI setup, auth configuration, options classes

**SpaceLinx.Model** - Shared models and database layer:
- `{Entity}/` - 83 entity folders, each containing:
  - `{Entity}.cs` - EF Core entity (inherits `BaseModel`)
  - `{Entity}WriteModel.cs` - Create DTO
  - `{Entity}ReadModel.cs` - Response DTO
  - `{Entity}UpdateModel.cs` - Update DTO
  - `{Entity}RefModel.cs` - Lightweight lookup DTO
- `SpaceLinxContext.cs` - EF Core DbContext (scaffolded from PostgreSQL)
- `SpaceLinxAutoMapperProfile.cs` - AutoMapper entity-to-DTO mappings
- `SpaceLinxConstants.cs` - Constants, enums, and Include expressions for eager loading

### Key Patterns

**Generic REST Controller**: `GenericRestController<T, T1, T2, T3, T4>` provides standard CRUD:
- Type params: Entity, WriteModel, UpdateModel, ReadModel, RefModel
- Endpoints: GET, GET/{id}, POST, PUT/{id}, GET/Active, GET/Lookup, PUT/{id}/Activate
- Uses AutoMapper and AsNoTracking() for reads

**Base Classes**:
- `BaseController` - Provides `SpaceLinxContext`, `UserEmail`, `RoleId` from JWT/headers
- `BaseService` - Provides `UserEmail`, `UserRoleId` with role resolution logic
- `BaseModel` - Audit fields: Id, CreatedBy/At, UpdatedBy/At, DeletedBy/At (soft delete)

**DTO Pattern**: Separate models for API contracts vs database entities. Write/Update models use data annotations for validation.

### Key Services

- `BomService` - Builds BOM hierarchies with Redis caching
- `EcoService` - Engineering Change Order workflow management
- `PartService` - Part versioning and clone functionality
- `EmailService` - Office365 SMTP with async queue
- `CacheService` - Redis with in-memory fallback

### Background Services

- `BomCacheRefreshHostedService` - Scheduled BOM cache refresh (configurable cron)
- `QueuedHostedService` - Processes background task queue for async operations

### Configuration

Key sections in `appsettings.json`:
- `AzureAd` - JWT Bearer authentication (Azure AD)
- `PostgreSql` - Connection string and pool size
- `Redis` - Cache connection and BOM expiration hours
- `Smtp` - Office365 email configuration
- `BomCacheRefresh` - Scheduled refresh settings (cron, batch size, concurrency)
- `AzureBlobStorage` - File storage for documents/images
- `Jira` - Optional Jira integration

### Database Conventions

- All entities use soft delete (DeletedBy/DeletedAt populated on delete)
- Audit trail on all entities (CreatedBy/At, UpdatedBy/At)
- Database views prefixed with `Vw` (e.g., `EcoWithUsersVw`) for denormalized queries
- Include expressions defined in `SpaceLinxConstants.cs` for eager loading related data

### Authentication

- Azure AD JWT Bearer tokens
- User email extracted from JWT claims
- RoleId passed via request header for role-switching capability
- Custom `[SpaceLinxAuthroize]` attribute for role-based filtering
