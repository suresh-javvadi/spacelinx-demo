import React, { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import {
  deleteRequisition,
  fetchRequisitions,
} from "../../../services/requisitionService";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import NewRequisition from "./NewRequisition";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import EditRequisition from "./EditRequisition";
import { fetchProjectsLookup } from "../../../services/projectService";
import dayjs from "dayjs";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchUserLookup } from "../../../services/userService";
import { useDeepLink } from "../../../DeepLinkContext";
import { useNavigate } from "react-router-dom";

const Requisitions = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission, isSuperAdmin } = useUserContext();
  const { deepLinkInfo, clearDeepLink } = useDeepLink();
  const navigateTo = useNavigate();
  const [requisitionData, setRequisitionData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projectsData, setProjectsData] = useState([]);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    if (deepLinkInfo && deepLinkInfo.basePath === "/procurement/requisitions") {
      const matchedRequisition = requisitionData.find(
        (req) => req.id === deepLinkInfo.id,
      );
      if (matchedRequisition) {
        setSelectedRequisition(matchedRequisition);
        setDrawerOpen(true);

        clearDeepLink();
      }
    }
  }, [deepLinkInfo, requisitionData]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchUserLookup();
      setUserData(data);
    } catch (error) {
      Alert("Error fetching user data", "error");
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const fetchProjectsData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchProjectsLookup();
      setProjectsData(data);
    } catch (error) {
      console.error("Failed to fetch projects data:", error);
      Alert("Failed to fetch projects data. Please try again...!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedRequisition(null);
    setDrawerOpen(false);
  };

  const handleRefresh = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchRequisitions();
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setRequisitionData(sortedData);
    } catch (error) {
      console.error("Error fetching requisitions:", error);
      Alert("Failed to fetch requisitions", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "reqNumber",
      headerName: "Req No",
      flex: 1,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "userFullName",
      headerName: "Requested By",
      flex: 1,
    },
    {
      field: "requiredByDate",
      headerName: "Expected Date",
      flex: 1,
      type: "date",
      valueGetter: (_value, row) =>
        row.requiredByDate ? new Date(row.requiredByDate) : null,
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Low", "Medium", "High"],
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Draft", "Submitted", "Approved", "Rejected", "PoCreated"],
    },
    {
      field: "managerFullName",
      headerName: "Manager",
      flex: 1,
    },
    {
      field: "Create Purchase Order",
      headerName: "Create Purchase Order",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const statusNormalized = (row.status || "")
          .toString()
          .toLowerCase()
          .replace(/\s+/g, "");
        const isPoCreated =
          !!row.purchaseOrderId || statusNormalized === "pocreated";
        const isApprovedOrPoCreated =
          statusNormalized === "approved" || statusNormalized === "pocreated";

        const poId = row.poId || row.purchaseOrder?.id;

        if (isApprovedOrPoCreated) {
          if (isPoCreated) {
            return (
              <Button
                variant="outlined"
                size="small"
                title={"Open Purchase Order"}
                onClick={() => {
                  if (!hasPermission(PERMISSIONS.PURCHASEORDERS.VIEW)) {
                    Alert(
                      "You do not have permission to view Purchase Orders!",
                      "warning",
                    );
                    return;
                  }
                  navigateTo(`/procurement/purchaseorders/${poId}`);
                }}
              >
                View PO
              </Button>
            );
          }

          return (
            <Button
              variant="outlined"
              size="small"
              title={"Create Purchase Order"}
              onClick={() => {
                if (!hasPermission(PERMISSIONS.PURCHASEORDERS.MODIFY)) {
                  Alert(
                    "You do not have permission to create Purchase Orders!",
                    "warning",
                  );
                  return;
                }
                navigateTo(
                  `/procurement/purchaseorders/new?requisitionId=${row?.id}`,
                );
              }}
            >
              Create PO
            </Button>
          );
        }
        return null;
      },
    },
    {
      field: "actions",
      headerName: " ",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const handleDelete = async () => {
          const confirmed = await showConfirmation(
            "Delete Requisition?",
            "Are you sure you want to delete this requisition?",
          );
          if (!confirmed) return;

          try {
            await deleteRequisition(row?.id);
            showAlert(
              "success",
              "Deleted!",
              "Requisition deleted successfully.",
            );
            fetchData();
          } catch (error) {
            console.error("Delete error:", error);
            showAlert(
              "error",
              "Failed!",
              "Failed to delete requisition. Try again.",
            );
          }
        };

        return (
          <ion-icon
            name="trash-outline"
            onClick={(e) => {
              e.stopPropagation();
              if (!hasPermission(PERMISSIONS.REQUISITIONS.DELETE)) {
                Alert("You do not have access to delete..!", "warning");
                return;
              }
              handleDelete();
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
          <p className="PageHeader">Requisitions</p>
          <Button
            onClick={() => {
              if (hasPermission(PERMISSIONS.REQUISITIONS.MODIFY)) {
                setSelectedRequisition(null);
                setDrawerOpen(true);
              } else {
                Alert("You do not have access to create..!", "warning");
              }
            }}
            // className={
            // hasPermission(PERMISSIONS.REQUISITIONS.MODIFY)
            // ? undefined
            // : "IonIconDisabled"
            // }
          >
            + Add New
          </Button>
        </div>
        <div className="DataGridDiv RequisitionGrid">
          <StyledDataGrid
            rows={requisitionData}
            columns={columns}
            className="DataGrid"
            getRowId={(row) => row.id}
            pageSize={5}
            onRowClick={(params) => {
              if (hasPermission(PERMISSIONS.REQUISITIONS.VIEW)) {
                setSelectedRequisition(params.row);
                setDrawerOpen(true);
              } else {
                Alert("You do not have access to view this..! ", "warning");
              }
            }}
            loading={loadingData}
          />
        </div>

        <ResizableDrawer
          anchor="right"
          onClose={handleCloseDrawer}
          open={drawerOpen}
          PaperProps={{ className: "DrawerStyles" }}
        >
          {selectedRequisition ? (
            <EditRequisition
              handleCloseClick={handleCloseDrawer}
              handleRefresh={handleRefresh}
              projectsData={projectsData}
              selectedRequisition={selectedRequisition}
              userData={userData}
            />
          ) : (
            <NewRequisition
              handleCloseClick={handleCloseDrawer}
              handleRefresh={handleRefresh}
              projectsData={projectsData}
            />
          )}
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Requisitions;
