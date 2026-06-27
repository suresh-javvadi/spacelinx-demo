import React, { useState, useEffect, createContext, useMemo } from "react";
import PropTypes from "prop-types";
import { MsalProvider } from "@azure/msal-react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ConfigProvider } from "antd";
import UnAuthorizedUser from "./Components/Content/UnAuthorizedUser";
import "./App.css";
import GetTheme from "./Theme";
import BrandSplash from "./Components/Loaders/BrandSplash";
import { useUserContext } from "./features/userContext/UserContext";
import { retryPendingRequest } from "../src/services/api.js";
import { EventType } from "@azure/msal-browser";
import { useNavigate } from "react-router-dom";
import AppShell from "./AppShell.jsx";

export const ThemeContext = createContext(null);

function App({ msalInstance }) {
  const { isUserActive, userAuthenticated, loadingRoles } = useUserContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#6366F1",
                colorLink: "#6366F1",
                colorInfo: "#6366F1",
              },
            }}
          >
            <CssBaseline />
            <div className="App" id={theme}>
              {loading || loadingRoles ? (
                <BrandSplash />
              ) : !isUserActive || !userAuthenticated ? (
                <UnAuthorizedUser />
              ) : (
                <React.Fragment>
                  <AppShell />
                </React.Fragment>
              )}
            </div>
          </ConfigProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </MsalProvider>
  );
}

App.propTypes = {
  msalInstance: PropTypes.object.isRequired,
};

export default App;
