import React, { createContext, useState, useCallback, useMemo } from "react";

export const AlertsContext = createContext();

export const AlertsContextProvider = ({ children }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [severityTypeError, setSeverityTypeError] = useState("");

  const Alert = useCallback((message, severity) => {
    setAlertMessage(message);
    setShowAlert(true);
    setSeverityTypeError(severity);

    setTimeout(() => {
      setAlertMessage("");
      setShowAlert(false);
      setSeverityTypeError("");
    }, 3000);
  }, []);

  const contextValue = useMemo(
    () => ({
      showAlert,
      setShowAlert,
      alertMessage,
      setAlertMessage,
      severityTypeError,
      setSeverityTypeError,
      Alert,
    }),
    [
      showAlert,
      setShowAlert,
      alertMessage,
      setAlertMessage,
      severityTypeError,
      Alert,
    ]
  );

  return (
    <AlertsContext.Provider value={contextValue}>
      {children}
    </AlertsContext.Provider>
  );
};
