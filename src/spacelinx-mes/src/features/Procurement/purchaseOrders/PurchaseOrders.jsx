import { useState, useEffect, useCallback, useContext } from "react";
import "../../../features/features.css";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { Button } from "@mui/material";
import {
  deletePO,
  fetchPurchaseOrders,
  fetchZohoCsvByIds,
} from "../../../services/purchaseOrders";
import "../../Procurement/procurement.css";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../userContext/UserContext";
import { showConfirmation } from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { Description } from "@mui/icons-material";

const PurchaseOrders = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const navigateTo = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState({
    type: "include",
    ids: new Set(),
  });
  const defaultHiddenColumns = {
    vendorCode: false,
    vendorContact: false,
    vendorPhone: false,
    deliveryDate: false,
    approvedBy: false,
    approvedDate: false,
    paymentTerm: false,
    projectCode: false,
    projectName: false,
    billingCity: false,
    shippingCity: false,
    requisitionNumber: false,
    description: false,
    __check__: false,
  };
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("purchaseOrderColumnVisibility");
    return saved ? JSON.parse(saved) : defaultHiddenColumns;
  });

  const columns = [
    {
      field: "number",
      headerName: "PO Number",
      flex: 1,
      renderCell: ({ row }) => (
        <p
          className="AppHyperLink"
          onClick={() => {
            if (hasPermission(PERMISSIONS.PURCHASEORDERS.VIEW)) {
              navigateTo(`/procurement/purchaseorders/${row.id}`);
            } else {
              Alert("You do not have access to view this..! ", "warning");
            }
          }}
        >
          {row.number}
        </p>
      ),
    },
    {
      field: "description",
      headerName: "Subject",
      flex: 1,
    },
    {
      field: "vendorName",
      headerName: "Vendor Name",
      flex: 1,
    },

    {
      field: "vendorCode",
      headerName: "Vendor Code",
      flex: 1,
    },
    {
      field: "vendorContact",
      headerName: "Vendor Contact",
      flex: 1,
    },
    {
      field: "vendorPhone",
      headerName: "Vendor Phone",
      flex: 1,
    },
    {
      field: "orderDate",
      headerName: "Order Date",
      flex: 1,
      type: "date",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    {
      field: "deliveryDate",
      headerName: "Delivery Date",
      flex: 1,
      type: "date",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Draft", "Submitted", "Issued", "Delivered", "Pending", "Cancelled"],
    },
    // {
    //   field: "deliveryStatus",
    //   headerName: "Delivery Status",
    //   flex: 1,
    //
    // },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      flex: 1,
      type: "number",
    },

    {
      field: "approvedBy",
      headerName: "Approved By",
      flex: 1,
    },
    {
      field: "approvedDate",
      headerName: "Approved Date",
      flex: 1,
      type: "date",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    {
      field: "paymentTerm",
      headerName: "Payment Term",
      flex: 1,
    },
    {
      field: "projectCode",
      headerName: "Project Code",
      flex: 1,
    },
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 1,
    },
    {
      field: "billingCity",
      headerName: "Billing City",
      flex: 1,
    },
    {
      field: "shippingCity",
      headerName: "Shipping City",
      flex: 1,
    },
    {
      field: "requisitionNumber",
      headerName: "Requisition Number",
      flex: 1,
    },
    ...(hasPermission(PERMISSIONS.PURCHASEORDERS.DELETE)
      ? [
          {
            field: "delete",
            headerName: " ",
            width: 50,
            sortable: false,
            filterable: false,
            hideable: false,
            renderCell: (row) => {
              const handleDelete = async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isConfirmed = await showConfirmation(
                  "Are you sure?",
                  `You Want to delete Purchase Order`,
                );

                if (isConfirmed) {
                  try {
                    await deletePO(row.id);
                    Alert("Purchase Order Deleted successfully!", "success");
                    fetchData();
                  } catch (error) {
                    Alert("Failed to delete Purchase Order!", "error");
                    console.error("Delete PO error:", error);
                  }
                }
              };

              return (
                <ion-icon
                  name="trash-outline"
                  onClick={handleDelete}
                  style={{
                    cursor: "pointer",
                    color: "#d32f2f",
                    fontSize: "18px",
                  }}
                ></ion-icon>
              );
            },
          },
        ]
      : []),
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const purchaseOrdersData = await fetchPurchaseOrders();

      if (purchaseOrdersData) {
        purchaseOrdersData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setPurchaseOrders(purchaseOrdersData);
      }
    } catch (error) {
      Alert("Error fetching Purchase Orders data", "error");
      console.error("Error fetching Purchase Orders data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
    if (shouldRefresh) {
      setShouldRefresh(false);
    }
  }, [shouldRefresh, fetchData]);

  const handleDownloadZohoCsv = async (ids) => {
    setIsLoading(true);
    try {
      const blob = await fetchZohoCsvByIds(ids);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PurchaseOrders_Zoho_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      Alert("Zoho CSV downloaded successfully!", "success");
    } catch (error) {
      console.error("Zoho CSV download failed:", error);
      Alert("Couldn't download Zoho CSV!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">Purchase Orders</p>
          </div>
          <div className="PoHeaderButtons">
            <Button
              disabled={(rowSelectionModel?.ids?.size || 0) > 0}
              onClick={() => {
                if (hasPermission(PERMISSIONS.PURCHASEORDERS.MODIFY)) {
                  navigateTo("/procurement/purchaseorders/new");
                } else {
                  Alert("You do not have access to create..!", "warning");
                }
              }}
            >
              + Add New
            </Button>
            <Button
              onClick={() => {
                let selectedIDs = [];
                if (rowSelectionModel.type === "include") {
                  selectedIDs = Array.from(rowSelectionModel.ids || []);
                } else if (rowSelectionModel.type === "exclude") {
                  const allIDs = purchaseOrders.map((po) => po.id);
                  selectedIDs = allIDs.filter(
                    (id) => !rowSelectionModel.ids.has(id),
                  );
                } else if (Array.isArray(rowSelectionModel)) {
                  selectedIDs = rowSelectionModel;
                }

                if (selectedIDs.length === 0) {
                  Alert("Please select at least one Purchase Order", "warning");
                  return;
                }

                handleDownloadZohoCsv(selectedIDs);
              }}
            >
              Download PO (Zoho)
            </Button>
          </div>
        </div>
        <div className="DataGridDiv">
          <StyledDataGrid
            rows={purchaseOrders}
            columns={columns}
            checkboxSelection
            className="DataGrid"
            pageSize={5}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(newModel) => {
              if (Array.isArray(newModel)) {
                setRowSelectionModel({
                  type: "include",
                  ids: new Set(newModel),
                });
              } else {
                setRowSelectionModel(newModel);
              }
            }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => {
              setColumnVisibilityModel(newModel);
              localStorage.setItem(
                "purchaseOrderColumnVisibility",
                JSON.stringify(newModel),
              );
            }}
            loading={isLoading}
            disableRowSelectionOnClick
          />
        </div>
        {/* 
          <ResizableDrawer
            anchor="right"
            open={drawerOpen}
            defaultWidth={75}
            onClose={() => {
              setDrawerOpen(false);
              setSelectedPO(null);
            }}
          >
            {drawerMode === "Create" ? (
              <CreatePurchaseOrder
                setDrawerOpen={setDrawerOpen}
                drawerMode={drawerMode}
                setShouldRefresh={setShouldRefresh}
                organizations={organizations}
              />
            ) : (
              drawerMode === "Edit" && (
                <UpdatePurchaseOrder
                  setDrawerOpen={setDrawerOpen}
                  drawerMode={drawerMode}
                  selectedRowId={selectedPO}
                  setShouldRefresh={setShouldRefresh}
                  organizations={organizations}
                />
              )
            )}
          </ResizableDrawer> */}
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default PurchaseOrders;
