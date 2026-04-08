import React, { useState, useEffect, useContext } from "react";
import { TextField, Button } from "@mui/material";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { updatePermission } from "../../../services/permissionService";
import { AlertsContext } from "../../AlertsContext/Context";

const EditPermissions = ({
  selectedId,
  selectedRowData,
  handleCloseClick,
  handleRefresh,
  existingPermissionNames,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [formData, setFormData] = useState({
    name: "",
    categoryName: "",
  });
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  useEffect(() => {
    if (selectedRowData) {
      setFormData({
        name: selectedRowData.name || "",
        categoryName: selectedRowData.categoryName || "",
      });
    }
  }, [selectedRowData]);

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", categoryName: "" };

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
      await updatePermission(selectedId, formData?.name);
      Alert("Permission updated successfully", "success");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      Alert("Failed to update permission", "error");
      console.error("Update error:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === "name" ? value.toUpperCase() : value;

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    const requiredFields = {
      name: "Name is required",
    };

    let errorMsg = "";

    if (!formattedValue && requiredFields[name]) {
      errorMsg = requiredFields[name];
    } else if (name === "name") {
      if (formattedValue !== selectedRowData?.name) {
        const isDuplicate = existingPermissionNames.includes(formattedValue);
        if (isDuplicate) {
          errorMsg = "Permission name already exists";
        }
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleResetClick = () => {
    setFormData({
      name: selectedRowData.name || "",
      categoryName: selectedRowData.categoryName || "",
    });
    setErrors({});
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Edit Permission</h2>
        <div>
          <button
            onClick={() => {
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
              label="Name"
              name="name"
              value={formData.name}
              readOnly={readOnlyMode}
              InputProps={{ readOnly: readOnlyMode }}
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
              readOnly={readOnlyMode}
              InputProps={{ readOnly: readOnlyMode }}
            />
          </div>
          {readOnlyMode ? null : (
            <div className="CreateFlyoutFooter">
              <Button className="CancelButton" onClick={handleResetClick}>
                Reset
              </Button>
              <Button
                variant="outlined"
                onClick={handleSubmit}
                className="CreateButton"
                disabled={loadingData || errors.name}
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

export default EditPermissions;
