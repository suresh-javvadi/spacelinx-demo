import React, { useEffect, useState, useContext } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { fetchInventoryTransactionsByPart } from "../../../services/inventoryTransaction";
import Cliploader from "../../../Components/Loaders/Cliploader";
import dayjs from "dayjs";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const InventoryTransaction = ({ partId }) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [inventoryTransactionData, setInventoryTransactionData] = useState([]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchInventoryTransactionsByPart(partId);
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInventoryTransactionData(data);
    } catch (error) {
      console.error(
        "Error fetching Inventory Transaction Data:",
        error?.response?.data || error.message,
      );
      Alert("Error fetching Inventory Transaction Data", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (partId) {
      fetchData();
    }
  }, [partId]);

  const columns = [
    {
      field: "transactionDate",
      headerName: "Transaction Date",
      flex: 1,
      valueGetter: (value) => (value ? dayjs(value).format("DD-MM-YYYY") : ""),
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
      valueGetter: (_value, row) => row.fromLocationName || "-",
    },
    {
      field: "toLocationName",
      headerName: "To Location",
      flex: 1,
      valueGetter: (_value, row) => row.toLocationName || "-",
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
              e.stopPropagation();
              if (referenceId && referenceType === "PO") {
                window.open(
                  `/procurement/purchaseorders/${referenceId}`,
                  "_blank",
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
    <div className="InventoryTransactionContainer">
      <div className="PartsUsedInDataGrid">
        <StyledDataGrid
          rows={inventoryTransactionData}
          columns={columns}
          loading={loadingData}
          getRowId={(row) => row.id}
          className="DataGrid"
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          autoHeight={false}
        />
      </div>
    </div>
  );
};

export default InventoryTransaction;
