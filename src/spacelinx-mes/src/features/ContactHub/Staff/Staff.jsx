import { Button, Drawer } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { deleteStaff, fetchStaff } from "../../../services/staffService";
import { AlertsContext } from "../../AlertsContext/Context";
import {showAlert,showConfirmation } from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import EditStaff from "./EditStaff";
import NewStaff from "./NewStaff";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useUserContext } from "../../userContext/UserContext";
import { fetchAllOrganization } from "../../../services/organizationService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const Staff = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [createStaffDrawerOpen, setCreateStaffDrawerOpen] = useState(false);
  const [editStaffDrawerOpen, setEditStaffDrawerOpen] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [organizationData, setOrganizationData] = useState([]);
  const [loadOrganizationData, setLoadOrganizationData] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const staffData = await fetchStaff();
      if (staffData) {
        staffData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setStaffData(staffData);
      }
    } catch (error) {
      Alert("Error fetching Staff Data", "error");
      console.error("Error fetching Staff data:", error);
    } finally {
      setLoadingData(false);
    }
  };
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoadOrganizationData(true);

    try {
      const orgData = await fetchAllOrganization();
      if (orgData) setOrganizationData(orgData);
    } catch (error) {
      Alert("Error fetching organization data", "error");
      console.error("Fetch error:", error);
    } finally {
      setLoadOrganizationData(false);
    }
  };

  const handleCloseClick = () => {
    setCreateStaffDrawerOpen(false);
    setEditStaffDrawerOpen(false);
  };

  const handleRefresh = () => {
    setLoadingData(true);
    fetchData();
  };
  const handleDeleteClick = async (staffId) => {
    const confirmed = await showConfirmation(
      "Remove Staff?",
      "Are you sure you want to remove this Staff Details?"
    );

    if (!confirmed) return;

    try {
      await deleteStaff(staffId);
      Alert(`Staff details removed successfully!`, "success");
      handleRefresh();
      handleCloseClick();
      await fetchData();
      showAlert("success", "Removed!", "Staff Details removed successfully.");
    } catch (error) {
      showAlert("error", "Error", "Failed to delete role.");
      console.error("Delete error:", error);
    }
  };
  const columns = [
    {
      field: "staffNumber",
      headerName: "Staff No.",
      flex: 1,
    },
    {
      field: "staffName",
      headerName: "Staff Name",
      flex: 1,
      valueGetter: (value, row) => {
        const firstName = row?.firstName || "";
        const lastName = row?.lastName || "";
        return `${firstName} ${lastName}`.trim();
      },
      renderCell: ({ row }) => (
        <span>
          {row?.firstName}
          {"   "} {row?.lastName}
        </span>
      ),
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      flex: 1,
    },
    {
      field: "manager",
      headerName: "Manager",
      flex: 1,
      valueGetter: (value, row) => {
        if (row?.manager) {
          const firstName = row.manager?.firstName || "";
          const lastName = row.manager?.lastName || "";
          return `${firstName} ${lastName}`.trim();
        }
        return "NA";
      },
      renderCell: ({ row }) => (
        <span>
          {row.manager
            ? `${row?.manager?.firstName} ${row?.manager?.lastName}`
            : "NA"}
        </span>
      ),
    },
    {
      field: "organization",
      headerName: "Organization",
      flex: 1,
      valueGetter: (value, row) => {
        return row?.organization?.name || "NA";
      },
      renderCell: ({ row }) => (
        <span>{row.organization ? `${row?.organization?.name} ` : "NA"}</span>
      ),
    },
    {
      field: "employmentStartDate",
      headerName: "Joined On",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        return (
          <ion-icon
            name="trash-outline"
            style={{
              color: "red",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!hasPermission(PERMISSIONS.STAFF.DELETE)) {
                Alert("You do not have access to  delete.", "warning");
                return;
              }
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
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">STAFF</p>
          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.STAFF.MODIFY)) {
                Alert("You do not have access to create.", "warning");
                return;
              }
              setCreateStaffDrawerOpen(true);
            }}
          >
            + Add New
          </Button>
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={staffData}
            columns={columns}
            loading={loadingData}
            onRowClick={(params) => {
              setSelectedStaff(params.row);
              setEditStaffDrawerOpen(true);
            }}
            getRowId={(row) => row.id}
            className="DataGrid"
            pageSize={5}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createStaffDrawerOpen}
          onClose={handleCloseClick}
          PaperProps={{ className: "DrawerStyles" }}
        >
          <NewStaff
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            staffData={staffData}
            organizationData={organizationData}
            loadOrganizationData={loadOrganizationData}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editStaffDrawerOpen}
          onClose={handleCloseClick}
          PaperProps={{ className: "RoleDrawerStyles" }}
        >
          <EditStaff
            selectedStaff={selectedStaff}
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            staffData={staffData}
            handleDeleteClick={handleDeleteClick}
            organizationData={organizationData}
            loadOrganizationData={loadOrganizationData}
            loadingStaffData={loadingData}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Staff;
