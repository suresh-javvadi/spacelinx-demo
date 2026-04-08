import React, { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { fetchRoles, deleteRole } from "../../services/roleService";
import NewRole from "./NewRole";
import EditRole from "./EditRole";
import {
  showConfirmation,
  showAlert,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";
import "../../features/features.css";
import ResizableDrawer from "../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const Roles = () => {
  const { Alert } = useContext(AlertsContext);
  const [rolesData, setRolesData] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [createRoleDrawerOpen, setCreateRoleDrawerOpen] = useState(false);
  const [editRoleDrawerOpen, setEditRoleDrawerOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const handleCloseClick = () => {
    setCreateRoleDrawerOpen(false);
    setEditRoleDrawerOpen(false);
  };

  const handleRefresh = () => {
    setLoadingData(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const roles = await fetchRoles();
      if (roles) {
        roles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRolesData(roles);
      }
    } catch (error) {
      Alert("Error fetching Roles Data", "error");
      console.error("Error fetching roles data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "roleName",
      headerName: "Role Name",
      flex: 1,
    },
    {
      field: "roleDescription",
      headerName: "Role Description",
      flex: 1,
    },
    {
      field: "systemDefined",
      headerName: "System Defined",
      flex: 1,
      renderCell: ({ row }) => (
        <span>{row.systemDefined ? "True" : "False"}</span>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const handleDeleteClick = async (roleId) => {
          const confirmed = await showConfirmation(
            "Delete Role?",
            "Are you sure you want to delete this role?"
          );

          if (!confirmed) return;

          try {
            await deleteRole(roleId);
            handleRefresh();
            await fetchRoles();
            showAlert("success", "Deleted!", "Role deleted successfully.");
          } catch (error) {
            showAlert("error", "Error", "Failed to delete role.");
            console.error("Delete error:", error);
          }
        };
        const isSystemDefined = row.systemDefined;
        return (
          <ion-icon
            name="trash-outline"
            style={{
              color: isSystemDefined ? "gray" : "red",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isSystemDefined) {
                handleDeleteClick(row.id);
              }
            }}
          />
        );
      },
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Roles</p>
          <Button onClick={() => setCreateRoleDrawerOpen(true)}>
            + Add New
          </Button>
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={rolesData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedRole(params.row);
              setEditRoleDrawerOpen(true);
            }}
            getRowId={(row) => row.id}
            className="DataGrid"
            pageSize={5}
            loading={loadingData}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createRoleDrawerOpen}
          onClose={handleCloseClick}
        >
          <NewRole
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editRoleDrawerOpen}
          onClose={handleCloseClick}
        >
          <EditRole
            selectedRole={selectedRole}
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Roles;
