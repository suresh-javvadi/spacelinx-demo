import React, { useState, useEffect, useContext } from "react";
import { Drawer, Button } from "@mui/material";
import CreateWorkPackage from "./createWorkPackage";
import "./workOrder.css";
import {
  deleteWorkPackage,
  fetchWorkPackage,
  unAssignKit,
} from "../../services/WorkOrderPackage";
import { Link } from "react-router-dom";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { AlertsContext } from "../AlertsContext/Context";
import WorkOrderInfo from "./workOrderInfo";
import ChildKitData from "../materialKits/ChildKitData";
import { fetchPlatform } from "../../services/platformService";
import Cliploader from "../../Components/Loaders/Cliploader";
import {
  showConfirmation,
  showAlert,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { useUserContext } from "../userContext/UserContext";
import { useNavigate } from "react-router-dom";
import { usePartDetailsDrawer } from "../admin/parts/PartDetailsContext";
import ResizableDrawer from "../../Components/ResizableDrawer/ResizableDrawer";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const WorkPackages = () => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [workorderData, setworkorderData] = useState([]);
  const [createworkorderDrawerStatus, setCreateworkorderDrawerStatus] =
    useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [openKitDataDrawer, setOpenKitDataDrawer] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [selectedKitData, setSelectedKitData] = useState(null);
  const [workOrderDetailsDrawerStatus, setWorkOrderDetailsDrawerStatus] =
    useState(false);
  const handleCloseClick = () => {
    setCreateworkorderDrawerStatus(false);
    setWorkOrderDetailsDrawerStatus(false);
  };
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [loadingWorkPackage, setLoadingWorkPackage] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingWorkPackage(true);
    try {
      const data = await fetchWorkPackage();
      const platforms = await fetchPlatform();
      const enrichedData = data.map((workOrder) => {
        const platform = platforms.find(
          (p) => p.id === workOrder.guide?.platformId
        );
        return {
          ...workOrder,
          platform: platform ? platform.name : "Unknown",
        };
      });

      enrichedData.sort((a, b) => new Date(b.sequence) - new Date(a.sequence));
      setworkorderData(enrichedData);
    } catch (error) {
      Alert("Error Fetching Work Order Data", "error");
      console.error("Error fetching work order data:", error);
    } finally {
      setLoadingWorkPackage(false);
    }
  };
  const navigate = useNavigate();

  const columns = [
    {
      field: "platform",
      headerName: "Platform",
      flex: 1,
    },
    {
      field: "number",
      headerName: "Number",
      flex: 1,
      renderCell: ({ row, value }) => (
        <p
          className="AppHyperLink"
          onClick={() => {
            if (hasPermission(PERMISSIONS.WORKORDERS.VIEW)) {
              navigate(`/WorkOrders/${row.id}/WorkOrders`);
            } else {
              Alert("You do not have access to view this..! ", "warning");
            }
          }}
        >
          {value}
        </p>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "part.number",
      headerName: "Part Number",
      flex: 1,
      valueGetter: (_value, row) => (row.part ? row.part.partNumber : ""),
      renderCell: ({ row }) => (
        <div
          className="AppHyperLink"
          onClick={(e) => {
            e.stopPropagation();
            if (!row?.part) return;
            if (hasPermission(PERMISSIONS.PARTS.VIEW)) {
              openPartDetailsDrawer(row.part);
            } else {
              Alert("You do not have permission to view parts.", "error");
            }
          }}
        >
          {row?.part?.partNumber || "---"}
        </div>
      ),
    },
    {
      field: "part.name",
      headerName: "Part Name",
      flex: 1,
      valueGetter: (_value, row) => (row.part ? row.part.name : ""),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
    },
    {
      field: "actualStartDate",
      headerName: "Started On",
      flex: 0.7,
      valueGetter: (_value, row) => {
        const originalDate = row?.actualStartDate;
        if (originalDate) {
          return new Date(originalDate).toLocaleDateString();
        }
        return "---";
      },
    },
    {
      field: "actualEndDate",
      headerName: "Ended On",
      flex: 0.7,
      valueGetter: (_value, row) => {
        const originalDate = row?.actualEndDate;
        if (originalDate) {
          return new Date(originalDate).toLocaleDateString();
        }
        return "---";
      },
    },
    {
      field: "action",
      headerName: "",
      width: 10,
      renderCell: ({ row }) => {
        const handleDelete = async () => {
          const { status, id } = row;

          if (status === "Pending" || status === "Assigned") {
            const confirmed = await showConfirmation(
              "Delete Work Order?",
              "Are you sure you want to delete this work order?"
            );
            if (!confirmed) return;

            try {
              setLoadingData(true);
              await handleDeleteMOrder(id);
              showAlert(
                "success",
                "Deleted!",
                "Work Order deleted successfully."
              );
              await fetchData();
            } catch (error) {
              console.error("Delete error:", error);
              showAlert("error", "Failed!", "Couldn't delete the work order.");
            } finally {
              setLoadingData(false);
            }
          } else if (status === "Completed") {
            showAlert(
              "error",
              "Cannot Delete",
              "This Work Order has been completed and cannot be deleted."
            );
          } else {
            showAlert(
              "error",
              "Cannot Delete",
              "This Work Order has started execution and cannot be deleted."
            );
          }
        };

        return (
          <ion-icon
            name="trash-outline"
            onClick={(e) => {
              e.stopPropagation();
              if (!hasPermission(PERMISSIONS.WORKORDERS.DELETE)) return;
              handleDelete();
            }}
            class={
              !hasPermission(PERMISSIONS.WORKORDERS.DELETE)
                ? "IonIconDisabled"
                : undefined
            }
          />
        );
      },
    },
  ];

  const handleDeleteMOrder = async (id) => {
    setLoadingData(true);
    try {
      await deleteWorkPackage(id);
      fetchData();
      Alert("Order Deleted Successfully..!", "success");
    } catch (error) {
      console.error(error);
      Alert("Order Couldn't Deleted...!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Work Orders</p>
          <Button
            onClick={() => setCreateworkorderDrawerStatus(true)}
            disabled={!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)}
          >
            + Add New
          </Button>
        </div>
        <div className="DataGridDiv">
          <StyledDataGrid
            rows={workorderData}
            columns={columns}
            loading={loadingWorkPackage}
            className="DataGrid"
            pageSize={5}
            getRowId={(row) => row.id}
            onRowClick={(params) => {
              navigate(`/WorkOrders/${params.row.id}/WorkOrders`);
            }}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createworkorderDrawerStatus}
          onClose={handleCloseClick}
          PaperProps={{ className: "DrawerStyles" }}
        >
          <CreateWorkPackage
            setMainMOrderLoadingData={setLoadingData}
            handleCloseClick={handleCloseClick}
            handleRefresh={fetchData}
            setCreateworkorderDrawerStatus={setCreateworkorderDrawerStatus}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={workOrderDetailsDrawerStatus}
          onClose={handleCloseClick}
        >
          <WorkOrderInfo
            setMainMOrderLoadingData={setLoadingData}
            handleCloseClick={handleCloseClick}
            handleRefresh={fetchData}
            workOrderData={selectedWorkOrder}
          />
        </ResizableDrawer>{" "}
        <ResizableDrawer
          anchor="right"
          open={openKitDataDrawer}
          onClose={() => {
            setOpenKitDataDrawer(false);
            setSelectedKitData([]);
          }}
          PaperProps={{ className: "GuideStepDrawerStyles" }}
        >
          <ChildKitData
            childKitData={selectedKitData}
            setChildKitDataDrawer={setOpenKitDataDrawer}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default WorkPackages;
