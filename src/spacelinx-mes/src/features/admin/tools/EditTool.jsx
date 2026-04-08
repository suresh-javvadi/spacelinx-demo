import React, { useState, useEffect, useContext } from "react";
import { MenuItem, TextField, Drawer, Alert, Button } from "@mui/material";
import { updateTool } from "../../../services/toolService";
import { deleteTool } from "../../../services/toolService";
import {
  createToolType,
  fetchToolTypes,
} from "../../../services/toolTypeService";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import "../../features.css";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";

const EditTool = ({
  handleCloseClick,
  handleRefresh,
  selectedId,
  selectedToolData,
  toolsNumbersData,
  toolTypesLoading,
  toolTypes,
  fetchToolTypesData,
}) => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [editToolNumber, setEditToolNumber] = useState("");
  const [editType, setEditType] = useState("");
  const [editToolName, setEditToolName] = useState("");
  const [editToolNameError, setEditToolNameError] = useState("");
  const [editToolNumberError, setEditToolNumberError] = useState("");
  const [editTypeError, setEditTypeError] = useState("");
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [selectedToolName, setSelectedToolName] = useState("");
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState("1");
  const [loadingData, setLoadingData] = useState(false);
  const [originalValues, setOriginalValues] = useState({
    name: "",
    number: "",
    toolType: "",
  });

  useEffect(() => {
    const fetchToolsData = async () => {
      try {
        if (selectedToolData) {
          setSelectedToolName(selectedToolData.name);
          setEditToolName(selectedToolData.name || "");
          setEditToolNumber(selectedToolData.number || "");
          setEditType(selectedToolData.toolType || "");
          setOriginalValues({
            name: selectedToolData.name || "",
            number: selectedToolData.number || "",
            toolType: selectedToolData.toolType || "",
          });
          setLoadingData(false);
        }
      } catch (error) {
        Alert("Error fetching Tools data", "error");
        console.error("Error fetching Tools data:", error);
      }
    };
    fetchToolsData();
  }, [selectedToolData]);

  const filter = createFilterOptions();
  const validateEditToolFields = () => {
    let valid = true;
    if (!editToolName) {
      setEditToolNameError("Tool Name is required");
      valid = false;
    } else if (editToolName.length > 250) {
      setEditToolNameError("Tool Name must be at most 250 characters long");
      valid = false;
    } else {
      setEditToolNameError("");
    }
    if (!editToolNumber) {
      setEditToolNumberError("Tool Number is required");
      valid = false;
    } else if (editToolNumber.length > 100) {
      setEditToolNumberError("Tool Number must be at most 100 characters long");
      valid = false;
    } else {
      setEditToolNumberError("");
    }
    if (!editType) {
      setEditTypeError("Type is required");
      valid = false;
    } else {
      setEditTypeError("");
    }

    return valid;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditToolFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);

    const updatedTool = {
      name: editToolName,
      number: editToolNumber,
      toolTypeId: editType?.id,
    };
    try {
      const response = await updateTool(selectedId, updatedTool);
      EditToolDrawerClose();
      handleRefresh();
      Alert("Updated Tool Details Successfully...!", "success");
    } catch (error) {
      Alert("Couldn't Update Tool Details.. Try Again..!", "error");
    } finally {
      setLoadingData(false);
    }
    EditToolDrawerClose(false);
  };

  const EditToolDrawerClose = () => {
    setReadOnlyMode(true);
    handleCloseClick();
    setEditFlyOutTabsValue("1");

    setEditToolName(originalValues.name);
    setEditToolNumber(originalValues.number);
    setEditType(originalValues.toolType);
  };

  const handleResetClick = () => {
    setEditToolName(originalValues.name);
    setEditToolNumber(originalValues.number);
    setEditType(originalValues.toolType);
    setEditToolNameError("");
    setEditToolNumberError("");
    setEditTypeError("");
  };

  const handleDelete = async () => {
    if (!hasPermission(PERMISSIONS.TOOLS.DELETE)) {
      Alert("You don't have permission to delete Tool", "warning");
      return;
    }

    const confirmed = await showConfirmation(
      "Delete Tool?",
      "Are you sure you want to delete this tool?",
      "Yes, Delete it!",
    );

    if (!confirmed) return;

    setLoadingData(true);
    try {
      await deleteTool(selectedId);
      showAlert("success", "Deleted!", "Tool deleted successfully.");
      handleRefresh();
      EditToolDrawerClose();
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed", "Couldn't delete tool. Try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const editFlyoutTabChange = (event, newValue) => {
    setEditFlyOutTabsValue(newValue);
    if (newValue === "1") {
      setReadOnlyMode(true);
    }
  };
  const handleAddToolType = async (event, newValue) => {
    setLoadingData(true);
    if (newValue && newValue.newToolTypeValue) {
      const newToolTypeData = {
        name: newValue.newToolTypeValue,
      };
      try {
        const response = await createToolType(newToolTypeData);
        fetchToolTypesData();
        setEditType({ id: response.id, name: response.name });
        setEditTypeError("");
        Alert("Tool Type Added Successfully!", "success");
      } catch (error) {
        console.error(error);
        Alert("Failed to Add Tool Type...!", "error");
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
        <h3>{` ${selectedToolName} `}</h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.TOOLS.MODIFY)) {
                Alert("You don't have permission to edit Tool", "warning");
                return;
              }
              setReadOnlyMode(false);
            }}
          >
            <ion-icon
              name="create-outline"
              class={
                !hasPermission(PERMISSIONS.TOOLS.MODIFY)
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
            label="Tool Number"
            value={editToolNumber}
            error={!!editToolNumberError}
            helperText={editToolNumberError}
            readOnly={readOnlyMode}
            InputProps={{ readOnly: readOnlyMode }}
            onBlur={(e) => {
              const enteredToolNumber = e.target.value.trim();
              if (enteredToolNumber === "") {
                setEditToolNumberError("Tool Number is required");
              } else if (
                toolsNumbersData.some(
                  (number) =>
                    number.toLowerCase() === enteredToolNumber.toLowerCase() &&
                    number.toLowerCase() !==
                      selectedToolData.number.toLowerCase(),
                )
              ) {
                setEditToolNumberError("Tool Number Already Exists");
              } else {
                setEditToolNumber(enteredToolNumber);
                setEditToolNumberError("");
              }
            }}
            onChange={(e) => {
              setEditToolNumber(e.target.value);
              if (editToolNumberError) {
                setEditToolNumberError("");
              }
            }}
            className="AdminTextFeilds"
          />

          <TextField
            label="Tool Name"
            error={!!editToolNameError}
            helperText={editToolNameError}
            value={editToolName}
            InputProps={{ readOnly: readOnlyMode }}
            onChange={(e) => {
              const newValue = e.target.value;
              setEditToolName(newValue);
              if (newValue.trim() === "") {
                setEditToolNameError("Tool Name is required");
              } else {
                setEditToolNameError("");
              }
            }}
            readOnly={readOnlyMode}
            className="AdminTextFeilds"
          />

          {!readOnlyMode ? (
            <Autocomplete
              value={editType || null}
              loading={toolTypesLoading}
              loadingText="Loading Tool Types..."
              onChange={(event, newValue) => {
                if (newValue && newValue.newToolTypeValue) {
                  handleAddToolType(event, newValue);
                } else if (newValue === null || newValue === undefined) {
                  setEditType(null);
                  setEditTypeError("Tool Type is required");
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
                    newToolTypeValue: inputValue,
                    name: `Add "${inputValue}"`,
                  });
                }
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="edit-tool-type-autocomplete"
              options={toolTypes}
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
                  label="Tool Type"
                  error={!!editTypeError}
                  helperText={editTypeError}
                />
              )}
            />
          ) : (
            <TextField
              label="Tool Type"
              value={editType ? editType.name : ""}
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{
                className: "AdminTextFeilds",
              }}
              error={!!editTypeError}
              helperText={editTypeError}
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
              disabled={loadingData || !!editToolNumberError}
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

export default EditTool;
