import React, { useState, useEffect, useContext } from "react";
import { Button, TextField } from "@mui/material";
import {
  updateLocation,
  deleteLocation,
} from "../../../services/locationService";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";

const Editlocation = ({
  handleCloseClick,
  handleRefresh,
  selectedId,
  setMainLoadingData,
  selectedLocationData,
  locationNumbersData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [editLocationNumber, setEditLocationNumber] = useState(
    selectedLocationData?.number
  );
  const [editLocationNameError, setEditlocationNameError] = useState("");
  const [editLocationName, setEditlocationName] = useState(
    selectedLocationData?.name
  );
  const [editLocationNumberError, setEditLocationNumberError] = useState("");
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const validateEditlocationFields = () => {
    let valid = true;
    if (!editLocationName) {
      setEditlocationNameError("Location Name is required");
      valid = false;
    } else if (editLocationName.length > 250) {
      setEditlocationNameError(
        "Location Name must be at most 250 characters long"
      );
      valid = false;
    } else {
      setEditlocationNameError("");
    }
    if (!editLocationNumber) {
      setEditLocationNumberError("Location Number is required");
      valid = false;
    } else if (editLocationNumber.length > 100) {
      setEditLocationNumberError(
        "Location Number must be at most 100 characters long"
      );
      valid = false;
    } else {
      setEditLocationNumberError("");
    }

    return valid;
  };

  useEffect(() => {
    if (selectedLocationData) {
      setEditLocationNumber(selectedLocationData.number || "");
      setEditlocationName(selectedLocationData.name || "");
      setEditLocationNumberError("");
      setEditlocationNameError("");
    }
    setLoadingData(false);
  }, [selectedLocationData]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditlocationFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setMainLoadingData(true);
    setLoadingData(true);
    const updatedLocation = {
      name: editLocationName,
      number: editLocationNumber,
    };
    try {
      const response = await updateLocation(selectedId, updatedLocation);
      EditlocationDrawerClose();
      handleRefresh();
      Alert("Updated Location Details Successfully!", "success");
    } catch (error) {
      Alert("Couldn't Update Location Details. Please try again.", "error");
    } finally {
      setLoadingData(false);
      setMainLoadingData(false);
    }
  };

  const EditlocationDrawerClose = () => {
    setReadOnlyMode(true);
    handleCloseClick();
  };

  const handleResetClick = () => {
    setEditlocationName(selectedLocationData.name);
    setEditLocationNumber(selectedLocationData.number);
    setEditLocationNumberError("");
    setEditlocationNameError("");
  };

  const handleDelete = async () => {
    setLoadingData(true);
    setMainLoadingData(true);
    if (selectedId) {
      try {
        const response = await deleteLocation(selectedId);
        Alert("Location Deleted Successfully..!", "success");
        handleRefresh();
      } catch (error) {
        Alert("Couldn't Delete Location ...!", "error");
      } finally {
        setLoadingData(false);
        setMainLoadingData(false);
      }
    }
    EditlocationDrawerClose(false);
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeaderNew">
        <h3>{` ${selectedLocationData?.name}`}</h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.LOCATIONS.MODIFY)) {
                Alert("You do not have access to edit.", "warning");
                return;
              }
              setReadOnlyMode(false);
            }}
          >
            <ion-icon name="create-outline"></ion-icon>
          </button>
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="EditFlyoutBodyNew">
          <TextField
            label="Location Number"
            value={editLocationNumber}
            error={!!editLocationNumberError}
            helperText={editLocationNumberError}
            readOnly={readOnlyMode}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: readOnlyMode }}
            className="AdminTextFeilds"
            onBlur={(e) => {
              const enteredLocationNumber = e.target.value.trim();
              if (enteredLocationNumber === "") {
                setEditLocationNumberError("Location Number is required");
              } else if (
                locationNumbersData.some(
                  (number) =>
                    number.toLowerCase() ===
                      enteredLocationNumber.toLowerCase() &&
                    number.toLowerCase() !==
                      selectedLocationData.number.toLowerCase()
                )
              ) {
                setEditLocationNumberError("Location Number Already Exists");
              } else {
                setEditLocationNumber(enteredLocationNumber);
                setEditLocationNumberError("");
              }
            }}
            onChange={(e) => {
              setEditLocationNumber(e.target.value);
              if (editLocationNumberError) {
                setEditLocationNumberError("");
              }
            }}
          />

          <TextField
            label="Location Name"
            error={!!editLocationNameError}
            helperText={editLocationNameError}
            value={editLocationName}
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: readOnlyMode }}
            onChange={(e) => {
              const newValue = e.target.value;
              setEditlocationName(newValue);
              if (newValue.trim() === "") {
                setEditlocationNameError("Location Name is required");
              } else {
                setEditlocationNameError("");
              }
            }}
            readOnly={readOnlyMode}
            className="AdminTextFeilds"
          />
        </div>
      )}
      {readOnlyMode ? null : (
        <div className="EditFlyoutFooter">
          <ion-icon
            name="trash-outline"
            onClick={() => {
              if (!hasPermission(PERMISSIONS.LOCATIONS.DELETE)) {
                Alert("You do not have access to delete.", "warning");
                return;
              }
              handleDelete();
            }}
          ></ion-icon>
          <div className="update-reset">
            <Button className="CancelButton" onClick={handleResetClick}>
              Reset
            </Button>
            <Button
              disabled={loadingData || !!editLocationNumberError}
              onClick={handleEditSubmit}
            >
              Update
            </Button>
          </div>
        </div>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default Editlocation;
