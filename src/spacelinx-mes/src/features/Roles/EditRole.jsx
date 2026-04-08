import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  Button,
  Tab,
  FormGroup,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { updateRoleWithRole } from "../../services/roleService";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import Cliploader from "../../Components/Loaders/Cliploader";
import "./RoleUsers";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import RoleUsers from "./RoleUsers";
import RolePermission from "./RolePermission";
import RoleFilters from "./RoleFilters";
import "../../features/admin/admin.css";

const EditRole = ({ handleCloseClick, handleRefresh, selectedRole }) => {
  const { Alert } = useContext(AlertsContext);
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState("1");
  const [formData, setFormData] = useState({
    roleName: "",
    roleDescription: "",
    systemDefined: false,
  });
  const [initialData, setInitialData] = useState({});
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({ roleName: "" });

  useEffect(() => {
    if (selectedRole) {
      const data = {
        roleName: selectedRole.roleName || "",
        roleDescription: selectedRole.roleDescription || "",
        systemDefined: selectedRole.systemDefined || false,
      };
      setFormData(data);
      setInitialData(data);
      setLoadingData(false);
    }
  }, [selectedRole]);

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

  const editFlyoutTabChange = (event, newValue) => {
    setEditFlyOutTabsValue(newValue);
    if (newValue === "1") {
      setReadOnlyMode(true);
    }
  };

  const hasFormChanged = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({ roleName: "" });
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill all required fields correctly", "error");
      return;
    }

    if (!hasFormChanged()) {
      Alert("No changes detected", "warning");
      return;
    }

    if (!selectedRole?.id) {
      Alert("Invalid Role ID", "error");
      return;
    }

    setLoadingData(true);
    try {
      await updateRoleWithRole(selectedRole.id, formData);
      Alert("Role updated successfully!", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      console.error("Error updating role:", error);
      Alert("Failed to update Role. Please try again.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3>{selectedRole?.roleName} Role</h3>
        <div className="EditFlyoutHeaderIcons">
          {editFlyOutTabsValue === "1" && !selectedRole?.systemDefined && (
            <button onClick={() => setReadOnlyMode(false)}>
              <ion-icon name="create-outline"></ion-icon>
            </button>
          )}
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      <TabContext value={editFlyOutTabsValue}>
        <div className="EditFlyoutTabsPanel">
          <TabList
            centered
            onChange={editFlyoutTabChange}
            aria-label="lab API tabs example"
            variant="fullWidth"
          >
            <Tab label="Details" value="1" />
            <Tab label="Users" value="2" />
            <Tab label="Permissions" value="3" />
            <Tab label="Filters" value="4" />
          </TabList>
        </div>

        <TabPanel value="1" sx={{ padding: "0px" }}>
          {loadingData ? (
            <div className="loader-container">
              <Cliploader loading={loadingData} />
            </div>
          ) : (
            <div className="EditFlyoutBody1">
              <FormGroup>
                <TextField
                  label="Role Name"
                  name="roleName"
                  className="AdminTextFeilds"
                  value={formData.roleName}
                  onChange={handleInputChange}
                  error={!!errors.roleName}
                  helperText={errors.roleName}
                  disabled={readOnlyMode}
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
                  onChange={handleInputChange}
                  disabled={readOnlyMode}
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
                      onChange={handleInputChange}
                      disabled={readOnlyMode}
                    />
                  }
                  label="System Defined"
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
                <Button disabled={loadingData} onClick={handleSubmit}>
                  Update
                </Button>
              </div>
            </div>
          )}
        </TabPanel>
        <TabPanel value="2">
          <RoleUsers selectedRoleId={selectedRole?.id} />
        </TabPanel>
        <TabPanel value="3">
          <RolePermission selectedRoleId={selectedRole?.id} />
        </TabPanel>
        <TabPanel value="4">
          <RoleFilters selectedRoleId={selectedRole?.id} />
        </TabPanel>
      </TabContext>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditRole;
