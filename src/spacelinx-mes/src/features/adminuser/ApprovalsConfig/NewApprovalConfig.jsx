import React, { useState, useContext } from "react";
import { Button, TextField, Checkbox, FormControlLabel } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { createApprovalConfig } from "../../../services/approvalsConfigService";

const NewApprovalConfig = ({ handleCloseClick, fetchConfigsData }) => {
  const { Alert } = useContext(AlertsContext);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    entityType: "",
    numberOfLevels: "",
    description: "",
    requireSequentialApproval: false,
  });
  const [errors, setErrors] = useState({
    entityType: "",
    numberOfLevels: "",
  });

  const validateEntityType = (value) => {
    if (!value.trim()) return "Entity Type is required";
    return "";
  };

  const validateLevels = (value) => {
    if (!value) return "Number of levels is required";
    if (isNaN(value)) return "Must be a number";
    if (Number(value) <= 0) return "Must be greater than 0";
    if (Number(value) > 10) return "Max 10 levels allowed";
    return "";
  };

  const validate = () => {
    const entityTypeError = validateEntityType(formValues.entityType);
    const levelsError = validateLevels(formValues.numberOfLevels);

    setErrors({
      entityType: entityTypeError,
      numberOfLevels: levelsError,
    });

    return !entityTypeError && !levelsError;
  };

  const handleCreate = async () => {
    if (!validate()) {
      Alert("Please fix validation errors", "error");
      return;
    }

    setLoading(true);

    const payload = {
      entityType: formValues.entityType.trim(),
      numberOfLevels: Number(formValues.numberOfLevels),
      description: formValues.description.trim(),
      requireSequentialApproval: formValues.requireSequentialApproval,
    };

    try {
      await createApprovalConfig(payload);
      Alert("Approval configuration created successfully", "success");
      fetchConfigsData();
      handleCloseClick();
    } catch (error) {
      console.error(error);
      Alert("Failed to create approval configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Approval Configuration</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline" />
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <Cliploader loading={loading} />
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <h3>Configuration Details</h3>

            <TextField
              label="Entity Type"
              value={formValues.entityType}
              onChange={(e) => {
                const value = e.target.value;
                setFormValues({ ...formValues, entityType: value });
                setErrors({
                  ...errors,
                  entityType: validateEntityType(value.trim()),
                });
              }}
              error={!!errors.entityType}
              helperText={errors.entityType}
            />

            <TextField
              label="Number of Approval Levels"
              type="number"
              inputProps={{ min: 1, max: 10 }}
              value={formValues.numberOfLevels}
              onChange={(e) => {
                const value = e.target.value;

                if (value && Number(value) < 0) return;

                setFormValues({
                  ...formValues,
                  numberOfLevels: value,
                });

                setErrors({
                  ...errors,
                  numberOfLevels: validateLevels(value),
                });
              }}
              error={!!errors.numberOfLevels}
              helperText={errors.numberOfLevels}
            />

            <TextField
              label="Description"
              multiline
              rows={3}
              value={formValues.description}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  description: e.target.value,
                })
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formValues.requireSequentialApproval}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      requireSequentialApproval: e.target.checked,
                    })
                  }
                />
              }
              label="Require Sequential Approval"
            />
          </div>

          <div className="CreateFlyoutFooter">
            <Button className="CancelButton" onClick={handleCloseClick}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={handleCreate}>
              Create
            </Button>
          </div>

          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default NewApprovalConfig;
