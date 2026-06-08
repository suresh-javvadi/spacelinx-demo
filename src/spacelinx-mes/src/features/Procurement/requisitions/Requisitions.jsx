import React, { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import {
  deleteRequisition,
  fetchRequisitions,
  fetchMyApprovals,
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
import {
  fetchPartsWithGoodsAndServices,
  fetchUniqueParts,
} from "../../../services/partService";
import dayjs from "dayjs";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchUserLookup } from "../../../services/userService";
import { fetchDepartmentLookup } from "../../../services/departmentService";
import { useDeepLink } from "../../../DeepLinkContext";
import { useNavigate } from "react-router-dom";

const Requisitions = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission, isSuperAdmin, activeRole } = useUserContext();
  const { deepLinkInfo, clearDeepLink } = useDeepLink();
  const navigateTo = useNavigate();
  const [requisitionData, setRequisitionData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("MY_DEPT");
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projectsData, setProjectsData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [partsData, setPartsData] = useState([]);
  const [departments, setDepartments] = useState([]);

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
    fetchPartsData();
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

  const fetchPartsData = async () => {
    try {
      const [parts, goodsServices] = await Promise.all([
        fetchUniqueParts(),
        fetchPartsWithGoodsAndServices(),
      ]);

      const releasedParts = (parts || []).filter(
        (part) => part.status === "Release",
      );
      const onlyGoodsServices = (goodsServices || []).filter(
        (item) => item.itemType === "Goods" || item.itemType === "Services",
      );
      const merged = [
        ...releasedParts,
        ...onlyGoodsServices.filter(
          (gs) => !releasedParts.some((p) => p.id === gs.id),
        ),
      ];
      setPartsData(merged);
    } catch (error) {
      console.error("Failed to fetch parts data:", error);
      Alert("Failed to load parts data", "error");
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
  }, [activeTab]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      let dataPromise;
      if (activeTab === "ALL") {
        dataPromise = fetchRequisitions({ allDepartments: true });
      } else if (activeTab === "MY_APPROVALS") {
        dataPromise = fetchMyApprovals();
      } else {
        dataPromise = fetchRequisitions({ allDepartments: false });
      }

      const [data, departmentsData] = await Promise.all([
        dataPromise,
        fetchDepartmentLookup().catch(() => []),
      ]);

      const deptMap = new Map(
        (departmentsData ?? []).map((d) => [d.id, d.name]),
      );
      setDepartments(departmentsData ?? []);
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      const enriched = sortedData.map((row) => ({
        ...row,
        departmentName: row.departmentId
          ? (deptMap.get(row.departmentId) ?? "")
          : "",
      }));
      setRequisitionData(enriched);
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
      field: "departmentName",
      headerName: "Department",
      flex: 1,
      type: "singleSelect",
      valueOptions: departments.map((d) => d.name),
    },
    {
      field: "purchaseOrder",
      headerName: "Purchase Order",
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

        const poId = row.purchaseOrderId || row.poId || row.purchaseOrder?.id;

        if (isApprovedOrPoCreated) {
          if (isPoCreated) {
            return (
              <span
                className="AppHyperLink"
                title={"Open Purchase Order"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasPermission(PERMISSIONS.PURCHASEORDERS.VIEW)) {
                    Alert(
                      "You do not have permission to view Purchase Orders!",
                      "warning",
                    );
                    return;
                  }
                  if (!poId) {
                    Alert(
                      "Purchase Order ID is missing from the record!",
                      "error",
                    );
                    return;
                  }
                  navigateTo(`/procurement/purchaseorders/${poId}`);
                }}
              >
                {row.purchaseOrder?.number ||
                  row.purchaseOrder?.poNumber ||
                  row.poNumber ||
                  row.purchaseOrderNumber ||
                  "View PO"}
              </span>
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
      field: "poStatus",
      headerName: "PO Status",
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
        <div className="AdminChildrenHeader RequisitionsHeader">
          <div className="RequisitionsHeaderTitle">
            <p className="PageHeader">Requisitions</p>
          </div>
        </div>

        <div className="POContentDivHeader">
          <div className="AdminPageTabs">
            {(() => {
              const tabs = [];
              if (
                hasPermission(PERMISSIONS.REQUISITIONS.VIEW_ALL_DEPARTMENTS)
              ) {
                tabs.push({ key: "ALL", label: "ALL" });
              }
              tabs.push({ key: "MY_DEPT", label: "My Department" });
              if (hasPermission(PERMISSIONS.REQUISITIONS.APPROVER)) {
                tabs.push({ key: "MY_APPROVALS", label: "My Approvals" });
              }

              return tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`TabButton ${
                    activeTab === tab.key ? "Selected" : ""
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ));
            })()}
          </div>

          <div className="RequisitionsHeaderActions">
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
              partsData={partsData}
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
