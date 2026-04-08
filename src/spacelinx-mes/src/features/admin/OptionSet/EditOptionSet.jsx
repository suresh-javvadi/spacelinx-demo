import React, { useContext, useState, useEffect } from "react";
import {
  TextField,
  Button,
  IconButton,
  FormHelperText,
  Switch,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import Cliploader from "../../../Components/Loaders/Cliploader";
import "./OptionSet.css";
import { updateOptionSet } from "../../../services/optionSetService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
const EditOptionSet = ({
  handleCloseClick,
  selectedOptionSet,
  fetchOptionSetData,
  optionSetNames,
  optionSetDisplayNames,
  jsonMode,
  setJsonMode,
  jsonError,
  setJsonError,
}) => {
  const { Alert } = useContext(AlertsContext);
  const appName = import.meta.env.VITE_APP_NAME;
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    displayName: "",
    values: [],
    applicationName: appName,
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
    displayName: "",
    values: "",
  });

  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [labels, setLabels] = useState(["name", "description"]);
  const [loadingData, setLoadingData] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [objectCount, setObjectCount] = useState(1);
  const [formattedValues, setFormattedValues] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  useEffect(() => {
    if (!selectedOptionSet) return;

    let parsedValues = [];

    try {
      parsedValues = selectedOptionSet.values
        ? JSON.parse(selectedOptionSet.values)
        : [];

      if (!Array.isArray(parsedValues)) {
        throw new Error("Parsed values is not an array.");
      }

      setFormattedValues(JSON.stringify(parsedValues, null, 2));
    } catch (error) {
      console.error("Error parsing values:", error);
      Alert("Error parsing option set values. Please check the data.", "error");
      parsedValues = [];
      setFormattedValues("Invalid JSON format");
    }

    const updatedFormValues = {
      name: selectedOptionSet.name || "",
      applicationName: selectedOptionSet.applicationName || "",
      description: selectedOptionSet.description || "",
      values: parsedValues,
      displayName: selectedOptionSet.displayName || "",
    };

    setFormValues(updatedFormValues);
    setObjectCount(parsedValues.length || 1);

    if (parsedValues.length > 0 && typeof parsedValues[0] === "object") {
      setLabels(Object.keys(parsedValues[0]));
    } else {
      setLabels([]);
    }

    if (jsonMode) {
      if (!readOnlyMode || jsonMode) {
        try {
          setJsonInput(JSON.stringify(parsedValues, null, 2));
        } catch {
          setJsonInput("[]");
        }
      }
    }

    setLoadingData(false);
  }, [selectedOptionSet, jsonMode, readOnlyMode]);

  const handleLabelAdd = () => {
    if (labelInput.trim()) {
      setLabels((prevLabels) => [...prevLabels, labelInput.trim()]);
      setLabelInput("");
    }
  };

  const handleObjectCountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      Alert("Number of objects cannot be negative.", "error");
      setObjectCount(1);
    } else {
      setObjectCount(value);
    }
  };

  const handleLabelDelete = (index) => {
    setLabels((prevLabels) => prevLabels.filter((_, i) => i !== index));
  };

  const handleObjectDelete = (index) => {
    setFormValues((prevValues) => {
      const updatedValues = prevValues.values.filter((_, i) => i !== index);
      return { ...prevValues, values: updatedValues };
    });
    setObjectCount((prevCount) => Math.max(prevCount - 1, 0));
  };

  const handleAddObject = () => {
    setFormValues((prevValues) => ({
      ...prevValues,
      values: [
        ...prevValues.values,
        Object.fromEntries(labels.map((label) => [label, ""])),
      ],
    }));
    setObjectCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    const count = parseInt(objectCount, 10);

    if (!isNaN(count) && count > 0) {
      const newObjects = Array.from({ length: count }, (_, index) => {
        if (formValues.values && formValues.values[index]) {
          return formValues.values[index];
        } else {
          return Object.fromEntries(labels.map((label) => [label, ""]));
        }
      });

      setFormValues((prevValues) => ({
        ...prevValues,
        values: newObjects,
      }));
    } else if (objectCount === "") {
      setFormValues((prevValues) => ({
        ...prevValues,
        values: [],
      }));
    }
  }, [objectCount, labels, formValues.values]);

  const validateCreateFields = () => {
    let valid = true;

    setFormErrors((prevErrors) => ({
      name: "",
      description: "",
      displayName: "",
      values: "",
    }));

    if (!formValues.name) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        name: "Name is required",
      }));
      valid = false;
    }

    if (!formValues.description) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        description: "Description is required",
      }));
      valid = false;
    }

    if (!formValues.displayName) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        displayName: "Display Name is required",
      }));
      valid = false;
    }

    if (formValues.values.length === 0) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        values: "At least one object must be added",
      }));
      valid = false;
    }

    return valid;
  };

  const handleObjectChange = (index, field, value) => {
    setFormValues((prevValues) => {
      const newValues = [...prevValues.values];
      newValues[index] = { ...newValues[index], [field]: value };
      return { ...prevValues, values: newValues };
    });
  };

  const handleTextFieldChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));

    const requiredFields = {
      name: "Name",
      description: "Description",
      displayName: "Display Name",
    };

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]:
        value === "" || value === null || value === undefined
          ? `${requiredFields[name] || name} is required`
          : "",
    }));
  };

  const handleNameBlur = (e) => {
    const { value } = e.target;

    if (optionSetNames.includes(value && value != selectedOptionSet?.name)) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        name: "Name already exists use another",
      }));
    } else {
      setFormErrors((prevErrors) => ({ ...prevErrors, name: "" }));
    }
  };

  const handleDisplayNameBlur = (e) => {
    const { value } = e.target;
    const isDuplicate =
      optionSetDisplayNames.includes(value) &&
      value !== selectedOptionSet?.displayName;

    if (isDuplicate) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        displayName: "Display Name already exists, use another",
      }));
    } else {
      setFormErrors((prevErrors) => ({ ...prevErrors, displayName: "" }));
    }
  };
  const handleJsonTextChange = (e) => {
    const text = e.target.value;
    setJsonInput(text);

    try {
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        setJsonError("JSON must be an array of strings or objects.");
        return;
      }

      setJsonError("");
      setFormValues((prev) => ({ ...prev, values: parsed }));
    } catch (err) {
      setJsonError("Invalid JSON syntax.");
    }
  };

  const handleSubmit = async () => {
    if (jsonMode) {
      try {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed))
          throw new Error("Values must be an array of objects");
        setFormValues((prev) => ({ ...prev, values: parsed }));
        if (parsed.length > 0) {
          setLabels(Object.keys(parsed[0]));
        }
        setJsonError("");
      } catch {
        Alert("Invalid JSON. Please correct it before submitting.", "error");
        return;
      }
    }
    if (!validateCreateFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);

    try {
      const payload = {
        ...formValues,
        values: JSON.stringify(formValues.values),
      };

      await updateOptionSet(selectedOptionSet.id, payload);
      handleCloseClick();
      fetchOptionSetData();
      Alert("Option set updated successfully!", "success");
    } catch (error) {
      Alert("Failed to update option set. Please try again.", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleReset = () => {
    let parsedValues = [];
    try {
      parsedValues = selectedOptionSet.values
        ? JSON.parse(selectedOptionSet.values)
        : [];

      if (!Array.isArray(parsedValues)) {
        throw new Error("Parsed values is not an array.");
      }
    } catch (error) {
      console.error("Error parsing values:", error);
      Alert("Error parsing option set values. Please check the data.", "error");
      parsedValues = [];
    }

    setFormValues({
      name: selectedOptionSet.name || "",
      applicationName: selectedOptionSet.applicationName || "",
      description: selectedOptionSet.description || "",
      values: parsedValues,
      displayName: selectedOptionSet.displayName || "",
    });
    setFormErrors({
      name: "",
      applicationName: "",
      description: "",
      values: "",
      displayName: "",
    });

    setObjectCount(parsedValues?.length || 1);

    setLabels(
      parsedValues.length > 0
        ? Object.keys(parsedValues[0])
        : ["name", "description"]
    );
    if (jsonMode) {
      setJsonInput(JSON.stringify(parsedValues, null, 2));
    }
  };
  const handleToggleJsonMode = () => {
    if (jsonMode) {
      try {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed)) throw new Error("Invalid format");
        setFormValues((prev) => ({ ...prev, values: parsed }));
        if (parsed.length > 0) setLabels(Object.keys(parsed[0]));
        setJsonError("");
      } catch {
        setJsonError("Invalid JSON format. Must be an array of objects.");
        return;
      }
    } else {
      setJsonInput(JSON.stringify(formValues.values, null, 2));
      setJsonError("");
    }
    setJsonMode((prev) => !prev);
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Edit Optionset</h2>

        <div className="HeaderActions">
          {!readOnlyMode && (
            <div className="JsonToggleSwitch">
              <Switch
                checked={jsonMode}
                onChange={handleToggleJsonMode}
                sx={{ marginTop: "-3px" }}
              />
            </div>
          )}
          <button
            onClick={() => {
              setReadOnlyMode(false);
              setJsonInput(JSON.stringify(formValues.values || [], null, 2));
              setJsonError("");
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
        <>
          <div className="CreateFlyoutBody">
            <h3>Enter The Details</h3>
            <TextField
              disabled
              label="Name"
              name="name"
              className="AdminTextFeilds"
              value={formValues.name}
              onChange={handleTextFieldChange}
              onBlur={handleNameBlur}
              error={!!formErrors.name}
              helperText={formErrors.name}
              readOnly={readOnlyMode}
            />
            <TextField
              label="Description"
              name="description"
              className="AdminTextFeilds"
              value={formValues.description}
              onChange={handleTextFieldChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
              inputProps={{ readOnly: readOnlyMode }}
            />
            <TextField
              label="Display Name"
              name="displayName"
              className="AdminTextFeilds"
              value={formValues.displayName}
              onChange={handleTextFieldChange}
              onBlur={handleDisplayNameBlur}
              error={!!formErrors.displayName}
              helperText={formErrors.displayName}
              inputProps={{ readOnly: readOnlyMode }}
            />

            {readOnlyMode ? (
              <TextField
                label="Values"
                multiline
                fullWidth
                value={formattedValues}
                InputProps={{
                  readOnly: true,
                  style: {
                    whiteSpace: "pre-wrap",
                    fontFamily: "Monospace",
                    lineHeight: "1.5",
                  },
                }}
              />
            ) : jsonMode ? (
              <TextField
                label="JSON Values"
                multiline
                fullWidth
                rows={10}
                value={jsonInput}
                onChange={handleJsonTextChange}
                error={!!jsonError}
                helperText={jsonError || ""}
              />
            ) : (
              <>
                <div className="NewOptionSetInputContainer">
                  <div className="NewOptionSetlabelContainer">
                    <div className="NewOptionSetlabelInput">
                      <TextField
                        label="Label"
                        name="label"
                        className="AdminTextFeilds"
                        value={labelInput}
                        onChange={(e) => setLabelInput(e.target.value)}
                      />
                      <Button onClick={handleLabelAdd} startIcon={<Add />}>
                        Add Label
                      </Button>
                    </div>
                    <div className="NewOptionSetLabelList">
                      {labels.map((label, index) => (
                        <div key={index} className="label-chip">
                          {label}
                          <IconButton
                            onClick={() => handleLabelDelete(index)}
                            className="delete-button"
                          >
                            <CloseIcon className="x-icon" />
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="NewOptionSetObjectInput">
                    <TextField
                      label="No of Objects"
                      name="noOfObjects"
                      className="AdminTextFeilds"
                      type="number"
                      value={objectCount}
                      onChange={handleObjectCountChange}
                    />
                  </div>
                </div>

                <div className="NewOptionSetContainer">
                  {formValues.values.map((obj, index) => (
                    <div key={index} className="NewOptionSetObject">
                      <div className="NewOptionSetHeader">
                        <h3 className="NewOptionSetTitle">
                          Object {index + 1}
                        </h3>
                        <IconButton
                          onClick={() => handleObjectDelete(index)}
                          className="NewOptionSetRemoveButton"
                        >
                          <RemoveCircleOutlineIcon className="NewOptionSetRemoveIcon" />
                        </IconButton>
                      </div>
                      {labels.map((label) => (
                        <div
                          key={label}
                          className="NewOptionSetObjectContainer"
                        >
                          <span className="NewOptionSetObjectLabel">
                            {label}:
                          </span>
                          <TextField
                            value={obj[label] || ""}
                            onChange={(e) =>
                              handleObjectChange(index, label, e.target.value)
                            }
                            fullWidth
                            margin="normal"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div
                  onClick={handleAddObject}
                  className="NewOptionSetAddButton"
                >
                  + Add New Object
                </div>

                <FormHelperText error={!!formErrors.values}>
                  {formErrors.values}
                </FormHelperText>
              </>
            )}
          </div>
        </>
      )}
      {!readOnlyMode && (
        <div className="CreateFlyoutFooter">
          <div className="update-reset">
            <Button className="CancelButton" onClick={handleReset}>
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                loadingData || !!formErrors.displayName || !!formErrors.name
              }
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

export default EditOptionSet;
