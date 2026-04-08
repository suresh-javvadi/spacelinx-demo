import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App.jsx";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import { EventType } from "@azure/msal-browser";
import { BrowserRouter } from "react-router-dom";
import msalInstance from "./msalConfig";
import { AlertsContextProvider } from "./features/AlertsContext/Context.jsx";
import { ProductContextProvider } from "./features/products/prodcutContext.jsx";
import { MsalProvider } from "@azure/msal-react";
import { UserContextProvider } from "./features/userContext/UserContext.jsx";
import { DrawerProvider } from "../src/DrawerContext";

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS) {
    msalInstance.setActiveAccount(event.payload.account);
  }
});
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <MsalProvider instance={msalInstance}>
          <UserContextProvider>
            <AlertsContextProvider>
              <ProductContextProvider>
                <DrawerProvider>
                  <App msalInstance={msalInstance} />
                </DrawerProvider>
              </ProductContextProvider>
            </AlertsContextProvider>
          </UserContextProvider>
        </MsalProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
reportWebVitals();
