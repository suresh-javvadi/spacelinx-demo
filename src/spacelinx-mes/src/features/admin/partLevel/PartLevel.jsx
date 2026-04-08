import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { fetchPartLevels } from "../../../services/partLevelService";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import NewPartLevel from "./NewPartLevel";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import EditPartLevel from "./EditPartLevel";

const PartLevel = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [partLevels, setPartLevels] = useState([]);
  const [createDrawerStatus, setCreateDrawerStatus] = useState(false);
  const [editDrawerStatus, setEditDrawerStatus] = useState(false);
  const [selectedPartLevel, setSelectedPartLevel] = useState(null);

  const handleCloseDrawer = () => {
    setCreateDrawerStatus(false);
    setEditDrawerStatus(false);
  };

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const data = await fetchPartLevels();
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPartLevels(sorted);
    } catch (error) {
      console.error("Error fetching part levels:", error);
      Alert("Error fetching part level data", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      field: "code",
      headerName: "Part Level Code",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Part Level Name",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Part Levels</p>

          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.PARTLEVELS.MODIFY)) {
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
            rows={partLevels}
            columns={columns}
            onRowClick={(params) => {
              setSelectedPartLevel(params.row);
              setEditDrawerStatus(true);
            }}
            className="DataGrid"
            loading={loadingData}
          />
        </div>

        <ResizableDrawer
          anchor="right"
          open={createDrawerStatus}
          onClose={handleCloseDrawer}
        >
          <NewPartLevel
            handleCloseClick={handleCloseDrawer}
            fetchPartLevelData={fetchData}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editDrawerStatus}
          onClose={handleCloseDrawer}
        >
          <EditPartLevel
            selectedPartLevel={selectedPartLevel}
            handleCloseClick={handleCloseDrawer}
            fetchPartLevelData={fetchData}
          />
        </ResizableDrawer>
      </div>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </>
  );
};

export default PartLevel;
