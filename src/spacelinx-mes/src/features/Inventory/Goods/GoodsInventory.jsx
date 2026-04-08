import React, { useEffect, useState, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import NewGoodsInventory from "./NewGoodsInventory";
import { fetchInventoryGoods } from "../../../services/inventoryPartService";
import EditGoodsInventory from "./EditGoodsInventory";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { formatAmount } from "../../../utils/numberFormatter";

const GoodsInventory = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [goodsInventoryData, setGoodsInventoryData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [partTypeId, setPartTypeId] = useState(null);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchInventoryGoods();
      if (data.length > 0) {
        setPartTypeId(data[0].partTypeId);
      }
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.inventoryCreatedAt) - new Date(a.inventoryCreatedAt),
      );

      setGoodsInventoryData(sortedData);
    } catch (error) {
      console.error(
        "Error fetching Goods Inventory Data:",
        error?.response?.data || error.message,
      );
      Alert("Error fetching Goods Inventory Data", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [drawerOpen]);

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedPartId(null);
  };

  const handleRefresh = async () => {
    await fetchData();
    handleCloseDrawer();
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Item Number",
      flex: 1,
      renderCell: ({ row }) => (
        <span
          className="AppHyperLink"
          onClick={(e) => {
            if (!hasPermission(PERMISSIONS.GOODS.VIEW)) {
              Alert("You do not have access to view this..", "warning");
              return;
            }
            e.stopPropagation();
            setSelectedPartId(row.partId);
            setSelectedPart(row);
            setDrawerOpen(true);
          }}
        >
          {row?.partNumber}
        </span>
      ),
    },
    {
      field: "partName",
      headerName: "Item Name",
      flex: 1,
    },
    {
      field: "inventoryUnitPrice",
      headerName: "Unit Price",
      flex: 1,
      type: "number",
      valueFormatter: (value) => "₹ " + formatAmount(value, 4),
    },
    {
      field: "qtyAvailable",
      headerName: "Qty Available",
      flex: 1,
      type: "number",
      renderCell: ({ row }) => <p>{row?.qtyAvailable || 0}</p>,
    },
    {
      field: "skuCode",
      headerName: "SKU Code",
      flex: 1,
      renderCell: ({ row }) => <p>{row?.skuCode || "-"}</p>,
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Goods Inventory</p>
          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.GOODS.MODIFY)) {
                Alert("You do not have permission to add new items", "warning");
                return;
              }
              setDrawerOpen(true);
            }}
          >
            + Add New
          </Button>
        </div>

        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={goodsInventoryData}
            columns={columns}
            getRowId={(row) => row.partId}
            className="DataGrid"
            pageSize={5}
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
            <EditGoodsInventory
              partId={selectedPartId}
              partTypeId={partTypeId}
              selectedGoodInventory={selectedPart}
              handleClose={handleCloseDrawer}
              handleRefresh={handleRefresh}
            />
          ) : (
            <NewGoodsInventory
              handleClose={handleCloseDrawer}
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

export default GoodsInventory;
