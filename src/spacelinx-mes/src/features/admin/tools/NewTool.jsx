import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  MenuItem,
  Button,
  FormGroup,
  FormHelperText,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { createToolType } from "../../../services/toolTypeService";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { createTool } from "../../../services/toolService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import "../../materialKits/Kits.css";

const NewTool = ({
  handleCloseClick,
  handleRefresh,
  toolTypesLoading,
  toolTypes,
  toolsNumbersData,
  fetchToolTypesData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);

  const [formValues, setFormValues] = useState({
    toolName: "",
    toolNumber: "",
    toolType: null,
  });
  const [formErrors, setFormErrors] = useState({
    toolName: "",
    toolNumber: "",
    toolType: "",
  });

  const { toolName, toolNumber, toolType } = formValues;

  const filter = createFilterOptions();

  const validateCreateToolFields = () => {
    let valid = true;
    const errors = { toolName: "", toolNumber: "", toolType: "" };

    if (!toolName) {
      errors.toolName = "Tool Name is required";
      valid = false;
    } else if (toolName.length > 250) {
      errors.toolName = "Tool Name must be at most 250 characters long";
      valid = false;
    }

    if (!toolNumber) {
      errors.toolNumber = "Tool Number is required";
      valid = false;
    } else if (toolNumber.length > 100) {
      errors.toolNumber = "Tool Number must be at most 100 characters long";
      valid = false;
    }

    if (!toolType) {
      errors.toolType = "Type is required";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateCreateToolFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);

    const tool = {
      name: toolName,
      number: toolNumber,
      toolTypeId: toolType.id,
    };
    try {
      await createTool(tool);
      handleRefresh();
      handleCloseClick();
      Alert("Tool Created Successfully..!", "success");
      setFormValues({
        toolName: "",
        toolNumber: "",
        toolType: null,
      });
      setFormErrors({
        toolName: "",
        toolNumber: "",
        toolType: "",
      });
    } catch (error) {
      Alert("Couldn't Create Tool...!", "error");
    } finally {
      setLoadingData(false);
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
        setFormValues({
          ...formValues,
          toolType: { id: response.id, name: response.name },
        });
        fetchToolTypesData();
        setFormErrors({ ...formErrors, toolType: "" });
        Alert("Tool Type Added Successfully..!", "success");
      } catch (error) {
        console.error(error);
        Alert("Failed to Add Tool Type...!", "error");
      } finally {
        setLoadingData(false);
      }
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "30px" }}>Create Tool</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <h3>Enter The Details</h3>

            <FormGroup>
              <TextField
                label="Tool Number"
                className="AdminTextFeilds"
                onBlur={(e) => {
                  const toolNumberInput = e.target.value.trim();
                  const exactMatch = toolsNumbersData.some(
                    (number) =>
                      number.toLowerCase() === toolNumberInput.toLowerCase(),
                  );
                  const errorMessage = exactMatch
                    ? "The Tool Number Already Exists"
                    : "";

                  setFormErrors({
                    ...formErrors,
                    toolNumber: errorMessage,
                  });

                  if (!errorMessage) {
                    setFormValues({
                      ...formValues,
                      toolNumber: toolNumberInput,
                    });
                  }
                }}
                onChange={(e) => {
                  setFormValues({
                    ...formValues,
                    toolNumber: e.target.value,
                  });
                  setFormErrors({
                    ...formErrors,
                    toolNumber: "",
                  });
                }}
                value={toolNumber}
                error={!!formErrors.toolNumber}
                required
              />
              <FormHelperText error={!!formErrors.toolNumber}>
                {formErrors.toolNumber}{" "}
              </FormHelperText>
            </FormGroup>
            <FormGroup>
              <TextField
                label="Tool Name"
                className="AdminTextFeilds"
                onChange={(e) => {
                  setFormValues({ ...formValues, toolName: e.target.value });
                  setFormErrors({ ...formErrors, toolName: "" });
                }}
                value={toolName}
                error={!!formErrors.toolName}
                required
              />
              <FormHelperText error={!!formErrors.toolName}>
                {formErrors.toolName}
              </FormHelperText>
            </FormGroup>
            <Autocomplete
              value={toolType}
              loading={toolTypesLoading}
              loadingText="Loading Tool Types..."
              onChange={(event, newValue) => {
                if (newValue && newValue.newToolTypeValue) {
                  handleAddToolType(event, newValue);
                } else {
                  setFormValues({ ...formValues, toolType: newValue });
                  setFormErrors({ ...formErrors, toolType: "" });
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
              id="tool-type-autocomplete"
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
                  error={!!formErrors.toolType}
                  helperText={formErrors.toolType}
                  required
                />
              )}
            />
          </div>

          <div className="CreateFlyoutFooter">
            <Button className="CancelButton" onClick={handleCloseClick}>
              Cancel
            </Button>
            <Button
              disabled={loadingData || !!formErrors.toolNumber}
              onClick={handleCreate}
            >
              Create
            </Button>
          </div>
        </>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewTool;
