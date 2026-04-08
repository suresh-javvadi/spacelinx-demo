import React, { useContext, useEffect, useState } from "react";
import { fetchAllInventoryTransactions } from "../../../services/inventoryTransaction";
import { AlertsContext } from "../../AlertsContext/Context";
import dayjs from "dayjs";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import StockMove from "./StockMove";
import { useUserContext } from "../../userContext/UserContext";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const StockMovements = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [inventoryTransactionsData, setInventoryTransactionsData] = useState(
    []
  );
  const [pageTabValue, setPageTabValue] = useState("All");
  const [loadingData, setLoadingData] = useState(true);
  const [stockMoveDrawerStatus, setStockMoveDrawerStatus] = useState(false);

  useEffect(() => {
    fetchAllInventoryTransactionsData();
  }, []);

  const fetchAllInventoryTransactionsData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchAllInventoryTransactions();
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setInventoryTransactionsData(sortedData);
    } catch (error) {
      Alert("Failed to fetch Inventory Transactions", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleCloseClick = () => {
    setStockMoveDrawerStatus(false);
  };

  const handleRefresh = () => {
    fetchAllInventoryTransactionsData();
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Stock Number",
      flex: 1,
    },
    {
      field: "partName",
      headerName: "Stock Name",
      flex: 1,
    },
    {
      field: "itemType",
      headerName: "Stock Type",
      flex: 1,
      valueGetter: (_value, row) =>
        row.itemType === null ? "Part" : row.itemType || "-",
    },
    {
      field: "transactionDate",
      headerName: "Transaction Date",
      flex: 1,
      valueGetter: (_value, row) =>
        row.transactionDate
          ? dayjs(row.transactionDate).format("DD-MM-YYYY")
          : "",
    },
    {
      field: "transactionType",
      headerName: "Transaction Type",
      flex: 1,
    },
    {
      field: "previousQuantity",
      headerName: "Previous Qty",
      flex: 1,
    },
    {
      field: "currentQuantity",
      headerName: "Current Qty",
      flex: 1,
    },
    {
      field: "transactedQuantity",
      headerName: "Transacted Qty",
      flex: 1,
    },
    {
      field: "fromLocationName",
      headerName: "From Location",
      flex: 1,
      valueGetter: (_value, row) => row?.fromLocationName || "-",
    },
    {
      field: "toLocationName",
      headerName: "To Location",
      flex: 1,
      valueGetter: (_value, row) => row?.toLocationName || "-",
    },
    {
      field: "createdByFullName",
      headerName: "Created By",
      flex: 1,
    },
    {
      field: "referenceNumber",
      headerName: "Reference",
      flex: 1,
      renderCell: ({ row }) => {
        const { referenceId, referenceNumber, referenceType } = row;
        return (
          <span
            onClick={(e) => {
              if (!hasPermission(PERMISSIONS.PURCHASEORDERS.VIEW)) {
                Alert(
                  "You don't have access to view Purchase Orders",
                  "warning"
                );
                return;
              }
              e.stopPropagation();
              if (referenceId && referenceType === "PO") {
                window.open(
                  `/procurement/purchaseorders/${referenceId}`,
                  "_blank"
                );
              } else {
                Alert("No valid reference found for this transaction", "info");
              }
            }}
            className="AppHyperLink"
          >
            {referenceNumber}
          </span>
        );
      },
    },
  ];

  return (
    <div className="AdminChildren">
      <div className="AdminChildrenHeader">
        <p className="PageHeader">Stock Movements</p>
      </div>{" "}
      <div className="StockMovementContentDiv">
        <div className="StockMovementContentDivHeader">
          {" "}
          <div className="AdminPageTabs">
            <button
              className={`TabButton ${
                pageTabValue === "All" ? "Selected" : ""
              }`}
              onClick={() => setPageTabValue("All")}
            >
              All
            </button>
            {hasPermission(PERMISSIONS.PURCHASEORDERS.DOCUMENTS.VIEW) && (
              <button
                className={`TabButton ${
                  pageTabValue === "Internal Transfer" ? "Selected" : ""
                }`}
                onClick={() => setPageTabValue("Internal Transfer")}
              >
                Internal Transfer
              </button>
            )}
            {hasPermission(PERMISSIONS.GOODSRECEIPTS.VIEW) && (
              <button
                className={`TabButton ${
                  pageTabValue === "Inward" ? "Selected" : ""
                }`}
                onClick={() => setPageTabValue("Inward")}
              >
                Inward
              </button>
            )}{" "}
            {hasPermission(PERMISSIONS.GOODSRECEIPTS.VIEW) && (
              <button
                className={`TabButton ${
                  pageTabValue === "Outward" ? "Selected" : ""
                }`}
                onClick={() => setPageTabValue("Outward")}
              >
                Outward
              </button>
            )}{" "}
            {hasPermission(PERMISSIONS.QUALITYCHECKS.VIEW) && (
              <button
                className={`TabButton ${
                  pageTabValue === " Quality Check" ? "Selected" : ""
                }`}
                onClick={() => setPageTabValue(" Quality Check")}
              >
                Quality Check
              </button>
            )}
          </div>{" "}
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.STOCKMOVEMENTS.MODIFY)) {
                Alert("You don't have access to move a stock", "warning");
                return;
              }
              if (pageTabValue === "All") {
                setStockMoveDrawerStatus(true);
              } else {
                Alert("Feature yet to Implement", "warning");
              }
            }}
            className="AddOrUpdateButton"
          >
            Move a Stock
          </button>
        </div>
      </div>
      <div className="StockMovementContentDataGridDiv">
        <StyledDataGrid
          rows={
            pageTabValue === "All"
              ? inventoryTransactionsData
              : pageTabValue === "Internal Transfer"
              ? []
              : pageTabValue === "Inward"
              ? []
              : []
          }
          columns={columns}
          className="DataGrid"
          loading={loadingData}
        />
      </div>
      <ResizableDrawer
        anchor="right"
        open={stockMoveDrawerStatus}
        onClose={handleCloseClick}
      >
        <StockMove
          handleCloseClick={handleCloseClick}
          handleRefresh={handleRefresh}
        />
      </ResizableDrawer>
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default StockMovements;
