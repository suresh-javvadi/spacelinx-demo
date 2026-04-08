import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";

import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { fetchSubsystems } from "../../../services/subsystemService";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import NewSubsystem from "./NewSubsystem";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import EditSubsystem from "./EditSubsystem";

const Subsystems = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();

  const [loadingData, setLoadingData] = useState(true);
  const [subsystems, setSubsystems] = useState([]);

  const [createDrawerStatus, setCreateDrawerStatus] = useState(false);
  const [editDrawerStatus, setEditDrawerStatus] = useState(false);

  const [selectedSubsystem, setSelectedSubsystem] = useState(null);

  const handleCloseDrawer = () => {
    setCreateDrawerStatus(false);
    setEditDrawerStatus(false);
  };

  const fetchData = async () => {
    try {
      setLoadingData(true);

      const data = await fetchSubsystems();

      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setSubsystems(sorted);
    } catch (error) {
      console.error("Error fetching subsystems:", error);
      Alert("Error fetching subsystem data", "error");
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
      headerName: "Subsystem Code",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Subsystem Name",
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
          <p className="PageHeader">Subsystems</p>

          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.SUBSYSTEMS.MODIFY)) {
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
            rows={subsystems}
            columns={columns}
            onRowClick={(params) => {
              setSelectedSubsystem(params.row);
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
          <NewSubsystem
            handleCloseClick={handleCloseDrawer}
            fetchSubsystemData={fetchData}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editDrawerStatus}
          onClose={handleCloseDrawer}
        >
          <EditSubsystem
            selectedSubsystem={selectedSubsystem}
            handleCloseClick={handleCloseDrawer}
            fetchSubsystemData={fetchData}
          />
        </ResizableDrawer>
      </div>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </>
  );
};

export default Subsystems;
