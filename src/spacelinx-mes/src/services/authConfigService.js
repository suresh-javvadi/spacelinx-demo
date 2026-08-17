/**
 * Which sign-in methods this deployment offers.
 *
 * Fetched at runtime from /api/auth/config so one frontend build can serve every
 * deployment — a client with Microsoft sign-in, one with password sign-in, or one
 * with both — without rebuilding.
 */

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api/";

// If the API cannot be reached we assume Microsoft-only, which is how every
// existing deployment behaves.
const FALLBACK = {
  microsoftEnabled: true,
  passwordEnabled: false,
  minPasswordLength: 8,
};

let cached = null;
let inFlight = null;

export const getAuthConfig = async () => {
  if (cached) return cached;

  // Collapse concurrent callers onto a single request.
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl.replace(/\/$/, "")}/auth/config`
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      cached = await response.json();
      return cached;
    } catch (err) {
      console.error("Could not load auth configuration, assuming Microsoft only", err);
      cached = FALLBACK;
      return cached;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
};

export const resetAuthConfigCache = () => {
  cached = null;
};
