import React, { useContext, useState } from "react";
import { Box, Button } from "@mui/material";
import { Search } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchInventoryStockReport } from "../../../services/inventoryStockReportService";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";

const columns = [
  { field: "partNo", headerName: "Part Number", flex: 1 },
  { field: "partName", headerName: "Part Name", flex: 1.5 },
  { field: "openingQty", headerName: "Opening Qty", type: "number", flex: 1 },
  {
    field: "purchaseQty",
    headerName: "Purchase Qty",
    type: "number",
    flex: 1,
  },
  {
    field: "consumptionQty",
    headerName: "Consumption Qty",
    type: "number",
    flex: 1,
  },
  { field: "closingQty", headerName: "Closing Qty", type: "number", flex: 1 },
  {
    field: "consumptionAmount",
    headerName: "Consumption Amount",
    type: "number",
    flex: 1,
  },
  {
    field: "closingBalance",
    headerName: "Closing Balance",
    type: "number",
    flex: 1,
  },
];

const StockReport = () => {
  const { Alert } = useContext(AlertsContext);
  const [openingDate, setOpeningDate] = useState(dayjs().startOf("month"));
  const [closingDate, setClosingDate] = useState(dayjs());
  const [rows, setRows] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleGenerateReport = async () => {
    if (!openingDate || !closingDate) {
      Alert("Please select both an opening and closing date.", "warning");
      return;
    }
    if (closingDate.isBefore(openingDate)) {
      Alert("Closing date must be on or after the opening date.", "warning");
      return;
    }

    setLoadingReport(true);
    try {
      const data = await fetchInventoryStockReport({
        from: openingDate.format("YYYY-MM-DD"),
        to: closingDate.format("YYYY-MM-DD"),
      });
      setRows(data.map((row, index) => ({ ...row, id: index })));
    } catch (error) {
      console.error("Error fetching stock report:", error);
      Alert("Failed to fetch stock report.", "error");
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="AdminChildren">
      <div className="AdminChildrenHeader">
        <p className="PageHeader">Stock Report</p>
      </div>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          width: "98%",
          margin: "20px 10px",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Opening Date"
            value={openingDate}
            onChange={(date) => setOpeningDate(date)}
            slotProps={{ textField: { sx: { width: 220 } } }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Closing Date"
            value={closingDate}
            onChange={(date) => setClosingDate(date)}
            slotProps={{ textField: { sx: { width: 220 } } }}
          />
        </LocalizationProvider>

        <Button
          variant="contained"
          onClick={handleGenerateReport}
          startIcon={<Search />}
          disabled={loadingReport}
          sx={{ height: "40px" }}
        >
          {loadingReport ? "Generating..." : "Generate Report"}
        </Button>
      </Box>

      <div className="ConsolidatedBomGrid">
        <StyledDataGrid
          columns={columns}
          rows={rows}
          loading={loadingReport}
          className="DataGrid"
        />
      </div>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default StockReport;
