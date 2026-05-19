import React, { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { deleteUser, fetchUsersByAppName } from "../../../services/userService";
import NewUser from "./NewUser";
import EditUser from "./EditUser";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import {
  showConfirmation,
  showAlert,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const User = () => {
  const { Alert } = useContext(AlertsContext);
  const [usersData, setUsersData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [createUserDrawerStatus, setCreateUserDrawerStatus] = useState(false);
  const [editUserDrawerStatus, setEditUserDrawerStatus] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsersData = async () => {
    setLoadingData(true);
    try {
      const users = await fetchUsersByAppName();
      const sortedData = users.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setUsersData(sortedData);
    } catch (error) {
      Alert("Failed to load user data. Please try again.", "error");
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const columns = [
    {
      field: "firstName",
      headerName: "First Name",
      flex: 0.3,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      flex: 0.3,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 0.5,
    },
    {
      field: "departmentRef",
      headerName: "Department",
      flex: 0.4,
      valueGetter: (_value, row) => row.departmentRef?.name ?? "",
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 0.2,
      valueGetter: (_value, row) => (row.isActive ? "Active" : "Inactive"),
    },
    {
      field: "roles",
      headerName: "Roles",
      flex: 1,
      valueGetter: (_value, row) =>
        row.roles.map((role) => role?.roleName).join(", "),
    },
    {
      field: " ",
      headerName: "",
      width: 50,
      renderCell: ({ row }) => {
        const handleDeleteClick = async (id) => {
          const confirmed = await showConfirmation(
            "Delete User?",
            "Are you sure you want to delete this user?"
          );

          if (!confirmed) return;

          try {
            await deleteUser(id);
            await fetchUsersData();
            showAlert("success", "Deleted!", "User deleted successfully.");
          } catch (error) {
            showAlert("error", "Error", "Failed to delete user.");
            console.error("Delete error:", error);
          }
        };

        return (
          <ion-icon
            style={{ color: "red", cursor: "pointer" }}
            name="trash-outline"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.id);
            }}
          ></ion-icon>
        );
      },
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Users</p>
          <Button onClick={() => setCreateUserDrawerStatus(true)}>
            + Add New
          </Button>
        </div>
        <div className="DataGridDiv">
          <StyledDataGrid
            rows={usersData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedUser(params.row);
              setEditUserDrawerStatus(true);
            }}
            pageSize={5}
            className="DataGrid"
            loading={loadingData}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createUserDrawerStatus}
          onClose={() => setCreateUserDrawerStatus(false)}
        >
          <NewUser
            fetchUsersData={fetchUsersData}
            handleCloseClick={() => setCreateUserDrawerStatus(false)}
            usersData={usersData}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editUserDrawerStatus}
          onClose={() => setEditUserDrawerStatus(false)}
        >
          <EditUser
            fetchUsersData={fetchUsersData}
            handleCloseClick={() => setEditUserDrawerStatus(false)}
            selectedUserData={selectedUser}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default User;
