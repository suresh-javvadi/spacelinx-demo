import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import NewService from "./NewService";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { fetchInventoryService } from "../../../services/inventoryPartService";
import { AlertsContext } from "../../AlertsContext/Context";
import EditService from "./EditService";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { formatAmount } from "../../../utils/numberFormatter";

const ServicesInventory = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [serviceData, setServiceData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [partTypeId, setPartTypeId] = useState(null);

  const fetchServiceData = async () => {
    try {
      setLoadingData(true);
      const data = await fetchInventoryService();
      if (data.length > 0) {
        setPartTypeId(data[0].partTypeId);
      }

      const sortedData = data?.sort(
        (a, b) =>
          new Date(b.inventoryCreatedAt) - new Date(a.inventoryCreatedAt),
      );

      setServiceData(sortedData);
    } catch (error) {
      console.error("Error fetching service inventory:", error);
      Alert("Error fetching service inventory data", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [drawerOpen]);

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedPartId(null);
  };

  const handleRefresh = async () => {
    await fetchServiceData();
    handleCloseDrawer();
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Service Number",
      flex: 1,
      renderCell: ({ row }) => (
        <span
          className="AppHyperLink"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPartId(row.partId);
            setSelectedPart(row);
            setDrawerOpen(true);
          }}
        >
          {row.partNumber}
        </span>
      ),
    },
    {
      field: "partName",
      headerName: "Service Name",
      flex: 1,
    },
    {
      field: "qtyAvailable",
      headerName: "Quantity Available",
      flex: 1,
      type: "number",
    },
    {
      field: "inventoryUnitPrice",
      headerName: "Unit Price",
      flex: 1,
      type: "number",
      valueFormatter: (value) => "₹ " + formatAmount(value, 4),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Services</p>
          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.SERVICES.MODIFY)) {
                Alert("You do not have permission to add services", "warning");
                return;
              }
              setDrawerOpen(true);
            }}
            className={
              !hasPermission(PERMISSIONS.SERVICES.MODIFY)
                ? "IonIconDisabled"
                : undefined
            }
          >
            + Add New
          </Button>
        </div>

        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={serviceData}
            columns={columns}
            pageSize={5}
            className="DataGrid"
            getRowId={(row) => row.partId}
            loading={loadingData}
          />
        </div>

        <ResizableDrawer
          anchor="right"
          open={drawerOpen}
          onClose={handleCloseDrawer}
          PaperProps={{ className: "DrawerStyles" }}
        >
          {selectedPartId ? (
            <EditService
              partId={selectedPartId}
              handleCloseClick={handleCloseDrawer}
              handleRefresh={handleRefresh}
              partData={selectedPart}
              partTypeId={partTypeId}
            />
          ) : (
            <NewService
              handleCloseClick={handleCloseDrawer}
              handleRefresh={handleRefresh}
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

export default ServicesInventory;
