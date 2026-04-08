import React, { createContext, useContext, useState } from "react";

const DeepLinkContext = createContext(null);

export const DeepLinkProvider = ({ children }) => {
  const [deepLinkInfo, setDeepLinkInfo] = useState(null);
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  const setDeepLink = (info) => {
    setDeepLinkInfo(info); // { basePath, id }
    setDeepLinkHandled(true);
  };

  const clearDeepLink = () => {
    setDeepLinkInfo(null);
    setDeepLinkHandled(false);
  };

  return (
    <DeepLinkContext.Provider
      value={{
        deepLinkInfo,
        deepLinkHandled,
        setDeepLink,
        clearDeepLink,
        setDeepLinkHandled,
      }}
    >
      {children}
    </DeepLinkContext.Provider>
  );
};

export const useDeepLink = () => {
  const ctx = useContext(DeepLinkContext);
  if (!ctx) {
    throw new Error("useDeepLink must be used inside DeepLinkProvider");
  }
  return ctx;
};
