import React, { useState, useEffect, useContext } from "react";
import { TextField, Button } from "@mui/material";

import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { updateSubsystem } from "../../../services/subsystemService";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";

const EditSubsystem = ({
  selectedSubsystem,
  handleCloseClick,
  fetchSubsystemData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });

  const [initialValues, setInitialValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);

  // Load selected subsystem into form
  useEffect(() => {
    if (selectedSubsystem) {
      const values = {
        code: selectedSubsystem.code || "",
        name: selectedSubsystem.name || "",
        description: selectedSubsystem.description || "",
      };

      setFormData(values);
      setInitialValues(values);
      setErrors({});
    }
  }, [selectedSubsystem]);

  const validate = () => {
    const newErrors = {};

    if (!formData.code.trim()) newErrors.code = "Subsystem Code is required";
    if (!formData.name.trim()) newErrors.name = "Subsystem Name is required";

    // description optional → no validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) {
      Alert("Please fill the required fields ", "error");
      return;
    }

    setLoadingData(true);
    try {
      await updateSubsystem(selectedSubsystem.id, formData);
      Alert("Subsystem updated successfully", "success");
      fetchSubsystemData();
      handleCloseClick();
    } catch (err) {
      console.error("Update error:", err);
      Alert("Failed to update subsystem", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleReset = () => {
    setFormData(initialValues);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if ((name === "code" || name === "name") && value.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name} is required`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Edit Subsystem</h2>

        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.SUBSYSTEMS.MODIFY)) {
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
        <>
          <div className="CreateFlyoutBody">
            <TextField
              label="Subsystem Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{ readOnly: readOnlyMode }}
              error={!!errors.code}
              helperText={errors.code}
            />

            <TextField
              label="Subsystem Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{ readOnly: readOnlyMode }}
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              InputProps={{ readOnly: readOnlyMode }}
              rows={3}
            />
          </div>

          {!readOnlyMode && (
            <div className="CreateFlyoutFooter">
              <Button className="CancelButton" onClick={handleReset}>
                Reset
              </Button>

              <Button
                variant="outlined"
                onClick={handleUpdate}
                className="CreateButton"
                disabled={loadingData}
              >
                Update
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditSubsystem;
