import React, { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import {
  deletePermission,
  fetchPermissions,
} from "../../../services/permissionService";
import CreatePermissions from "./CreatePermission";
import EditPermission from "./EditPermission";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const Permissions = () => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [permissionsData, setPermissionsData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [existingPermissionNames, setExistingPermissionNames] = useState([]);
  const handleCloseDrawer = () => {
    setCreateDrawerOpen(false);
    setEditDrawerOpen(false);
  };

  const handleRefresh = () => {
    setLoadingData(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchPermissions();
      if (data) {
        setExistingPermissionNames(data.map((p) => p.name));
        const sortedData = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPermissionsData(sortedData);
      }
    } catch (err) {
      console.error("Error fetching Permissions:", err);
      Alert("Error fetching Permissions", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "categoryName",
      headerName: "Category Name",
      flex: 1,
    },
    {
      field: " ",
      headerName: "",
      width: 50,
      renderCell: ({ row }) => {
        const handleDeleteClick = async (name) => {
          const confirmed = await showConfirmation(
            "Delete Permission?",
            "Are you sure you want to delete this Permission?"
          );

          if (!confirmed) return;

          try {
            await deletePermission(name);
            handleRefresh();
            showAlert(
              "success",
              "Deleted!",
              "Permission deleted successfully."
            );
          } catch (error) {
            showAlert("error", "Error", "Failed to delete Permission.");
            console.error("Delete error:", error);
          }
        };

        return (
          <ion-icon
            style={{ color: "red", cursor: "pointer" }}
            name="trash-outline"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row?.name);
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
          <p className="PageHeader">Permissions</p>
          <Button onClick={() => setCreateDrawerOpen(true)}>+ Add New</Button>
        </div>

        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={permissionsData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedId(params.row.id);
              setSelectedRowData(params.row);
              setEditDrawerOpen(true);
            }}
            className="DataGrid"
            pageSize={5}
            loading={loadingData}
          />
        </div>

        <ResizableDrawer
          anchor="right"
          open={editDrawerOpen}
          onClose={handleCloseDrawer}
        >
          <EditPermission
            selectedId={selectedId}
            selectedRowData={selectedRowData}
            setMainLoadingData={setLoadingData}
            handleCloseClick={handleCloseDrawer}
            handleRefresh={handleRefresh}
            existingPermissionNames={existingPermissionNames}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={createDrawerOpen}
          onClose={handleCloseDrawer}
        >
          <CreatePermissions
            setMainLoadingData={setLoadingData}
            handleCloseClick={handleCloseDrawer}
            handleRefresh={handleRefresh}
            existingPermissionNames={existingPermissionNames}
          />
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Permissions;
