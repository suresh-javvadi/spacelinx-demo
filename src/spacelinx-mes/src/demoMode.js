// DEMO ONLY. When VITE_DEMO_MODE === "true" the app skips Microsoft (MSAL) login
// entirely and runs as a single fixed user (VITE_DEMO_EMAIL). That email must match
// a seeded Super Admin user on the API side (database/seed/20_bootstrap_admin.sql)
// and the API must run with Auth:Demo:Enabled=true. Never ship this enabled to prod.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export const DEMO_EMAIL =
  import.meta.env.VITE_DEMO_EMAIL || "demo@spacelinx.dev";
