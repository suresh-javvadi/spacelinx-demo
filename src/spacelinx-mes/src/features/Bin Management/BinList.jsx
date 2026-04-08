import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";

import NewBin from "./NewBin";
import EditBin from "./EditBin";
import Cliploader from "../../Components/Loaders/Cliploader";
import ResizableDrawer from "../../Components/ResizableDrawer/ResizableDrawer";
import { AlertsContext } from "../AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { fetchBins, deleteBin } from "../../services/binService";
import {
  showAlert,
  showConfirmation,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";
const BinList = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [binData, setBinData] = useState([]);
  const [createDrawerStatus, setCreateDrawerStatus] = useState(false);
  const [editDrawerStatus, setEditDrawerStatus] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);

  const handleCloseDrawer = () => {
    setCreateDrawerStatus(false);
    setEditDrawerStatus(false);
  };

  const fetchBinData = async () => {
    try {
      setLoadingData(true);
      const data = await fetchBins();

      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      const transformed = sortedData.map((bin) => ({
        id: bin.id,
        binCode: bin.binCode,
        aisle: bin.aisle,
        rack: bin.rack,
        capacity: bin.capacity,
        locationName: bin.location?.name || "",
        unitOfMeasureName: bin.unitOfMeasure?.name || "",
      }));

      setBinData(transformed);
    } catch (error) {
      console.error("Error fetching bins:", error);
      Alert("Error fetching bin data", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchBinData();
  }, []);

  const handleDeleteClick = async (id) => {
    const confirmed = await showConfirmation(
      "Delete Bin?",
      "Are you sure you want to delete this Bin?",
    );
    if (!confirmed) return;

    try {
      await deleteBin(id);
      await fetchBinData();
      showAlert("success", "Deleted!", "Bin deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      showAlert("error", "Error", "Failed to delete Bin.");
    }
  };

  const columns = [
    {
      field: "binCode",
      headerName: "Bin Code",
      flex: 1,
    },
    {
      field: "aisle",
      headerName: "Aisle",
      flex: 1,
    },
    {
      field: "rack",
      headerName: "Rack",
      flex: 1,
    },
    {
      field: "capacity",
      headerName: "Capacity",
      flex: 1,
      type: "number",
    },
    {
      field: "locationName",
      headerName: "Location",
      flex: 1,
    },
    {
      field: "unitOfMeasureName",
      headerName: "Unit of Measure",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,

      renderCell: ({ row }) => {
        return (
          <ion-icon
            name="trash-outline"
            style={{ color: "red", cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();

              if (!hasPermission(PERMISSIONS.BINMANAGEMENT.DELETE)) {
                Alert("You do not have access to delete.", "warning");
                return;
              }

              handleDeleteClick(row.id);
            }}
          ></ion-icon>
        );
      },
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Bin Management</p>
          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.BINMANAGEMENT.MODIFY)) {
                Alert("You do not have access to create.", "warning");
                return;
              }
              setCreateDrawerStatus(true);
            }}
          >
            + Add New
          </Button>
        </div>

        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={binData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedBin(params.row);
              setEditDrawerStatus(true);
            }}
            pageSize={5}
            className="DataGrid"
            loading={loadingData}
          />
        </div>

        <ResizableDrawer
          anchor="right"
          open={createDrawerStatus}
          onClose={handleCloseDrawer}
        >
          <NewBin
            handleCloseClick={handleCloseDrawer}
            fetchBinData={fetchBinData}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editDrawerStatus}
          onClose={handleCloseDrawer}
        >
          <EditBin
            selectedBin={selectedBin}
            handleCloseClick={handleCloseDrawer}
            fetchBinData={fetchBinData}
          />
        </ResizableDrawer>
      </div>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </>
  );
};

export default BinList;
