import React, { createContext } from "react";

const { Provider, Consumer } = createContext();

const ContextProvider = ({ value, children }) => {
  return <Provider value={value}>{children}</Provider>;
};

export { ContextProvider, Consumer };
