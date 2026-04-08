import React, { useState, useEffect, useContext } from "react";
import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { AlertsContext } from "../AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { fetchChildofChildKits } from "../../services/childKitService";
import Cliploader from "../../Components/Loaders/Cliploader";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const KitDetails = ({ selectedKit, selectedChildKitId, handleCloseClick }) => {
  const [kitDetailsData, setkitDetailsData] = useState([]);
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedChildKitId, kitDetailsData.length < 1]);
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const fetcheddata = await fetchChildofChildKits(selectedChildKitId);
      setkitDetailsData(Array(fetcheddata));
    } catch (error) {
      Alert("Error Fetching Kits Data", "error");
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "part.number",
      headerName: "Part Number",
      width: 180,
      flex: 1,
      valueGetter: (_value, row) => {
        return row ? row.part?.number ?? "" : "";
      },
    },
    {
      field: "part.quantity",
      headerName: "Quantity",
      width: 180,
      flex: 1,
      valueGetter: (_value, row) => {
        return row ? row.part?.quantity ?? "" : "";
      },
    },
    {
      field: "consumedQuantity",
      headerName: "Consumed Qty",
      width: 180,
      flex: 1,
    },
    {
      field: "lotNumber[0]",
      headerName: "SerialNumber/LotNumber",
      width: 180,
      flex: 1,
    },
    {
      field: "comments",
      headerName: "Comments",
      width: 180,
      flex: 1,
      valueGetter: (value) => {
        return value ? value : "No Results";
      },
    },
  ];

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "5px" }}>KitDetails</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="add-outline" style={{ rotate: "45deg" }}></ion-icon>
        </button>
        <div className="CreateFlyoutBody">
          {loadingData ? (
            <Cliploader loading={loadingData} />
          ) : selectedKit ? (
            <div>
              <Typography variant="body1">
                Kit Number: {selectedKit.number}
              </Typography>
              <Typography variant="body1">
                Location: {selectedKit.location?.name || "No data found"}
              </Typography>
              <Typography variant="body1">
                Work Order Id:{" "}
                {selectedKit.workOrder?.number || "No data found"}
              </Typography>

              <StyledDataGrid
                rows={kitDetailsData}
                columns={columns}
                pageSize={5}
                className="DataGrid"
              />
            </div>
          ) : (
            <div>No kit selected</div>
          )}
        </div>
      </div>
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default KitDetails;
