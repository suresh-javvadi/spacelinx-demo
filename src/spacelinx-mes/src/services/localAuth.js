/**
 * Email + password sign-in against the SpaceLinx API.
 *
 * The token issued by /api/auth/login is a normal bearer token and is stored in
 * localStorage alongside MSAL's own cache. api.js prefers this token when present,
 * which is what makes the two sign-in methods interchangeable.
 */

const TOKEN_KEY = "spacelinx.localAuth.token";
const EXPIRY_KEY = "spacelinx.localAuth.expiresAt";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api/";

const url = (path) => `${apiBaseUrl.replace(/\/$/, "")}/${path}`;

/** The stored token, or null when absent or already expired. */
export const getLocalToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(EXPIRY_KEY);

  if (!token) return null;

  // Treat an expired token as absent so callers fall back to signing in again
  // rather than sending a request that is guaranteed to 401.
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    clearLocalToken();
    return null;
  }

  return token;
};

export const isLocalSession = () => getLocalToken() !== null;

/**
 * Email of the password-signed-in user, read from the token's "preferred_username"
 * claim — the same claim Azure AD tokens use, so callers can treat both the same.
 * Returns null when there is no local session.
 */
export const getLocalUserEmail = () => {
  const token = getLocalToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.preferred_username || payload.email || null;
  } catch (err) {
    console.error("Could not read the local auth token", err);
    return null;
  }
};

export const clearLocalToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
};

/**
 * Signs in with email and password.
 * Resolves to { ok: true, mustChangePassword } or { ok: false, error }.
 */
export const loginWithPassword = async (email, password) => {
  const response = await fetch(url("auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return { ok: false, error: body.error || "Unable to sign in. Please try again." };
  }

  localStorage.setItem(TOKEN_KEY, body.token);
  if (body.expiresAt) {
    localStorage.setItem(EXPIRY_KEY, body.expiresAt);
  }

  return { ok: true, mustChangePassword: Boolean(body.mustChangePassword) };
};

export const requestPasswordReset = async (email) => {
  const response = await fetch(url("auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  // The API intentionally returns the same response whether or not the address
  // exists, so there is nothing to distinguish here.
  return response.ok;
};

export const resetPassword = async (email, token, newPassword) => {
  const response = await fetch(url("auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token, newPassword }),
  });

  const body = await response.json().catch(() => ({}));

  return response.ok
    ? { ok: true }
    : { ok: false, error: body.error || "Unable to reset password." };
};

export const changePassword = async (currentPassword, newPassword) => {
  const token = getLocalToken();

  const response = await fetch(url("auth/change-password"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "SPACELINX-APP-NAME": import.meta.env.VITE_APP_NAME || "SPACELINX",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const body = await response.json().catch(() => ({}));

  return response.ok
    ? { ok: true }
    : { ok: false, error: body.error || "Unable to change password." };
};
