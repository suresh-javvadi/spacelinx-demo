# SpaceLinx

Manufacturing Execution System & Product Lifecycle Management platform.

## Structure

```
src/
  SpaceLinx.Api/          .NET 10 REST API
  spacelinx-mes/          React 18 Frontend (Vite)
database/
  SpaceLinx/              PostgreSQL SSDT project
  migrations/             Database migration scripts
```

## Getting Started

See [CLAUDE.md](CLAUDE.md) for full development setup, architecture, and conventions.

## Environments

| Environment | API | Frontend |
|-------------|-----|----------|
| Dev | spacelinxapidev.azurewebsites.net | spacelinxmesdev.azurewebsites.net |
| UAT | spacelinxapiuat.azurewebsites.net | spacelinxmesuat.azurewebsites.net |
| Prod | spacelinxapiprod.azurewebsites.net | spacelinxmesprod.azurewebsites.net |
