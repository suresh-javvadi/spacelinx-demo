import React, { useEffect, useState, useContext } from "react";
import { Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { AlertsContext } from "../../AlertsContext/Context";
import {
  fetchInventoryPartPurchaseHistory,
  fetchInventoryPartIssuedHistory,
} from "../../../services/inventoryPartService";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";

const TransactionHistory = ({ partId }) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [purchaseHistoryData, setPurchaseHistoryData] = useState([]);
  const [issuedHistoryData, setIssuedHistoryData] = useState([]);
  const [subTab, setSubTab] = useState("1");

  const fetchPurchaseHistoryData = async () => {
    try {
      const data = await fetchInventoryPartPurchaseHistory(partId);
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPurchaseHistoryData(data);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      Alert("Error fetching purchase history", "error");
    }
  };

  const fetchIssuedHistoryData = async () => {
    try {
      const data = await fetchInventoryPartIssuedHistory(partId);
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setIssuedHistoryData(data);
    } catch (error) {
      if (error?.response?.status === 404) {
        setIssuedHistoryData([]);
        return;
      }
      console.error("Error fetching issued history:", error);
      Alert("Error fetching issued history", "error");
    }
  };

  useEffect(() => {
    if (!partId) return;
    const load = async () => {
      setLoadingData(true);
      try {
        await Promise.all([fetchPurchaseHistoryData(), fetchIssuedHistoryData()]);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [partId]);

  const getPurchaseHistoryRowId = (row) =>
    row.id ||
    row.grnLineItemId ||
    row.grnId ||
    row.purchaseHistoryId ||
    `${row.grnNumber || "grn"}-${row.partId || "part"}-${row.receivedDate || "date"}-${row.trackingId || "track"}`;

  const getIssuedHistoryRowId = (row) =>
    row.id ||
    row.issuedHistoryId ||
    row.stockMovementLineItemId ||
    row.movementLineItemId ||
    `${row.movementNumber || "move"}-${row.partId || "part"}-${row.issuedDate || "date"}-${row.trackingId || "track"}`;

  const purchaseHistoryColumns = [
    { field: "poNumber", headerName: "PO", flex: 1 },
    { field: "grnNumber", headerName: "GRN", flex: 1 },
    {
      field: "receivedDate",
      headerName: "Received Date",
      flex: 1,
      type: "date",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    { field: "receivedBy", headerName: "Received By", flex: 1 },
    {
      field: "receivedQuantity",
      headerName: "Received Quantity",
      flex: 1,
      type: "number",
    },
    { field: "vendorName", headerName: "Vendor", flex: 1 },
    { field: "trackingId", headerName: "Tracking ID", flex: 1 },
    { field: "projectName", headerName: "Project", flex: 1 },
  ];

  const issuedHistoryColumns = [
    {
      field: "issuedDate",
      headerName: "Issued Date",
      flex: 1,
      type: "date",
      valueGetter: (value) => (value ? new Date(value) : null),
    },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "responsiblePerson", headerName: "Issued To", flex: 1 },
    {
      field: "issuedQuantity",
      headerName: "Issued Qty",
      flex: 1,
      type: "number",
    },
    { field: "trackingId", headerName: "Tracking ID", flex: 1 },
    { field: "projectName", headerName: "Project", flex: 1 },
  ];

  return (
    <div className="TransHistoryContainer">
      <TabContext value={subTab}>
        <TabList onChange={(_, v) => setSubTab(v)} variant="fullWidth">
          <Tab label="Purchase History" value="1" />
          <Tab label="Issue History" value="2" />
        </TabList>
        <TabPanel value="1" style={{ padding: 0, paddingTop: 12 }}>
          <div className="HistoryDataGridContainerFull">
            <StyledDataGrid
              rows={purchaseHistoryData}
              columns={purchaseHistoryColumns}
              loading={loadingData}
              getRowId={getPurchaseHistoryRowId}
              className="DataGrid"
              autoHeight={false}
            />
          </div>
        </TabPanel>
        <TabPanel value="2" style={{ padding: 0, paddingTop: 12 }}>
          <div className="HistoryDataGridContainerFull">
            <StyledDataGrid
              rows={issuedHistoryData}
              columns={issuedHistoryColumns}
              loading={loadingData}
              getRowId={getIssuedHistoryRowId}
              className="DataGrid"
              autoHeight={false}
            />
          </div>
        </TabPanel>
      </TabContext>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default TransactionHistory;
