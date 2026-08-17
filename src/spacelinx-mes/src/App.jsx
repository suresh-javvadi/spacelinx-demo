import React, { useState, useEffect, createContext, useMemo } from "react";
import PropTypes from "prop-types";
import { MsalProvider } from "@azure/msal-react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import UnAuthorizedUser from "./Components/Content/UnAuthorizedUser";
import "./App.css";
import GetTheme from "./Theme";
import Cliploader from "./Components/Loaders/Cliploader";
import { useUserContext } from "./features/userContext/UserContext";
import { retryPendingRequest } from "../src/services/api.js";
import { EventType } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { useNavigate, useLocation } from "react-router-dom";
import AppShell from "./AppShell.jsx";
import LoginPage from "./Components/Auth/LoginPage.jsx";
import ResetPasswordPage from "./Components/Auth/ResetPasswordPage.jsx";
import ChangePasswordPage from "./Components/Auth/ChangePasswordPage.jsx";
import { isLocalSession } from "./services/localAuth.js";
import { getAuthConfig } from "./services/authConfigService.js";

export const ThemeContext = createContext(null);

function App({ msalInstance }) {
  const { isUserActive, userAuthenticated, loadingRoles } = useUserContext();
  const { accounts } = useMsal();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState(null);

  // The explicit login screen only applies where password sign-in is enabled.
  // Microsoft-only deployments keep their existing behaviour: no session simply
  // means the API 401s and the interceptor bounces the user to Microsoft.
  const hasSession = accounts.length > 0 || isLocalSession();
  const showLogin = Boolean(authConfig?.passwordEnabled) && !hasSession;

  useEffect(() => {
    let active = true;
    getAuthConfig().then((cfg) => {
      if (active) setAuthConfig(cfg);
    });
    return () => {
      active = false;
    };
  }, []);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("MESAppTheme") || "dark";
  });

  // ✅ Handle redirect login & retry pending request
  useEffect(() => {
    const callbackId = msalInstance.addEventCallback(async (event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS) {
        console.log("Login successful!", event.payload.account);

        // ✅ Try replaying any saved failed API request
        const retriedData = await retryPendingRequest();
        if (retriedData) {
          console.log("Pending request retried successfully:", retriedData);
          // 🔔 Optionally show a toast/snackbar here
        }
      }
    });

    // Cleanup event callback on unmount
    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, []);

  // Remove artificial delay - set loading to false immediately
  useEffect(() => {
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    setTheme((curr) => {
      const newTheme = curr === "light" ? "dark" : "light";
      localStorage.setItem("MESAppTheme", newTheme);
      return newTheme;
    });
  };

  const muiTheme = useMemo(() => GetTheme(theme), [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("AppTheme", theme);
  }, [theme]);

  return (
    <MsalProvider instance={msalInstance}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <div className="App" id={theme}>
            {/* Reset-password links are followed while signed out, so this route is
                checked before any session or role loading. */}
            {location.pathname === "/reset-password" ? (
              <ResetPasswordPage />
            ) : loading || loadingRoles ? (
              <Cliploader loading={true} />
            ) : showLogin ? (
              <LoginPage />
            ) : location.pathname === "/change-password" && hasSession ? (
              <ChangePasswordPage />
            ) : !isUserActive || !userAuthenticated ? (
              <UnAuthorizedUser />
            ) : (
              <React.Fragment>
                <AppShell />
              </React.Fragment>
            )}
          </div>
        </ThemeProvider>
      </ThemeContext.Provider>
    </MsalProvider>
  );
}

App.propTypes = {
  msalInstance: PropTypes.object.isRequired,
};

export default App;
