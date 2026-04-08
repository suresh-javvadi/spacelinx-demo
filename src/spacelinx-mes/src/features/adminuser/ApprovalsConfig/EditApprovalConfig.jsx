import React, { useState, useEffect, useContext } from "react";
import { Button, TextField, Checkbox, FormControlLabel } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { useUserContext } from "../../userContext/UserContext";
import { updateApprovalConfig } from "../../../services/approvalsConfigService";
import { PERMISSIONS } from "../../../constants/PagePermissions";

const EditApprovalConfig = ({
  selectedConfig,
  handleCloseClick,
  fetchConfigsData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useUserContext();
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [formValues, setFormValues] = useState({
    entityType: "",
    numberOfLevels: "",
    description: "",
    requireSequentialApproval: false,
  });
  const [errors, setErrors] = useState({
    numberOfLevels: "",
  });

  const validateLevels = (value) => {
    if (!value) return "Number of levels is required";
    if (isNaN(value)) return "Must be a number";
    if (Number(value) <= 0) return "Must be greater than 0";
    if (Number(value) > 20) return "Max 20 levels allowed";
    return "";
  };

  const validate = () => {
    const levelsError = validateLevels(formValues.numberOfLevels);
    setErrors({ numberOfLevels: levelsError });
    return !levelsError;
  };

  useEffect(() => {
    if (!selectedConfig) return;

    setFormValues({
      entityType: selectedConfig.entityType || "",
      numberOfLevels: selectedConfig.numberOfLevels ?? "",
      description: selectedConfig.description || "",
      requireSequentialApproval:
        selectedConfig.requireSequentialApproval ?? false,
    });
  }, [selectedConfig]);

  const handleUpdate = async () => {
    if (loading) return;

    if (!validate()) {
      Alert("Please fix validation errors", "error");
      return;
    }

    setLoading(true);

    const payload = {
      entityType: formValues?.entityType,
      numberOfLevels: Number(formValues.numberOfLevels),
      description: formValues.description.trim(),
      requireSequentialApproval: formValues.requireSequentialApproval,
    };

    try {
      await updateApprovalConfig(selectedConfig.id, payload);
      Alert("Approval configuration updated successfully", "success");
      fetchConfigsData();
      handleCloseClick();
    } catch (error) {
      console.error(error);
      Alert("Failed to update approval configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Edit Approval Configuration</h2>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.ApprovalsConfig.MODIFY)) {
                Alert(
                  "You do not have access to Edit the ApprovalConfig ..! ",
                  "warning"
                );
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
              disabled
            />

            <TextField
              label="Number of Approval Levels"
              type="number"
              inputProps={{ min: 1, max: 20 }}
              value={formValues.numberOfLevels}
              onChange={(e) => {
                const value = e.target.value;
                if (value && Number(value) < 0) return;

                setFormValues({
                  ...formValues,
                  numberOfLevels: value,
                });

                setErrors({
                  numberOfLevels: validateLevels(value),
                });
              }}
              InputProps={{ readOnly: readOnlyMode }}
              error={!!errors.numberOfLevels}
              helperText={errors.numberOfLevels}
            />

            <TextField
              label="Description"
              multiline
              rows={3}
              value={formValues.description}
              InputProps={{ readOnly: readOnlyMode }}
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
                  disabled={readOnlyMode}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      requireSequentialApproval: e.target.checked,
                    }))
                  }
                />
              }
              label="Require Sequential Approval"
            />
          </div>

          {!readOnlyMode && (
            <div className="CreateFlyoutFooter">
              <Button className="CancelButton" onClick={handleCloseClick}>
                Cancel
              </Button>
              <Button
                disabled={
                  loading ||
                  !!errors.numberOfLevels ||
                  !formValues.numberOfLevels
                }
                onClick={handleUpdate}
              >
                Update
              </Button>
            </div>
          )}

          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default EditApprovalConfig;
