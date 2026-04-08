import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";

import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

import { HomeAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";

import NewScrap from "./NewScrap";
import EditScrap from "./EditScrap";

import { fetchScrap } from "../../../services/scrapService";

const Scrap = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();

  const [loadingData, setLoadingData] = useState(true);
  const [scrapData, setScrapData] = useState([]);

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const [selectedScrap, setSelectedScrap] = useState(null);

  const fetchData = async () => {
    setLoadingData(true);

    try {
      const data = await fetchScrap();

      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setScrapData(data);
    } catch (error) {
      console.error("Error fetching scrap:", error);
      Alert("Error loading scrap requests", "error");
    }

    setLoadingData(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClose = () => {
    setCreateDrawerOpen(false);
    setEditDrawerOpen(false);
    setSelectedScrap(null);
  };

  const handleRefresh = () => {
    fetchData();
    handleClose();
  };

  const columns = [
    {
      field: "scrapNumber",
      headerName: "Scrap Number",
      flex: 1,
      renderCell: ({ row }) => (
        <span
          className="AppHyperLink"
          onClick={() => {
            if (!hasPermission(PERMISSIONS.SCRAP.VIEW)) {
              Alert("You do not have permission to view scrap", "warning");
              return;
            }
            setSelectedScrap(row);
            setEditDrawerOpen(true);
          }}
        >
          {row.scrapNumber}
        </span>
      ),
    },
    { field: "poNumber", headerName: "PO Number", flex: 1 },
    { field: "grnNumber", headerName: "GRN Number", flex: 1 },
    {
      field: "scrapStatus",
      headerName: "Status",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Draft", "Submitted", "Approved", "Rejected"], 
    },
    { field: "locationName", headerName: "Location", flex: 1 },
    { field: "raisedByFullName", headerName: "Raised By", flex: 1 },
  ];

  return (
    <div className="AdminChildren">
      {/* HEADER */}
      <div className="AdminChildrenHeader">
        <p className="PageHeader">SCRAP</p>

        <Button
          onClick={() => {
            if (!hasPermission(PERMISSIONS.SCRAP.MODIFY)) {
              Alert("You do not have permission to add scrap", "warning");
              return;
            }
            setCreateDrawerOpen(true);
          }}
        >
          + ADD NEW
        </Button>
      </div>

      {/* TABLE */}
      <div className="MasterDataDataGridDiv">
        <StyledDataGrid
          rows={scrapData}
          columns={columns}
          loading={loadingData}
          pageSize={10}
          getRowId={(row) => row.scrapRequestId}
          className="DataGrid"
        />
      </div>

      {/* CREATE DRAWER */}
      <ResizableDrawer
        anchor="right"
        open={createDrawerOpen}
        onClose={handleClose}
      >
        <NewScrap
          handleCloseClick={handleClose}
          handleRefresh={handleRefresh}
        />
      </ResizableDrawer>

      {/* EDIT DRAWER */}
      <ResizableDrawer
        anchor="right"
        open={editDrawerOpen}
        onClose={handleClose}
      >
        <EditScrap
          scrapData={selectedScrap}
          handleCloseClick={handleClose}
          handleRefresh={handleRefresh}
        />
      </ResizableDrawer>

      {/* ALERTS */}
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default Scrap;
