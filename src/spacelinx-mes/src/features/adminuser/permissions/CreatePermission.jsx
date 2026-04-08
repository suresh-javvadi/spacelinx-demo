import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { createPermission } from "../../../services/permissionService";

const CreatePermissions = ({
  handleCloseClick,
  handleRefresh,
  existingPermissionNames,
}) => {
  const { Alert } = React.useContext(AlertsContext);
  const [formData, setFormData] = useState({
    name: "",
    categoryName: "",
  });
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  const validate = () => {
    let valid = true;
    const newErrors = { name: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Permission Name is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoadingData(true);
    try {
      await createPermission(formData);
      Alert("Permission created successfully", "success");
      handleRefresh();
      handleCloseClick();
    } catch (err) {
      Alert("Failed to create permission", "error");
      console.error("Create error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim();
    const formattedValue = name === "name" ? trimmedValue.toUpperCase() : value;

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    const requiredFields = {
      name: "Name is required",
    };

    let errorMsg = "";

    if (!formattedValue && requiredFields[name]) {
      errorMsg = requiredFields[name];
    } else if (
      name === "name" &&
      existingPermissionNames.includes(formattedValue)
    ) {
      errorMsg = "Permission name already exists";
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Permission</h2>
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
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            <TextField
              label="Category Name"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </div>

          <div className="CreateFlyoutFooter">
            <Button
              onClick={handleCloseClick}
              className="CancelButton"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              onClick={handleSubmit}
              className="CreateButton"
              disabled={loadingData || !!errors.name}
            >
              Create
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreatePermissions;
