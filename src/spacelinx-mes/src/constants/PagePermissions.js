// Single source of truth for permissions is the catalog:
//   tools/permission-catalog/permissions.catalog.json
// which is code-generated into ./permissions.generated.ts (run:
//   node tools/permission-catalog/generate.mjs).
//
// This file is kept as a stable re-export so the ~99 existing
// `import { PERMISSIONS } from ".../PagePermissions"` call sites keep working.
// Do not hand-edit the permission list here — edit the catalog JSON and regenerate.
export { PERMISSIONS, ALL_PERMISSIONS } from "./permissions.generated";
