import axios from "axios";
import msalInstance from "../msalConfig";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const appName = import.meta.env.VITE_APP_NAME;
const tenantId = import.meta.env.VITE_MSAL_TENANT_ID;

const EXPIRATION_BUFFER = 60 * 1000; // 1 min buffer

// --- Pending Request Handling ---
const PENDING_REQUEST_KEY = "pendingRequest";

// Store a failed request before logout
const savePendingRequest = (request) => {
  try {
    localStorage.setItem(
      PENDING_REQUEST_KEY,
      JSON.stringify({
        url: request.url,
        method: request.method,
        data: request.data,
        headers: request.headers,
      })
    );
  } catch (err) {
    console.error("Failed to save pending request", err);
  }
};

// Retry the stored pending request after login
export const retryPendingRequest = async () => {
  const pending = localStorage.getItem(PENDING_REQUEST_KEY);
  if (!pending) return null;

  try {
    const req = JSON.parse(pending);
    localStorage.removeItem(PENDING_REQUEST_KEY);

    console.info("Retrying pending request after login:", req.url);
    const response = await api({
      url: req.url,
      method: req.method,
      data: req.data,
      headers: req.headers,
    });

    return response.data;
  } catch (err) {
    console.error("Retrying pending request failed", err);
    return null;
  }
};

// --- Token Helpers ---
const getTokenExpiration = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload).exp * 1000;
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

const checkTokenExpiration = (token) => {
  if (!token) return { isExpired: true, timeLeft: 0 };

  const expiration = getTokenExpiration(token);
  if (!expiration) return { isExpired: true, timeLeft: 0 };

  const now = Date.now();
  const timeLeft = expiration - now - EXPIRATION_BUFFER;
  return { isExpired: timeLeft <= 0, timeLeft };
};

let isRefreshing = false;
let backgroundRefreshInProgress = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const fetchMsalToken = async (forceRefresh = false) => {
  try {
    const account = msalInstance.getActiveAccount();
    if (!account) {
      console.warn("No active account, redirecting to login...");
      await msalInstance.loginRedirect({ scopes: ["user.read"] });
      return null;
    }

    const response = await msalInstance.acquireTokenSilent({
      scopes: ["user.read"],
      account,
      forceRefresh,
    });
    return response.idToken;
  } catch (error) {
    console.error("Silent token acquisition failed", error);

    if (forceRefresh) {
      try {
        const response = await msalInstance.acquireTokenPopup({
          scopes: ["user.read"],
        });
        return response.idToken;
      } catch (interactiveError) {
        console.error("Interactive token acquisition failed", interactiveError);
        return null;
      }
    }

    return null;
  }
};

const triggerBackgroundRefresh = async () => {
  if (backgroundRefreshInProgress) return;
  backgroundRefreshInProgress = true;
  try {
    await fetchMsalToken(true);
  } catch (err) {
    console.error("Background token refresh failed", err);
  } finally {
    backgroundRefreshInProgress = false;
  }
};

// --- Request Interceptor ---
api.interceptors.request.use(
  async (config) => {
    config.headers["SPACELINX-APP-NAME"] = appName;

    if (config.url && config.url.includes("UserUa/ua/checkuser")) {
      delete config.headers["Authorization"];
      return config;
    }

    const token = await fetchMsalToken();
    if (token) {
      const { isExpired, timeLeft } = checkTokenExpiration(token);

      if (isExpired) {
        console.warn("Token is expired, forcing refresh");
        const newToken = await fetchMsalToken(true);
        if (newToken) {
          config.headers["Authorization"] = `Bearer ${newToken}`;
        } else {
          console.error(
            "Failed to refresh expired token — saving request & logging out"
          );
          savePendingRequest(config);
          await forceReauthenticate();
        }
      } else {
        if (timeLeft < 5 * 60 * 1000) triggerBackgroundRefresh();
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      config.headers["SPACELINX-TENANT-ID"] = tenantId;
    } else {
      console.error("No token available — saving request & logging out");
      savePendingRequest(config);
      await forceReauthenticate();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Handling 401 error — token refresh needed");

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await fetchMsalToken(true);
        if (newToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          console.error(
            "Token refresh failed — saving failed request & logging out"
          );
          savePendingRequest(originalRequest);
          processQueue(new Error("Failed to refresh token"));
          await forceReauthenticate();
        }
      } catch (refreshError) {
        console.error("Token refresh process failed", refreshError);
        savePendingRequest(originalRequest);
        processQueue(refreshError);
        await forceReauthenticate();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const forceReauthenticate = async () => {
  try {
    // Clear MSAL cache to ensure fresh login
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      await msalInstance.clearCache();
    }
    // Redirect to login instead of logout page
    await msalInstance.loginRedirect({ scopes: ["user.read"] });
  } catch (error) {
    console.error("Reauthentication redirect failed", error);
  }
};

export default api;
