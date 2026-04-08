import React, { useContext } from "react";
import Alert from "@mui/material/Alert";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AlertsContext } from "./Context";
export const HomeAlerts = () => {
  const {
    showAlert,
    setShowAlert,
    alertMessage,
    setAlertMessage,
    severityTypeError,
  } = useContext(AlertsContext);
  return (
    <div>
      {showAlert && (
        <Alert
          iconMapping={{
            success: <CheckCircleOutlineIcon fontSize="inherit" />,
          }}
          severity={severityTypeError}
          action={
            <button
              className="messageCancelButton"
              onClick={() => {
                setAlertMessage("");
                setShowAlert(false);
              }}
            >
              <ion-icon name="add-outline"></ion-icon>
            </button>
          }
        >
          {alertMessage}
        </Alert>
      )}
    </div>
  );
};

export const FlyoutAlerts = () => {
  const {
    showAlert,
    setShowAlert,
    alertMessage,
    setAlertMessage,
    severityTypeError,
  } = useContext(AlertsContext);

  return (
    <div>
      {showAlert && (
        <Alert
          iconMapping={{
            success: <CheckCircleOutlineIcon fontSize="inherit" />,
          }}
          severity={severityTypeError}
          action={
            <button
              className="messageCancelButton"
              onClick={() => {
                setAlertMessage("");
                setShowAlert(false);
              }}
            >
              <ion-icon name="add-outline"></ion-icon>
            </button>
          }
        >
          {alertMessage}
        </Alert>
      )}
    </div>
  );
};
