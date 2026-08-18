import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  UnauthenticatedTemplate,
  AuthenticatedTemplate,
} from "@azure/msal-react";
import UAHeader from "./Components/UnAuthenticatedFiles/UAHeader/Header";
import UAContent from "./Components/UnAuthenticatedFiles/UAContent/Content";
import { DeepLinkProvider, useDeepLink } from "./DeepLinkContext";
import { FeatureBitContextProvider } from "./features/adminuser/FeatureBit/FeatureBitContext";
import { PartDetailsDrawerProvider } from "./features/admin/parts/PartDetailsContext";
import { IssuesProvider } from "./features/issues/IssuesContext";
import Header from "./Components/Header/Header";
import Navbar from "./Components/NavBar/Navbar";
import Content from "./Components/Content/Content";
import { DEMO_MODE } from "./demoMode";
import { isLocalSession } from "./services/localAuth";

const DIRECT_DETAIL_BASE_PATHS = [
  "/procurement/purchaseorders",
  "/programmanagement/gantt",
  "/programmanagement/kanban",
];

const AuthenticatedApp = ({ location, navigate }) => {
  const { setDeepLink, deepLinkHandled, setDeepLinkHandled } = useDeepLink();

  useEffect(() => {
    if (deepLinkHandled) return;

    const segments = location.pathname.split("/").filter(Boolean);

    // Need at least /x/y/:id
    if (segments.length < 3) return;

    const id = segments.at(-1);
    const basePath = "/" + segments.slice(0, -1).join("/");

    // Basic sanity check for IDs (UUIDs, numbers, etc.)
    if (!id || id.length < 6) return;

    // 🔑 DIRECT navigation exception list
    if (DIRECT_DETAIL_BASE_PATHS.includes(basePath)) {
      // Direct detail page → DO NOTHING
      return;
    }

    // ✅ Default behavior: INTERCEPT
    setDeepLink({ basePath, id });
    setDeepLinkHandled(true);

    navigate(basePath, { replace: true });
  }, [location.pathname, deepLinkHandled]);

  return (
    <div>
      <Header />
      <div className="Body">
        <Navbar />
        <Content />
      </div>
    </div>
  );
};

const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // MSAL's templates key off an MSAL account, which only exists for Microsoft
  // sign-in. Demo mode and password sign-in both authenticate without one, so the
  // unauthenticated view would render even though the user is signed in. Render the
  // app directly in those cases.
  if (DEMO_MODE || isLocalSession()) {
    return (
      <DeepLinkProvider>
        <FeatureBitContextProvider>
          <PartDetailsDrawerProvider>
            <IssuesProvider>
              <AuthenticatedApp location={location} navigate={navigate} />
            </IssuesProvider>
          </PartDetailsDrawerProvider>
        </FeatureBitContextProvider>
      </DeepLinkProvider>
    );
  }

  return (
    <React.Fragment>
      <UnauthenticatedTemplate>
        <div className="UnAuthenticatedClass">
          <UAHeader />
          <UAContent />
        </div>
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <DeepLinkProvider>
          <FeatureBitContextProvider>
            <PartDetailsDrawerProvider>
              <IssuesProvider>
                <AuthenticatedApp location={location} navigate={navigate} />
              </IssuesProvider>
            </PartDetailsDrawerProvider>
          </FeatureBitContextProvider>
        </DeepLinkProvider>
      </AuthenticatedTemplate>
    </React.Fragment>
  );
};

export default AppShell;
