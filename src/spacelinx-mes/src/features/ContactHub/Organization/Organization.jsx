import { Button } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { DataGrid } from "@mui/x-data-grid";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import {
  deleteOrganization,
  fetchAllOrganizationWithAddresses,
} from "../../../services/organizationService";
import { AlertsContext } from "../../AlertsContext/Context";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import EditOrganization from "./EditOrganization";
import NewOrganization from "./NewOrganization";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
const Organization = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(false);
  const [loadingOrgData, setLoadingOrgData] = useState(true);
  const [createOrganizationDrawerOpen, setCreateOrganizationDrawerOpen] =
    useState(false);
  const [editOrganizationDrawerOpen, setEditOrganizationDrawerOpen] =
    useState(false);
  const [OrganizationData, setOrganizationData] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadCategoryOptions, setLoadCategoryOptions] = useState(true);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadCategoryOptions(true);
    try {
      const data = await fetchOptionSetByName("organization_categories");
      if (data?.values) {
        const parsed = JSON.parse(data.values);
        setCategoryOptions(parsed);
      }
    } catch (err) {
      Alert("Failed to load categories", "error");
    } finally {
      setLoadCategoryOptions(true);
    }
  };

  const fetchData = async () => {
    setLoadingOrgData(true);
    try {
      const OrganizationData = await fetchAllOrganizationWithAddresses();
      if (OrganizationData) {
        OrganizationData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrganizationData(OrganizationData);
      }
    } catch (error) {
      Alert("Error fetching Organization Data", "error");
      console.error("Error fetching Organization data:", error);
    } finally {
      setLoadingOrgData(false);
    }
  };

  const handleCloseClick = () => {
    setCreateOrganizationDrawerOpen(false);
    setEditOrganizationDrawerOpen(false);
  };

  const handleRefresh = () => {
    setLoadingOrgData(true);
    fetchData();
  };
  const handleDeleteClick = async (OrganizationId) => {
    const confirmed = await showConfirmation(
      "Remove Organization?",
      "Are you sure you want to remove this Organization Details?"
    );

    if (!confirmed) return;

    try {
      await deleteOrganization(OrganizationId);
      Alert(`Organization details removed successfully!`, "success");
      handleRefresh();
      handleCloseClick();
      await fetchData();
      showAlert(
        "success",
        "Removed!",
        "Organization Details removed successfully."
      );
    } catch (error) {
      showAlert("error", "Error", "Failed to delete role.");
      console.error("Delete error:", error);
    }
  };
  const columns = [
    {
      field: "name",
      headerName: "Organization Name",
      flex: 1,
    },
    {
      field: "category",
      headerName: "Organization Category",
      flex: 1,
    },
    {
      field: "taxNumber",
      headerName: "Tax Number",
      flex: 1,
    },
    {
      field: "organizationAddress",
      headerName: "Address",
      flex: 1,
      renderCell: ({ row }) => {
        const orgAddresses = row.organizationAddresses;

        if (!Array.isArray(orgAddresses) || orgAddresses.length === 0) {
          return <span>No Address</span>;
        }

        const firstAddressObj = orgAddresses.find(
          (addr) => addr?.address && addr.address.addressLine1
        );

        if (!firstAddressObj || !firstAddressObj.address) {
          return <span>No Address</span>;
        }

        const { addressLine1, city, state } = firstAddressObj.address;

        const parts = [addressLine1, city, state].filter(
          (val) => val && val.trim() !== ""
        );

        return <span>{parts.length ? parts.join(", ") : "No Address"}</span>;
      },
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
              if (!hasPermission(PERMISSIONS.ORGANIZATION.DELETE)) {
                Alert("You do not have access to delete.", "warning");
                return;
              }

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
          <p className="PageHeader">Organization</p>
          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.ORGANIZATION.MODIFY)) {
                Alert("You do not have access to create.", "warning");
                return;
              }
              setCreateOrganizationDrawerOpen(true);
            }}
          >
            + Add New
          </Button>
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={OrganizationData}
            columns={columns}
            loading={loadingOrgData}
            onRowClick={(params) => {
              setSelectedOrganization(params.row);
              setEditOrganizationDrawerOpen(true);
            }}
            getRowId={(row) => row.id}
            className="DataGrid"
            pageSize={5}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createOrganizationDrawerOpen}
          onClose={handleCloseClick}
          PaperProps={{ className: "DrawerStyles" }}
        >
          <NewOrganization
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            OrganizationData={OrganizationData}
            categoryOptions={categoryOptions}
            loadCategoryOptions={loadCategoryOptions}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editOrganizationDrawerOpen}
          onClose={handleCloseClick}
          PaperProps={{ className: "RoleDrawerStyles" }}
        >
          <EditOrganization
            selectedOrganization={selectedOrganization}
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            OrganizationData={OrganizationData}
            handleDeleteClick={handleDeleteClick}
            categoryOptions={categoryOptions}
            loadCategoryOptions={loadCategoryOptions}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Organization;
