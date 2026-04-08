import React, { useContext, useEffect, useMemo, useState } from "react";
import { fetchStockMovementsWithUser } from "../../../services/stockMovementService";
import { AlertsContext } from "../../AlertsContext/Context";
import dayjs from "dayjs";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { useUserContext } from "../../userContext/UserContext";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import "../Inventory.css";
import NewStockMovements from "./NewStockMovements";
import EditStockMovements from "./EditStockMovements";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";

const MOVEMENT_TABS = ["All", "Reserved", "Issued", "Consumed", "Adjustment"];

const StockMovements = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);

  useEffect(() => {
    fetchStockMovements();
  }, []);

  const fetchStockMovements = async () => {
    setLoading(true);
    try {
      const response = await fetchStockMovementsWithUser();
      const sorted = response.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setRows(sorted);
    } catch (error) {
      Alert("Failed to fetch Stock Movements", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (activeTab === "All") return rows;
    return rows.filter((row) => row.movementType === activeTab);
  }, [activeTab, rows]);

  const columns = [
    {
      field: "movementNumber",
      headerName: "Movement No",
      flex: 1,
    },
    {
      field: "movementType",
      headerName: "Type",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Reserved", "Issued", "Consumed", "Adjustment"],
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Draft", "Submitted", "Approved", "Rejected"],
    },

    {
      field: "fromLocationName",
      headerName: "From Location",
      flex: 1,
      valueGetter: (_, row) => row.fromLocationName || "-",
    },
    {
      field: "performedByFullName",
      headerName: "Performed By",
      flex: 1,
    },
    {
      field: "movementDate",
      headerName: "Transaction Date",
      flex: 1,
      type: "date",
      valueGetter: (_, row) =>
        row.movementDate ? new Date(row.movementDate) : null,
      valueFormatter: (value) =>
        value ? dayjs(value).format("DD-MM-YYYY") : "-",
    },
  ];

  return (
    <div className="AdminChildren">
      <div className="AdminChildrenHeader">
        <p className="PageHeader">Stock Movements</p>
      </div>
      <div className="StockMovementContentDiv">
        <div className="StockMovementContentDivHeader StockMovementContentDivHeaderResponsive">
          <div className="AdminPageTabs StockMovementTabs">
            {MOVEMENT_TABS.map((tab) => (
              <button
                key={tab}
                className={`TabButton ${activeTab === tab ? "Selected" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.STOCKMOVEMENTS.MODIFY)) {
                Alert(
                  "You don't have permission to create stock movements",
                  "warning",
                );
                return;
              }
              setDrawerOpen(true);
            }}
            startIcon={<Add />}
          >
            Add New
          </Button>
        </div>
      </div>

      <div className="StockMovementContentDataGridDiv">
        <StyledDataGrid
          rows={filteredRows}
          columns={columns}
          className="DataGrid"
          loading={loading}
          getRowId={(row) => row.stockMovementId}
          onRowClick={(params) => {
            setSelectedMovement(params.row);
            setEditDrawerOpen(true);
          }}
        />
      </div>

      <ResizableDrawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        defaultWidth={75}
      >
        <NewStockMovements
          handleCloseClick={() => setDrawerOpen(false)}
          handleRefresh={fetchStockMovements}
        />
      </ResizableDrawer>

      <ResizableDrawer
        anchor="right"
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        defaultWidth={75}
      >
        <EditStockMovements
          selectedMovement={selectedMovement}
          handleClose={() => setEditDrawerOpen(false)}
          handleRefresh={fetchStockMovements}
        />
      </ResizableDrawer>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default StockMovements;
