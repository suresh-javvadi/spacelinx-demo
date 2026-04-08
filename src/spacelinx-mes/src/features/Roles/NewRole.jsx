import React, { useState, useContext } from "react";
import {
  TextField,
  Button,
  FormGroup,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import { createNewRole } from "../../services/roleService";

const NewRole = ({ handleCloseClick, handleRefresh, isSuperAdmin }) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    roleName: "",
    roleDescription: "",
    systemDefined: false,
  });

  const [errors, setErrors] = useState({
    roleName: "",
  });

  const validateFields = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.roleName.trim()) {
      newErrors.roleName = "Role Name is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    setErrors({ ...errors, [name]: "" });
  };
  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill all required fields correctly", "error");
      return;
    }

    setLoadingData(true);
    try {
      await createNewRole(formData);
      Alert("Role created successfully!", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      console.error("Error creating role:", error);
      Alert("Failed to create Role. Please try again.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "30px" }}>New Role</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <div className="CreateFlyoutBody">
        <h3>Enter The Details</h3>
        <FormGroup>
          <TextField
            label="Role Name"
            name="roleName"
            className="AdminTextFeilds"
            value={formData.roleName}
            onChange={handleChange}
            error={!!errors.roleName}
            helperText={errors.roleName}
            fullWidth
            required
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="Role Description"
            name="roleDescription"
            className="AdminTextFeilds"
            value={formData.roleDescription}
            onChange={handleChange}
            fullWidth
            multiline
          />
        </FormGroup>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                name="systemDefined"
                checked={formData.systemDefined}
                onChange={handleChange}
              />
            }
            label="System Defined"
          />
        </FormGroup>
      </div>
      <div className="CreateFlyoutFooter">
        <Button className="CancelButton" onClick={handleCloseClick}>
          Cancel
        </Button>
        <Button disabled={loadingData} onClick={handleSubmit}>
          Create
        </Button>
      </div>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewRole;
