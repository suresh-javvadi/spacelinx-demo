import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, FormGroup } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";

// API helpers - update path if needed
import {
  fetchPartTypeCategoryById,
  updatePartTypeCategory,
} from "../../../services/PartTypeCategoriesService";

const EditPartTypeCategory = ({
  handleCloseClick,
  handleRefresh,
  selectedCategory,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();

  const [loadingData, setLoadingData] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({ name: "" });

  useEffect(() => {
    if (!selectedCategory) return;

    setLoadingData(true);

    // Build payload directly from props
    const payload = {
      name: selectedCategory.name ?? "",
      description: selectedCategory.description ?? "",
    };

    // Set form state from props
    setFormData(payload);
    setInitialData(payload);

    // Enable read-only view
    setReadOnlyMode(true);

    setLoadingData(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const validateFields = () => {
    const newErrors = {};
    let valid = true;
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const hasFormChanged = () =>
    JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill required fields", "error");
      return;
    }
    if (!hasFormChanged()) {
      Alert("No changes detected", "warning");
      return;
    }
    if (!selectedCategory?.id) {
      Alert("Invalid Category ID", "error");
      return;
    }
    if (!hasPermission(PERMISSIONS.PARTTYPECATEGORIES?.MODIFY)) {
      Alert("You do not have access to edit.", "warning");
      return;
    }

    setLoadingData(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
    };

    try {
      await updatePartTypeCategory(selectedCategory.id, payload);
      Alert("Part Type Category updated successfully!", "success");
      handleCloseClick();
      if (typeof handleRefresh === "function") await handleRefresh();
    } catch (error) {
      console.error("Error updating Part Type Category:", error);
      Alert("Failed to update Part Type Category. Please try again.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({ name: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "name" && !value.trim()) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
    }
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3>Edit Part Type Category</h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.PARTTYPECATEGORIES?.MODIFY)) {
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
        <div className="CreateFlyoutBody">
          <FormGroup>
            <TextField
              label="Name"
              name="name"
              className="AdminTextFeilds"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={readOnlyMode}
            />
          </FormGroup>

          <FormGroup>
            <TextField
              label="Description"
              name="description"
              className="AdminTextFeilds"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              disabled={readOnlyMode}
            />
          </FormGroup>
        </div>
      )}

      {!readOnlyMode && (
        <div className="CreateFlyoutFooter">
          <div className="update-reset">
            <Button className="CancelButton" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSubmit}>Update</Button>
          </div>
        </div>
      )}

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditPartTypeCategory;
