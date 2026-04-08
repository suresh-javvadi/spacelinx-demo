import React, { useState, useEffect, useContext } from "react";
import { MenuItem, TextField, Button } from "@mui/material";
import {
  fetchMachineWithId,
  updateMachine,
  fetchMachines,
} from "../../../services/machineService";
import { deleteMachine } from "../../../services/machineService";
import {
  createMachineType,
  fetchMachineTypes,
} from "../../../services/machineTypeService";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";

const EditMachine = ({
  handleCloseClick,
  handleRefresh,
  selectedId,
  machinesNumbersData,
}) => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [editMachineNumber, setEditMachineNumber] = useState("");
  const [editType, setEditType] = useState("");
  const [machineTypes, setMachineTypes] = useState([]);
  const [editMachineName, setEditMachineName] = useState("");
  const [editMachineNameError, setEditMachineNameError] = useState("");
  const [editMachineNumberError, setEditMachineNumberError] = useState("");
  const [editTypeError, setEditTypeError] = useState("");
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [selectedMachineData, setSelectedMachineData] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMachineTypes, setloadingMachinesTypes] = useState(true);

  useEffect(() => {
    if (selectedId) {
      fetchMachinesData();
    }
  }, [selectedId]);
  const fetchMachinesData = async () => {
    setloadingMachinesTypes(true);
    try {
      const [machineTypesData, machineData] = await Promise.all([
        fetchMachineTypes(),
        fetchMachineWithId(selectedId),
      ]);
      setMachineTypes(machineTypesData);
      if (machineData) {
        setSelectedMachineData(machineData);
        setEditMachineName(machineData.name || "");
        setEditMachineNumber(machineData.number || "");
        setEditType(
          machineTypesData.find(
            (type) => type.id === machineData.machineTypeId,
          ) || null,
        );
      }
    } catch (error) {
      Alert("Error fetching Machines data", "error");
      console.error("Error fetching Machine data:", error);
    } finally {
      setloadingMachinesTypes(false);
    }
  };

  const filter = createFilterOptions();
  const validateEditMachineFields = () => {
    let valid = true;
    if (!editMachineName) {
      setEditMachineNameError("Machine Name is required");
      valid = false;
    } else if (editMachineName.length > 250) {
      setEditMachineNameError(
        "Machine Name must be at most 250 characters long",
      );
      valid = false;
    } else {
      setEditMachineNameError("");
    }

    if (!editMachineNumber) {
      setEditMachineNumberError("Machine Number is required");
      valid = false;
    } else if (editMachineNumber.length > 100) {
      setEditMachineNumberError(
        "Machine Number must be at most 100 characters long",
      );
      valid = false;
    } else {
      setEditMachineNumberError("");
    }

    if (!editType) {
      setEditTypeError("Machine Type is required");
      valid = false;
    } else {
      setEditTypeError("");
    }

    return valid;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditMachineFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);
    const updatedMachine = {
      name: editMachineName,
      number: editMachineNumber,
      machineTypeId: editType?.id,
    };
    try {
      const response = await updateMachine(selectedId, updatedMachine);
      EditMachineDrawerClose();
      handleRefresh();
      Alert("Updated Machine Details Successfully...!", "success");
    } catch (error) {
      Alert("Couldn't Update Machine Details.. Try Again..!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const EditMachineDrawerClose = () => {
    setReadOnlyMode(true);
    handleCloseClick();
  };

  const handleResetClick = () => {
    if (selectedMachineData) {
      setEditMachineName(selectedMachineData.name);
      setEditMachineNumber(selectedMachineData.number);
      setEditType(selectedMachineData.machineType);
      setEditMachineNumberError("");
      setEditMachineNameError("");
      setEditTypeError("");
    }
  };

  const handleDelete = async () => {
    if (!hasPermission(PERMISSIONS.MACHINES.DELETE)) {
      Alert("You don't have permission to delete", "warning");
      return;
    }

    // ✅ Confirmation popup
    const confirmed = await showConfirmation(
      "Delete Machine?",
      "Are you sure you want to delete this machine?",
      "Yes, Delete it!",
    );

    if (!confirmed) return;

    setLoadingData(true);
    try {
      if (selectedId) {
        await deleteMachine(selectedId);
        showAlert("success", "Deleted!", "Machine deleted successfully.");
        handleRefresh();
        EditMachineDrawerClose();
      }
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed", "Couldn't delete machine. Try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddMachineType = async (event, newValue) => {
    setLoadingData(true);
    if (newValue && newValue.newMachineTypeValue) {
      const newMachineTypeData = {
        name: newValue.newMachineTypeValue,
      };
      try {
        const response = await createMachineType(newMachineTypeData);
        const updatedMachineTypes = await fetchMachineTypes();
        setMachineTypes(updatedMachineTypes);
        setEditType({ id: response.id, name: response.name });
        setEditTypeError("");
        Alert("Machine Type Added Successfully!", "success");
      } catch (error) {
        console.error(error);
        Alert("Couldn't Add Machine Type!", "error");
      } finally {
        setLoadingData(false);
      }
    } else {
      setLoadingData(false);
    }
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3>{`${selectedMachineData.name} Details`}</h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.MACHINES.MODIFY)) {
                Alert("You don't have permission to edit", "warning");
                return;
              }
              setReadOnlyMode(false);
            }}
          >
            <ion-icon
              name="create-outline"
              class={
                !hasPermission(PERMISSIONS.MACHINES.MODIFY)
                  ? "IonIconDisabled"
                  : undefined
              }
            ></ion-icon>
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
            label="Machine Number"
            value={editMachineNumber}
            error={!!editMachineNumberError}
            helperText={editMachineNumberError}
            readOnly={readOnlyMode}
            InputProps={{ readOnly: readOnlyMode }}
            onBlur={(e) => {
              const enteredMachineNumber = e.target.value.trim();
              if (enteredMachineNumber === "") {
                setEditMachineNumberError("Machine Number is required");
              } else if (
                machinesNumbersData.some(
                  (number) =>
                    number.toLowerCase() ===
                      enteredMachineNumber.toLowerCase() &&
                    number.toLowerCase() !==
                      selectedMachineData.number.toLowerCase(),
                )
              ) {
                setEditMachineNumberError("Machine Number Already Exists");
              } else {
                setEditMachineNumber(enteredMachineNumber);
                setEditMachineNumberError("");
              }
            }}
            onChange={(e) => {
              setEditMachineNumber(e.target.value);
              if (editMachineNumberError) {
                setEditMachineNumberError("");
              }
            }}
            className="AdminTextFeilds"
            required
          />

          <TextField
            label="Machine Name"
            error={!!editMachineNameError}
            helperText={editMachineNameError}
            value={editMachineName}
            InputProps={{ readOnly: readOnlyMode }}
            onChange={(e) => {
              const newValue = e.target.value;
              setEditMachineName(newValue);
              if (newValue.trim() === "") {
                setEditMachineNameError("Machine Name is required");
              } else {
                setEditMachineNameError("");
              }
            }}
            readOnly={readOnlyMode}
            className="AdminTextFeilds"
            required
          />

          {!readOnlyMode ? (
            <Autocomplete
              value={editType || null}
              loading={loadingMachineTypes}
              loadingText="Loading Machine Types..."
              onChange={(event, newValue) => {
                if (newValue && newValue.newMachineTypeValue) {
                  handleAddMachineType(event, newValue);
                } else if (newValue === null || newValue === undefined) {
                  setEditType(null);
                  setEditTypeError("Machine Type is required");
                } else {
                  setEditType(newValue);
                  setEditTypeError("");
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;

                if (
                  inputValue &&
                  !options.find((option) => option.name === inputValue)
                ) {
                  filtered.push({
                    newMachineTypeValue: inputValue,
                    name: `Add "${inputValue}"`,
                  });
                }
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="edit-machine-type-autocomplete"
              options={machineTypes}
              getOptionLabel={(option) => option.name}
              renderOption={(props, option, index) => (
                <MenuItem {...props} key={option.id || index}>
                  {option.name}
                </MenuItem>
              )}
              freeSolo
              className="AdminTextFeilds"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Machine Type"
                  error={!!editTypeError}
                  helperText={editTypeError}
                  required
                />
              )}
            />
          ) : (
            <TextField
              label="Machine Type"
              value={editType ? editType.name : ""}
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{
                className: "AdminTextFeilds",
              }}
            />
          )}
        </div>
      )}
      {readOnlyMode ? null : (
        <div className="EditFlyoutFooter">
          <ion-icon name="trash-outline" onClick={handleDelete}></ion-icon>
          <div className="update-reset">
            <Button className="CancelButton" onClick={handleResetClick}>
              Reset
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={loadingData || !!editMachineNumberError}
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

export default EditMachine;
