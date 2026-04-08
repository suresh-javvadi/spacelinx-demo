import React, { useState, useEffect, useContext } from "react";
import { Autocomplete, TextField, Drawer } from "@mui/material";
import { fetchUsersByAppName } from "../../services/userService";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import {
  fetchUserRoleByRoleId,
  createUserRole,
  deleteUserRole,
} from "../../services/userRoleService";
import {
  showConfirmation,
  showAlert,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";
import Cliploader from "../../Components/Loaders/Cliploader";
import NewUser from "../adminuser/Users/NewUser";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const RoleUsers = ({ selectedRoleId }) => {
  const { Alert } = useContext(AlertsContext);
  const [usersData, setUsersData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [userInputValue, setUserInputValue] = useState("");
  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [loadingassignedUser, setloadingassignedUser] = useState(true);
  const fetchUsersData = async () => {
    try {
      const users = await fetchUsersByAppName();
      setUsersData(users);
    } catch (error) {
      Alert("Failed to load user data.", "error");
    }
  };

  const fetchUserRoles = async () => {
    setloadingassignedUser(true);
    try {
      const response = await fetchUserRoleByRoleId(selectedRoleId);

      const enrichedUsers = response
        .filter((user) => user.createdAt)
        .map((item) => {
          const userDetails = usersData.find((u) => u.id === item.userId);
          return {
            ...item,
            firstName: userDetails?.firstName || "",
            lastName: userDetails?.lastName || "",
            email: userDetails?.email || "",
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAssignedUsers(enrichedUsers);
    } catch (error) {
      Alert("Failed to load assigned users.", "error");
    }
    setloadingassignedUser(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUsersData();
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedRoleId && usersData.length > 0) {
      fetchUserRoles();
    }
  }, [selectedRoleId, usersData]);

  const handleAddUserRole = async () => {
    if (!selectedUser || !selectedUser.id || !selectedRoleId) {
      Alert("Please select a user.", "warning");
      return;
    }

    setAssigning(true);
    try {
      await createUserRole({
        userId: selectedUser.id,
        roleId: selectedRoleId,
      });
      Alert("User assigned to role successfully.", "success");
      setSelectedUser(null);
      setUserInputValue("");
      await fetchUserRoles();
    } catch (error) {
      Alert("Failed to assign or update user role.", "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteUserRole = async (userRoleId) => {
    const confirmed = await showConfirmation(
      "Are you sure you want to remove this user from the role?"
    );
    if (!confirmed) return;

    try {
      await deleteUserRole(userRoleId);
      showAlert("success", "Deleted!", "User removed from role.");
      await fetchUserRoles();
    } catch (error) {
      showAlert("error", "Error", "Failed to remove user from role.");
      console.error("Delete error:", error);
    }
  };

  const columns = [
    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "delete",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <ion-icon
          name="trash-outline"
          style={{ color: "red", cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteUserRole(row.id);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="role-permission-container">
        <div className="permission-controls-section">
          <Autocomplete
            disabled={assigning || loading}
            className="permission-autocomplete"
            options={[...usersData, { isAddNew: true, id: "add_new_user" }]}
            value={selectedUser}
            inputValue={userInputValue}
            onInputChange={(event, newInputValue) =>
              setUserInputValue(newInputValue)
            }
            onChange={(event, newValue) => {
              if (newValue?.isAddNew) {
                setOpenCreateDrawer(true);
              } else {
                setSelectedUser(newValue);
              }
            }}
            getOptionLabel={(option) =>
              option.isAddNew
                ? "Add New User"
                : `${option.firstName || ""} ${option.lastName || ""} || ${
                    option.email || ""
                  }`.trim()
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(options, { inputValue }) =>
              options.filter((user) => {
                if (user.isAddNew) return true;
                const fullName =
                  `${user.firstName} ${user.lastName}`.toLowerCase();
                const email = user.email?.toLowerCase() || "";
                return (
                  fullName.includes(inputValue.toLowerCase()) ||
                  email.includes(inputValue.toLowerCase())
                );
              })
            }
            getOptionDisabled={(option) =>
              !option.isAddNew &&
              assignedUsers.some((u) => u.userId === option.id)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select User"
                variant="outlined"
                size="small"
              />
            )}
            renderOption={(props, option) =>
              option.isAddNew ? (
                <li
                  {...props}
                  style={{
                    fontWeight: "bold",
                    color: "#009CBB",
                  }}
                >
                  Add New User
                </li>
              ) : (
                <li {...props}>
                  {`${option.firstName || ""} ${option.lastName || ""}`} ||{" "}
                  {option.email}
                </li>
              )
            }
            noOptionsText="No Users Available"
          />
          <button
            variant="contained"
            color="primary"
            onClick={handleAddUserRole}
            disabled={assigning || loading}
            className="permission-button"
          >
            {assigning ? "Adding..." : "Add"}
          </button>
        </div>

        <div className="data-grid-section">
          <StyledDataGrid
            rows={assignedUsers}
            columns={columns}
            loading={loadingassignedUser}
            getRowId={(row) => row.id}
            localeText={{ noRowsLabel: "No User attached to this role" }}
          />
        </div>

        <div className="AlertMessages">
          <FlyoutAlerts />
        </div>
      </div>
      <Drawer
        anchor="right"
        open={openCreateDrawer}
        onClose={() => setOpenCreateDrawer(false)}
        PaperProps={{ className: "DrawerStyles" }}
      >
        <NewUser
          fetchUsersData={fetchUsersData}
          handleCloseClick={() => setOpenCreateDrawer(false)}
          usersData={usersData}
          selectedRoleId={selectedRoleId}
        />
      </Drawer>
    </>
  );
};

export default RoleUsers;
