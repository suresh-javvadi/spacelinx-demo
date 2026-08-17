import { PublicClientApplication } from "@azure/msal-browser";

// Client id and authority come from the environment so each deployment can point at
// its own Azure AD app registration. The literals are the long-standing XDLinx values
// and are kept only as a fallback, so an existing build with no env vars set behaves
// exactly as it did before.
const clientId =
  import.meta.env.VITE_MSAL_CLIENT_ID || "748aa650-05ea-49d6-9c2f-aa0c83d2a024";

// A tenant-specific authority restricts sign-in to that one organisation.
// Without it we fall back to "common", which accepts any Microsoft tenant.
const tenantId = import.meta.env.VITE_MSAL_AUTHORITY_TENANT_ID;
const authority = tenantId
  ? `https://login.microsoftonline.com/${tenantId}`
  : "https://login.microsoftonline.com/common";

const msalInstance = new PublicClientApplication({
  auth: {
    clientId,
    authority,
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
