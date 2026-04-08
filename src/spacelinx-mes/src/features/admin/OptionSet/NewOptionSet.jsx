import React, { useContext, useState, useEffect } from "react";
import {
  TextField,
  Button,
  IconButton,
  FormHelperText,
  Switch,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import Cliploader from "../../../Components/Loaders/Cliploader";
import "./OptionSet.css";
import { createOptionSet } from "../../../services/optionSetService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const NewOptionSet = ({
  handleCloseClick,
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
  const [labels, setLabels] = useState(["name", "description"]);
  const [loadingData, setLoadingData] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [objectCount, setObjectCount] = useState(1);
  const [jsonInput, setJsonInput] = useState("");

  const handleLabelAdd = () => {
    if (labelInput.trim()) {
      setLabels([...labels, labelInput.trim()]);
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
    setLabels(labels.filter((_, i) => i !== index));
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
  const handleToggleJsonMode = () => {
    if (jsonMode) {
      try {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed)) throw new Error();
        setFormValues((prev) => ({ ...prev, values: parsed }));
        setJsonError("");
      } catch {
        setJsonError("Invalid JSON format. Must be an array of objects.");
        return;
      }
    }
    setJsonMode(!jsonMode);
  };

  useEffect(() => {
    const count = parseInt(objectCount, 10);

    if (!isNaN(count) && count > 0) {
      const newObjects = Array(count).fill(
        Object.fromEntries(labels.map((label) => [label, ""]))
      );

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
  }, [objectCount, labels]);
  useEffect(() => {
    if (jsonMode) {
      setJsonInput(JSON.stringify(formValues.values, null, 3));
      setJsonError("");
    }
  }, [jsonMode, formValues.values]);

  const validateCreateFields = () => {
    let valid = true;

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
    const newValues = [...formValues.values];
    newValues[index] = { ...newValues[index], [field]: value };
    setFormValues((prevValues) => ({
      ...prevValues,
      values: newValues,
    }));
  };

  const handleTextFieldChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });

    const requiredFields = {
      name: "Name",
      description: "Description",
      displayName: "Display Name",
    };
    setFormErrors({
      ...formErrors,
      [name]:
        value === "" || value === null || value === undefined
          ? `${requiredFields[name] || name} is required`
          : "",
    });
  };

  const handleNameBlur = (e) => {
    const { value } = e.target;

    if (optionSetNames.includes(value)) {
      setFormErrors({ ...formErrors, name: "Name already exists use another" });
    } else {
      setFormErrors({ ...formErrors, name: "" });
    }
  };

  const handleDisplayNameBlur = (e) => {
    const { value } = e.target;

    if (optionSetDisplayNames.includes(value)) {
      setFormErrors({
        ...formErrors,
        displayName: "Display Name already exists use another",
      });
    } else {
      setFormErrors({ ...formErrors, displayName: "" });
    }
  };
  const handleJsonInputChange = (e) => {
    const value = e.target.value;
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setJsonError("JSON must be an array of objects.");
      } else if (
        !parsed.every(
          (item) => typeof item === "object" && !Array.isArray(item)
        )
      ) {
        setJsonError("Each item in the array must be a plain object.");
      } else {
        setJsonError(""); // Valid JSON
      }
    } catch (err) {
      setJsonError("Invalid JSON format.");
    }
  };

  const handleSubmit = async () => {
    if (jsonMode) {
      try {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed)) throw new Error();
        setFormValues((prev) => ({ ...prev, values: parsed }));
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
        values: JSON.stringify(
          jsonMode ? JSON.parse(jsonInput) : formValues.values
        ),
      };
      await createOptionSet(payload);
      handleCloseClick();
      fetchOptionSetData();
      Alert("Option set created successfully..!", "success");
    } catch (error) {
      Alert("Failed to create option set. Please try again.", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Optionset</h2>
        <div className="HeaderActions">
          <Switch
            checked={jsonMode}
            onChange={handleToggleJsonMode}
            sx={{ marginTop: "-5px" }}
          />

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
              label="Name"
              name="name"
              className="AdminTextFeilds"
              value={formValues.name}
              onChange={handleTextFieldChange}
              onBlur={handleNameBlur}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              label="Description"
              name="description"
              className="AdminTextFeilds"
              value={formValues.description}
              onChange={handleTextFieldChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
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
            />
            {jsonMode ? (
              <TextField
                label="JSON Values"
                multiline
                fullWidth
                rows={10}
                value={jsonInput}
                onChange={handleJsonInputChange}
                error={!!jsonError}
                helperText={jsonError || "Enter a JSON array of objects"}
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
                          <span>{label}</span>
                          <button
                            onClick={() => handleLabelDelete(index)}
                            className="delete-button"
                            aria-label={`Remove ${label}`}
                          >
                            <CloseIcon className="x-icon" />
                          </button>
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
                            value={obj[label]}
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
              </>
            )}

            <FormHelperText error={!!formErrors.values}>
              {formErrors.values}
            </FormHelperText>
          </div>
          <div className="CreateFlyoutFooter">
            <Button onClick={handleCloseClick} className="CancelButton">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                loadingData || !!formErrors.name || !!formErrors.displayName
              }
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

export default NewOptionSet;
