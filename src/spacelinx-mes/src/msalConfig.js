import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: "748aa650-05ea-49d6-9c2f-aa0c83d2a024",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "/",
    postLogoutRedirectUri: "/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
      },
    },
  },
});

export default msalInstance;
