import React, { useState, useEffect, useContext } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { fetchWorkOrderWithPackageId } from "../../services/WOrderService";
import "./workOrder.css";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Drawer, Menu, MenuItem, IconButton, Button } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { unAssignKit } from "../../services/WorkOrderPackage";
import ChildKitData from "../materialKits/ChildKitData";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { AlertsContext } from "../AlertsContext/Context";
import WorkOrderInfo from "./workOrderInfo";
import { fetchWorkOrderStepsWithId } from "../../services/WOrderService";
import { DrawerContext } from "../../DrawerContext";
import { ProductContext } from "../products/prodcutContext";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Cliploader from "../../Components/Loaders/Cliploader";
import { useUserContext } from "../userContext/UserContext";
import ResizableDrawer from "../../Components/ResizableDrawer/ResizableDrawer";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const WorkOrders = () => {
  const { hasPermission } = useUserContext();
  const { isDrawerOpen } = useContext(DrawerContext);
  const { Alert } = useContext(AlertsContext);
  const { workPackageId } = useParams();
  const [subworkorderDetails, setsubWorkorderDetails] = useState([]);
  const [loadsubworkorderData, setLoadsubworkorderData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [workOrderDetailsDrawerStatus, setWorkOrderDetailsDrawerStatus] =
    useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [selectedKitData, setSelectedKitData] = useState(null);
  const [openKitDataDrawer, setOpenKitDataDrawer] = useState(false);
  const [stepData, setStepData] = useState([]);
  const [assignKit, setAssignKit] = useState();
  const [assignProduct, setAssignProduct] = useState();
  const [assignManager, setAssignManager] = useState();
  const [assignTechnician, setAssignTechnician] = useState();
  const { setSelectedProductId } = useContext(ProductContext);
  const [loadingWorkOrderData, setLoadingWorkOrderData] = useState(true);
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    navigate(`/product`);
  };

  useEffect(() => {
    const fetchWorkOrderStepsDetails = async () => {
      if (selectedWorkOrderId) {
        setLoadingData(true);
        try {
          const data = await fetchWorkOrderStepsWithId(selectedWorkOrderId);
          setStepData(data);
        } catch (error) {
          console.error("Error fetching work order steps:", error);
        } finally {
          setLoadingData(false);
        }
      }
    };
    fetchWorkOrderStepsDetails();
  }, [selectedWorkOrderId]);

  useEffect(() => {
    if (!workPackageId) {
      return;
    }
    if (workPackageId) {
      fetchWorkOrderData();
    }
  }, [workPackageId, loadsubworkorderData]);

  const fetchWorkOrderData = async () => {
    setLoadingWorkOrderData(true);
    if (!workPackageId) {
      console.error("workOrderId is not defined");
      return;
    }
    try {
      const data = await fetchWorkOrderWithPackageId(workPackageId);
      if (data) {
        data.sort((a, b) => {
          if (a.number < b.number) return -1;
          if (a.number > b.number) return 1;
          return 0;
        });
        setsubWorkorderDetails(data);
        setSelectedWorkOrder(data[0]);
        setSelectedWorkOrderId(data[0]?.id);
        setLoadsubworkorderData(false);
      }
    } catch (error) {
      Alert("Error Fetching Data", "error");
      console.error("Error fetching data:", error);
    } finally {
      setLoadingWorkOrderData(false);
    }
  };

  const handleAssign = (type, row) => {
    setAssignKit(type === "kit");
    setAssignProduct(type === "product");
    setAssignManager(type === "manager");
    setAssignTechnician(type === "technician");
    setWorkOrderDetailsDrawerStatus(true);
    setSelectedWorkOrder(row);
  };

  const renderAssignButton = (type, row) => {
    let requiredPermission;

    switch (type) {
      case "kit":
        requiredPermission = hasPermission(PERMISSIONS.WORKORDERS.ASSIGN_KIT);
        break;
      case "product":
        requiredPermission = hasPermission(
          PERMISSIONS.WORKORDERS.ASSIGN_PRODUCT
        );
        break;
      case "technician":
        requiredPermission = hasPermission(
          PERMISSIONS.WORKORDERS.ASSIGN_TECHNICIAN
        );
        break;
      default:
        requiredPermission = null;
    }

    return (
      <Button
        className="KitAssignBtn"
        disabled={!requiredPermission}
        onClick={() => {
          if (requiredPermission) {
            handleAssign(type, row);
          } else {
            Alert("You do not have permission to assign this.", "warning");
          }
        }}
      >
        Assign
      </Button>
    );
  };

  const renderMenu = (type, row, anchorEl, setAnchorEl, handleUnAssign) => {
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
      if (!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)) return;
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    return (
      <>
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
          disabled={!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)}
          className={
            !hasPermission(PERMISSIONS.WORKORDERS.MODIFY)
              ? "WOMenuDisabled"
              : undefined
          }
        >
          <MoreHorizIcon className="WOkitLinkTag" />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              if (!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)) return;
              handleAssign(type, row);
              handleClose();
            }}
          >
            <EditIcon style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
          {handleUnAssign && (
            <MenuItem
              onClick={() => {
                if (!hasPermission(PERMISSIONS.WORKORDERS.DELETE)) return;
                handleUnAssign(row.id);
                handleClose();
              }}
            >
              <DeleteIcon style={{ marginRight: 8 }} />
              Delete
            </MenuItem>
          )}
        </Menu>
      </>
    );
  };

  const columns = [
    {
      field: "number",
      headerName: "Number",
      flex: 0.9,
      renderCell: ({ row, value }) => {
        const { kit, technician, manager, guideId } = row;
        const allAvailable = kit && technician && manager;
        return allAvailable ? (
          <p
            className="AppHyperLink"
            onClick={() => {
              if (hasPermission(PERMISSIONS.WORKORDERS.VIEW) && guideId) {
                navigate(`/workorders/${row.number}/details/${row.id}`);
              } else if (!guideId) {
                handleAssign("", row);
              } else {
                Alert("You do not have access to view this..! ", "warning");
              }
            }}
          >
            {value}
          </p>
        ) : (
          <Link
            className="AppHyperLink"
            onClick={() => {
              if (!kit) {
                if (hasPermission(PERMISSIONS.WORKORDERS.ASSIGN_KIT)) {
                  Alert("Assign a Kit to proceed.", "error");
                } else {
                  Alert(
                    "You do not have permission to assign a Kit.",
                    "warning"
                  );
                }
              } else if (!manager) {
                Alert("Manager is not Assigned. Please Assign...", "error");
              } else if (!technician) {
                if (hasPermission(PERMISSIONS.WORKORDERS.ASSIGN_TECHNICIAN)) {
                  Alert(
                    "Technician is not assigned. Please assign one.",
                    "error"
                  );
                } else {
                  Alert(
                    "You do not have permission to assign a Technician.",
                    "warning"
                  );
                }
              }
            }}
          >
            {value}
          </Link>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.6,
    },
    {
      field: "kit",
      headerName: "Kit Number",
      flex: 1,
      renderCell: ({ row }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        return row.kit ? (
          <div className="MKAssignedWO">
            <Link
              className="WOkitLinkTag"
              onClick={() => {
                if (!hasPermission(PERMISSIONS.MATERIALKITS.VIEW)) {
                  Alert("You do not have permission to view Kits.", "warning");
                  return;
                }

                const data = {
                  ...row.kit,
                  part: row.part,
                  workOrder: {
                    name: row.name,
                    number: row.number,
                  },
                };
                setSelectedKitData(data);
                setOpenKitDataDrawer(true);
              }}
            >
              {row.kit.number}
            </Link>
            {(row.status === "Pending" || row.status === "Assigned") &&
              renderMenu("kit", row, anchorEl, setAnchorEl, handleUnAssignKit)}
          </div>
        ) : (
          renderAssignButton("kit", row)
        );
      },
    },
    {
      field: "product",
      headerName: "Product",
      flex: 0.7,
      renderCell: ({ row }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        return row.product ? (
          <div className="MKAssignedWO">
            <span
              className="WOkitLinkTag"
              onClick={() => handleProductClick(row.product.id)}
            >
              {row.product?.name}
            </span>
            {renderMenu("product", row, anchorEl, setAnchorEl)}
          </div>
        ) : (
          renderAssignButton("product", row)
        );
      },
    },
    {
      field: "Manager",
      headerName: "Manager",
      flex: 0.7,
      renderCell: ({ row }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        return row.manager ? (
          <div>
            <span>{`${row.manager.firstName} ${row.manager.lastName}`}</span>
            {row.status === "Pending" &&
              renderMenu("manager", row, anchorEl, setAnchorEl)}
          </div>
        ) : (
          renderAssignButton("manager", row)
        );
      },
    },
    {
      field: "technician",
      headerName: "Technician",
      flex: 0.7,
      renderCell: ({ row }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        return row.technician ? (
          <div>
            <span>{`${row.technician.firstName} ${row.technician.lastName}`}</span>
            {row.status === "Pending" &&
              renderMenu("technician", row, anchorEl, setAnchorEl)}
          </div>
        ) : (
          renderAssignButton("technician", row)
        );
      },
    },
    {
      field: "actualEndDate",
      headerName: "Due Date",
      flex: 0.5,
      valueGetter: (_value, row) => {
        const originalDate = row?.endDate;
        if (originalDate) {
          const formattedDate = new Date(originalDate).toLocaleDateString();
          return formattedDate;
        }
        return "---";
      },
    },
    {
      field: "Details",
      headerName: "",
      flex: 0.01,
      renderCell: ({ row }) => (
        <ion-icon
          onClick={() => {
            handleAssign("", row);
          }}
          name="information-circle-outline"
          style={{ color: "#6366F1", fontSize: "18px" }}
        ></ion-icon>
      ),
    },
  ];

  const filteredSubWorkorderData = subworkorderDetails.filter(
    (subworkorder) => {
      const number = subworkorder.number?.toLowerCase();
      const status = subworkorder.status?.toLowerCase();
      const kit = subworkorder.childKit?.number?.toLowerCase();
      const query = searchQuery.toLowerCase();

      return (
        number?.includes(query) ||
        status?.includes(query) ||
        kit?.includes(query)
      );
    }
  );

  const totalSteps = stepData?.length || 0;
  const completedSteps = stepData?.filter(
    (task) => task.workorderstepstatus === "Completed"
  ).length;

  const progressValue =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleUnAssignKit = async (id) => {
    setLoadingData(true);
    try {
      const data = await unAssignKit(id);
      fetchWorkOrderData();
      Alert("Kit UnAssigned Successfully..!", "success");
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };
  return (
    <div className="MOrderDetailsMain">
      <div className="WorkOrderStepDetails">
        <div className="WOBreadCrumb">
          <Link
            to="/WorkOrders"
            className="WorkOrderBreadCrumb"
            style={{ paddingRight: "5px" }}
          >
            Work Orders
          </Link>
          <ion-icon name="chevron-forward-outline"></ion-icon>
          <p className="stepDetailBreadCrumb"> {selectedWorkOrder?.number}</p>
        </div>
        <div className="SubWODetails">
          <div className="SubWorkOrderDetailsInner">
            <div className="SubWorkOrderDetailsHeader">
              <div className="PartDetails">
                <p>{selectedWorkOrder?.part?.name}</p>
                <p className="PartNumber">
                  / {selectedWorkOrder?.part?.partNumber}
                </p>
              </div>
              <input
                type="search"
                placeholder="Search Here"
                className="SearchBar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <StyledDataGrid
              rows={filteredSubWorkorderData}
              columns={columns}
              loading={loadingWorkOrderData}
              className="MOrderDetailsDataGrid"
              onCellClick={(params) => {
                if (
                  (params.field === "technician" &&
                    params.row.status !== "InProgress") ||
                  params.field === "kit" ||
                  params.field === "product"
                ) {
                  return;
                }
                setSelectedWorkOrderId(params.row.id);
              }}
            />
          </div>
          <div
            className={isDrawerOpen ? "draweropen" : "MOrderStepDetails"}
            inert={isDrawerOpen ? "true" : undefined}
          >
            <h2>Details</h2>
            <div className="LinearProgressBar">
              <LinearProgress
                variant="determinate"
                className="LinearProgress"
                value={progressValue}
              />
              <p>{progressValue.toFixed(2)}% Completed!</p>
            </div>
            <div className="WOStepsList">
              {stepData?.map((item) => {
                let status = item.workorderstepstatus;

                return (
                  <div
                    className={`StepDetailsInner ${
                      status === "Completed"
                        ? "Completed"
                        : status === "InProgress"
                        ? "InProgress"
                        : ""
                    }`}
                    key={item.guidestepsequence}
                  >
                    <p>
                      <strong>Step {item.guidestepsequence}/ </strong>
                      <strong>{item.guidestepname}</strong>
                    </p>
                    <p>No of Tasks: {item.numberofguidesteptasks}</p>
                    <p>
                      Time Taken:{" "}
                      {item.capturedtime ? item.capturedtime : "00:00:00"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <ResizableDrawer
        anchor="right"
        open={workOrderDetailsDrawerStatus}
        onClose={() => setWorkOrderDetailsDrawerStatus(false)}
      >
        <WorkOrderInfo
          workOrderDetailsDrawerStatus={workOrderDetailsDrawerStatus}
          setMainMOrderLoadingData={setLoadingData}
          handleCloseClick={() => setWorkOrderDetailsDrawerStatus(false)}
          handleRefresh={fetchWorkOrderData}
          assignKit={assignKit}
          assignProduct={assignProduct}
          assignManager={assignManager}
          assignTechnician={assignTechnician}
          workOrderData={selectedWorkOrder}
          packageData={selectedWorkOrder}
          // showComplete={!selectedWorkOrder?.guideId}
        />
      </ResizableDrawer>{" "}
      <ResizableDrawer
        anchor="right"
        open={openKitDataDrawer}
        onClose={() => {
          setOpenKitDataDrawer(false);
          setSelectedKitData([]);
        }}
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
  );
};

export default WorkOrders;
