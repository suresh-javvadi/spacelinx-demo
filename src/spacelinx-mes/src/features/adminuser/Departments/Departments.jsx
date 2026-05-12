import { useEffect, useState, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import {
  fetchDepartments,
  deleteDepartment,
} from "../../../services/departmentService";
import NewDepartment from "./NewDepartment";
import EditDepartment from "./EditDepartment";
import {
  showConfirmation,
  showAlert,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const Departments = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [departments, setDepartments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchDepartments();
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDepartments(data);
    } catch (error) {
      Alert("Error fetching Departments", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClose = () => {
    setCreateDrawerOpen(false);
    setEditDrawerOpen(false);
  };

  const columns = [
    { field: "code", headerName: "Code", flex: 0.3 },
    { field: "name", headerName: "Name", flex: 0.5 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "parentDepartment",
      headerName: "Parent",
      flex: 0.4,
      valueGetter: (_value, row) => row.parentDepartment?.name ?? "",
    },
    {
      field: "headOfDepartmentUser",
      headerName: "Head",
      flex: 0.4,
      valueGetter: (_value, row) =>
        row.headOfDepartmentUser
          ? `${row.headOfDepartmentUser.firstName ?? ""} ${
              row.headOfDepartmentUser.lastName ?? ""
            }`.trim()
          : "",
    },
    {
      field: " ",
      headerName: "",
      width: 50,
      renderCell: ({ row }) => {
        const handleDeleteClick = async (id) => {
          if (!hasPermission(PERMISSIONS.DEPARTMENTS.DELETE)) {
            Alert("You do not have access to delete a Department", "warning");
            return;
          }
          const confirmed = await showConfirmation(
            "Delete Department?",
            "Are you sure you want to delete this department?"
          );
          if (!confirmed) return;
          try {
            await deleteDepartment(id);
            await fetchData();
            showAlert("success", "Deleted!", "Department deleted successfully.");
          } catch (error) {
            showAlert("error", "Error", "Failed to delete department.");
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
    <div className="AdminChildren">
      <div className="AdminChildrenHeader">
        <p className="PageHeader">Departments</p>
        <Button
          onClick={() => {
            if (hasPermission(PERMISSIONS.DEPARTMENTS.MODIFY)) {
              setCreateDrawerOpen(true);
            } else {
              Alert(
                "You do not have access to create a Department",
                "warning"
              );
            }
          }}
        >
          + Add New
        </Button>
      </div>
      <div className="DataGridDiv">
        <StyledDataGrid
          rows={departments}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(params) => {
            setSelectedDepartment(params.row);
            setEditDrawerOpen(true);
          }}
          pageSize={5}
          className="DataGrid"
          loading={loadingData}
        />
      </div>
      <ResizableDrawer
        anchor="right"
        open={createDrawerOpen}
        onClose={handleClose}
      >
        <NewDepartment
          handleClose={handleClose}
          handleRefresh={fetchData}
          existingDepartments={departments}
        />
      </ResizableDrawer>
      <ResizableDrawer
        anchor="right"
        open={editDrawerOpen}
        onClose={handleClose}
      >
        <EditDepartment
          selectedDepartment={selectedDepartment}
          handleClose={handleClose}
          handleRefresh={fetchData}
          existingDepartments={departments}
        />
      </ResizableDrawer>
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default Departments;
