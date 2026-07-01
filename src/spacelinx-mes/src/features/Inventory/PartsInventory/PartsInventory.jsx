import React, { useEffect, useState, useContext } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { fetchInventoryPartWithPrice } from "../../../services/inventoryPartService";
import EditPartInventory from "./EditPartInventory";
import CurrencyConverter from "../../../Components/CurrencyConverter/CurrencyConverter";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { Button, Chip } from "@mui/material";
import "../Inventory.css";
import { useNavigate } from "react-router-dom";
import "../Inventory.css";
import { formatAmount } from "../../../utils/numberFormatter";

const PartsInventory = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const [partInventoryData, setPartInventoryData] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [rowSelectionModel, setRowSelectionModel] = useState({
    type: "include",
    ids: new Set(),
  });
  const defaultHiddenColumns = {
    qtyQcFailed: false,
    qtyQcPending: false,
    __check__: false,
  };
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const savedModel = localStorage.getItem("partsInventoryColumnVisibility");
    return savedModel ? JSON.parse(savedModel) : defaultHiddenColumns;
  });
  const selectedParts = React.useMemo(() => {
    if (!rowSelectionModel?.ids || rowSelectionModel.ids.size === 0) {
      return [];
    }

    return partInventoryData.filter((row) =>
      rowSelectionModel.ids.has(row.partId),
    );
  }, [rowSelectionModel, partInventoryData]);

  const normalizedRows = partInventoryData.map((row) => ({
    ...row,
    availablePrice: row.availablePrice ?? 0,
    reservedPrice: row.reservedPrice ?? 0,
    issuedPrice: row.issuedPrice ?? 0,
    totalPrice: row.totalPrice ?? 0,
    qtyOnhand: row.qtyOnhand ?? 0,
    qtyReserved: row.qtyReserved ?? 0,
    qtyIssued: row.qtyIssued ?? 0,
    qtyAvailable: row.qtyAvailable ?? 0,
    openingQty: row.openingQty ?? 0,
    openingPrice: row.openingPrice ?? 0,
  }));

  useEffect(() => {
    if (partInventoryData?.length) {
      const total = partInventoryData.reduce((sum, row) => {
        const qty = row.qtyAvailable || 0;
        const price = row.inventoryUnitPrice || 0;
        return sum + qty * price;
      }, 0);

      setTotalAmount(total);
    } else {
      setTotalAmount(0);
    }
  }, [partInventoryData]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchInventoryPartWithPrice();
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPartInventoryData(data);
    } catch (error) {
      console.error(
        "Error fetching Part Inventory Data:",
        error?.response?.data || error.message,
      );
      Alert("Error fetching Part Inventory Data", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [editDrawerOpen]);

  const handleClose = () => {
    setSelectedPart(null);
    setEditDrawerOpen(false);
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 1,
      renderCell: ({ row }) => (
        <span
          className="AppHyperLink"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPart(row.partNumberSuffix || row.partNumber);
            setEditDrawerOpen(true);
          }}
        >
          {row.partNumber}
        </span>
      ),
    },
    {
      field: "manufacturingPartNumber",
      headerName: "Manufacturing Part Number",
      flex: 1,
    },
    {
      field: "partName",
      headerName: "Part Name",
      flex: 1,
    },
    {
      field: "openingQty",
      headerName: "Opening Qty",
      flex: 1,
      type: "number",
      renderCell: ({ row }) => <p>{row?.openingQty ?? 0}</p>,
    },
    {
      field: "qtyAvailable",
      headerName: "Available Qty",
      flex: 1,
      type: "number",
      renderCell: ({ row }) => {
        const isLowStock = row.qtyAvailable < row.reorderLevel;

        return (
          <span
            className={`available-qty-cell ${isLowStock ? "low-stock" : ""}`}
          >
            {row.qtyAvailable ?? 0}
          </span>
        );
      },
    },
    // {
    //   field: "qtyOnhand",
    //   headerName: "On Hand Qty",
    //   flex: 1,
    //   type: "number",
    //   renderCell: ({ row }) => <p>{row?.qtyOnhand || 0}</p>,
    // },
    {
      field: "qtyReserved",
      headerName: "Reserved Qty",
      flex: 1,
      type: "number",
      renderCell: ({ row }) => <p>{row?.qtyReserved || 0}</p>,
    },
    {
      field: "qtyQcPending",
      headerName: "QC Pending Qty",
      flex: 1,
      type: "number",
      renderCell: ({ row }) => <p>{row?.qtyQcPending || 0}</p>,
    },
    {
      field: "qtyQcFailed",
      headerName: "QC Failed Qty",
      flex: 1,
      type: "number",
      renderCell: ({ row }) => <p>{row?.qtyQcFailed || 0}</p>,
    },
    {
      field: "qtyIssued",
      headerName: "Issued Qty",
      flex: 1,
      type: "number",
      renderCell: ({ row }) => <p>{row?.qtyIssued || 0}</p>,
    },

    ...(hasPermission(PERMISSIONS.PARTS.INVENTORY.PRICE)
      ? [
          // {
          //   field: "inventoryUnitPrice",
          //   headerName: "Unit Price",
          //   flex: 1,
          //   type: "number",
          //   valueFormatter: (_value, row) => {
          //     return `₹ ${
          //       row.inventoryUnitPrice?.toLocaleString("en-IN", {
          //         minimumFractionDigits: 2,
          //         maximumFractionDigits: 2,
          //       }) || "0.00"
          //     }`;
          //   },
          // },
          {
            field: "openingPrice",
            headerName: "Opening Price",
            flex: 1,
            type: "number",
            valueFormatter: (value) => formatAmount(value, 4),
          },
          {
            field: "availablePrice",
            headerName: "Available qty Price",
            flex: 1,
            type: "number",
            valueFormatter: (value) => formatAmount(value, 4),
          },
          {
            field: "reservedPrice",
            headerName: "Reserved Qty Price",
            flex: 1,
            type: "number",
            valueFormatter: (value) => formatAmount(value, 4),
          },
          {
            field: "issuedPrice",
            headerName: " Issued qty Price",
            flex: 1,
            type: "number",
            valueFormatter: (value) => formatAmount(value, 4),
          },
          {
            field: "totalPrice",
            headerName: "Total Price",
            flex: 1,
            type: "number",
            valueFormatter: (value) => formatAmount(value, 4),
          },
        ]
      : []),

    // skuCode column (always included)
    // {
    //   field: "skuCode",
    //   headerName: "SKU Code",
    //   flex: 1,
    //   renderCell: ({ row }) => <p>{row?.skuCode || "-"}</p>,
    // },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Parts Inventory</p>
          <div className="PageHeaderRight">
            <Button
              size="small"
              onClick={() => {
                if (selectedParts.length === 0) {
                  Alert("Please select at least one part to create a PO", "warning");
                  return;
                }
                navigate("/procurement/purchaseorders/new", { state: { selectedParts } });
              }}
            >
              Create PO
              {selectedParts.length > 0 && (
                <Chip label={selectedParts.length} size="small" className="parts-btn-badge" />
              )}
            </Button>
            <Button
              size="small"
              onClick={() => {
                if (selectedParts.length === 0) {
                  Alert("Please select at least one part to create a Stock Movement", "warning");
                  return;
                }
                navigate("/inventory/stockMovements", { state: { preSelectedParts: selectedParts } });
              }}
            >
              Move Stock
              {selectedParts.length > 0 && (
                <Chip label={selectedParts.length} size="small" className="parts-btn-badge" />
              )}
            </Button>
            {hasPermission(PERMISSIONS.PARTS.INVENTORY.PRICE) && (
              <div>
                <CurrencyConverter totalAmount={totalAmount} />
              </div>
            )}
          </div>
        </div>

        <div className="GrnDataGridWrapper">
          <StyledDataGrid
            rows={normalizedRows}
            columns={columns}
            getRowId={(row) => row.partId}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => {
              setColumnVisibilityModel(newModel);
              localStorage.setItem(
                "partsInventoryColumnVisibility",
                JSON.stringify(newModel),
              );
            }}
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(newSelectionModel) => {
              setRowSelectionModel(newSelectionModel);
            }}
            className="DataGrid"
            autoHeight={false}
            loading={loadingData}
            enableDensitySelector
            onRowClick={(params) => {
              setSelectedPart(
                params.row.partNumberSuffix || params.row.partNumber,
              );
              setEditDrawerOpen(true);
            }}
            checkboxSelection
            disableRowSelectionOnClick
            getRowClassName={(params) => {
              if (params.row.qtyAvailable < params.row.reorderLevel) {
                return "low-stock-row";
              }
            }}
            sx={{
              "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-checkboxInput":
                {
                  display: "none",
                },
            }}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={editDrawerOpen}
          onClose={handleClose}
          defaultWidth={75}
        >
          <EditPartInventory
            selectedPartNumberSuffix={selectedPart}
            handleCloseClick={handleClose}
          />
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default PartsInventory;
