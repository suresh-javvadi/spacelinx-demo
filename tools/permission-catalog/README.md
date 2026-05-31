# Permission Catalog — single source of truth

`permissions.catalog.json` is the **one** definition of every SpaceLinx authorization
permission. Backend C# constants, frontend TS constants, and the DB seed are all
**generated** from it, so the client, server, and database can never drift again.

## Files
| File | Role |
|------|------|
| `permissions.catalog.json` | **Source of truth.** Edit this. |
| `generate.mjs` | Code generator (Node, zero deps). |
| **outputs** (do not hand-edit): | |
| `src/SpaceLinx.Api/SpaceLinx.Api/Security/Permissions.Generated.cs` | C# `Permissions.*` constants for `[RequirePermission(...)]` |
| `src/spacelinx-mes/src/constants/permissions.generated.ts` | TS `PERMISSIONS` object + `PermissionKey` union |
| `database/migrations/seed/permissions.seed.sql` | Idempotent seed (`ON CONFLICT DO NOTHING`) + legacy alias fix |

`src/spacelinx-mes/src/constants/PagePermissions.js` re-exports the generated TS so the
~99 existing import sites keep working.

## Workflow
1. Add/edit/remove an entry in `permissions.catalog.json` (`key`, `category`, `description`).
2. Regenerate:
   ```bash
   node tools/permission-catalog/generate.mjs
   ```
3. Commit the catalog **and** the regenerated outputs together.
4. Apply the seed to each environment (review first — see task **T1.2**):
   ```bash
   psql "$CONN" -f database/migrations/seed/permissions.seed.sql
   ```

## Catalog entry shape
```json
{
  "key": "PARTS.MODIFY",          // the permission string (UPPER.DOTTED)
  "category": "PARTS",            // derived from key prefix; used for grouping
  "description": "Modify parts.", // shown in the role-permission admin UI
  "inFrontend": true,             // provenance flags (informational)
  "inDb": true,
  "assigned": true                // was granted to ≥1 role in UAT at capture time
}
```

## CI guard (recommended — task T1.1 follow-up)
Run `generate.mjs` in CI and fail if `git diff` is non-empty, so generated files can
never go stale relative to the catalog.

## Provenance
Initial catalog built 2026-05-30 by merging UAT `application.permission` (164 rows,
canonical) with frontend `PagePermissions.js` (249 keys). 86 keys exist only in the
frontend and are seeded by `permissions.seed.sql`. The legacy typo `VENDORS.DOC.DELETE`
is migrated to `VENDORS.DOCUMENTS.DELETE`.
