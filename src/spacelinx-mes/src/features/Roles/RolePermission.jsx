import React, { useState, useEffect, useContext } from "react";
import { Autocomplete, TextField, Switch } from "@mui/material";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import { fetchPermissionsLookUp } from "../../services/permissionService";
import {
  fetchRolePermissionByRoleId,
  createRolePermission,
  activateRolePermission,
  deactivateRolePermission,
  deleteRolePermission,
} from "../../services/rolePermissionService";

import Cliploader from "../../Components/Loaders/Cliploader";
import {
  showConfirmation,
  showAlert,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const RolePermission = ({ selectedRoleId }) => {
  const { Alert } = useContext(AlertsContext);
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionInputValue, setPermissionInputValue] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const loadAllPermissions = async () => {
    try {
      const perms = await fetchPermissionsLookUp();
      setAllPermissions(perms || []);
    } catch (error) {
      Alert("Failed to load available permissions.", "error");
    }
  };

  const loadRolePermissions = async () => {
    if (!selectedRoleId) return;

    setLoading(true);
    try {
      const data = await fetchRolePermissionByRoleId(selectedRoleId);
      if (data) {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRolePermissions(data);
      }
    } catch (error) {
      Alert("Failed to load role permissions.", "error");
      console.error("Error loading role permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllPermissions();
    loadRolePermissions();
  }, []);

  const handleAddPermissionRole = async () => {
    if (!selectedPermissions.length || !selectedRoleId) {
      Alert("Please select at least one permission.", "warning");
      return;
    }
    setAssigning(true);
    try {
      const payloads = selectedPermissions.map((permission) => ({
        roleId: selectedRoleId,
        permission: permission.name,
        enable: true,
      }));

      for (const payload of payloads) {
        await createRolePermission(payload);
      }

      Alert("Permissions assigned to role successfully.", "success");
      setSelectedPermissions([]);
      setPermissionInputValue("");
      loadRolePermissions();
    } catch (error) {
      Alert("Failed to assign permissions.", "error");
      console.error("Assign error:", error);
    } finally {
      setAssigning(false);
    }
  };

  const handleToggle = async (params) => {
    const { isActive, id } = params;
    setLoadingAction(true);
    try {
      if (isActive) {
        await deactivateRolePermission(id);
        Alert("Permission disabled successfully", "success");
      } else {
        await activateRolePermission(id);
        Alert("Permission enabled successfully", "success");
      }
      loadRolePermissions();
    } catch (error) {
      Alert(
        `Failed to ${isActive ? "deactivate" : "activate"} permission.`,
        "error"
      );
      console.error("Toggle permission error:", error);
    } finally {
      setLoadingAction(false);
    }
  };

  const columns = [
    {
      field: "permission",
      headerName: "Permission",
      flex: 0.3,
    },
    {
      field: "actions",
      headerName: "Enable",
      flex: 0.4,
      renderCell: ({ row }) => (
        <Switch
          checked={row.isActive || false}
          disabled={loading}
          onChange={() => handleToggle(row)}
          color="primary"
        />
      ),
    },
    {
      field: "delete",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const handleDeleteClick = async (id) => {
          setLoadingAction(true);
          const confirmed = await showConfirmation(
            "Are you sure you want to remove this permission from the role?"
          );
          if (!confirmed) return;
          try {
            await deleteRolePermission(id);
            showAlert("success", "Deleted!", "Permission removed from role.");
            loadRolePermissions();
          } catch (error) {
            showAlert("error", "Error", "Failed to remove permission.");
            console.error("Delete error:", error);
          }
          setLoadingAction(false);
        };

        return (
          <ion-icon
            name="trash-outline"
            style={{ color: "red", cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.id);
            }}
          />
        );
      },
    },
  ];

  return (
    <>
      <div className="role-permission-container">
        <div className="permission-controls-section">
          <Autocomplete
            multiple
            disabled={assigning || loading}
            className="permission-autocomplete"
            options={allPermissions}
            value={selectedPermissions}
            inputValue={permissionInputValue}
            onInputChange={(event, newInputValue) =>
              setPermissionInputValue(newInputValue)
            }
            onChange={(event, newValue) => setSelectedPermissions(newValue)}
            getOptionLabel={(option) => option?.name || ""}
            isOptionEqualToValue={(option, value) =>
              option?.name === value?.name
            }
            filterOptions={(options, params) => {
              const { inputValue } = params;
              return options.filter((perm) =>
                perm.name.toLowerCase().includes(inputValue.toLowerCase())
              );
            }}
            getOptionDisabled={(option) =>
              rolePermissions.some(
                (assigned) => assigned.permission === option.name
              )
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Permissions"
                variant="outlined"
                size="small"
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.name}>
                {option.name}
              </li>
            )}
            noOptionsText="No Permissions Available."
          />
          <button
            onClick={handleAddPermissionRole}
            disabled={assigning || loading}
            className="permission-button"
          >
            {assigning ? "Adding..." : "Add"}
          </button>
        </div>
        <div className="data-grid-section">
          <StyledDataGrid
            rows={rolePermissions}
            columns={columns}
            loading={loading || loadingAction}
            localeText={{
              noRowsLabel: "No Permission assigned to this role",
            }}
          />
        </div>
        <div className="AlertMessages">
          <FlyoutAlerts />
        </div>
      </div>
    </>
  );
};

export default RolePermission;
