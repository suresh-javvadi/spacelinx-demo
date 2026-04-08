import { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import "../../../features/features.css";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchAssemblyLocations } from "../../../services/assemblyLocationService";
import NewAssemblyLocation from "./NewAssemblyLocation";
import EditAssemblyLocation from "./EditAssemblyLocation";

const AssemblyLocation = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [locationData, setLocationData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [createLocationDrawerStatus, setCreateLocationDrawerStatus] =
    useState(false);
  const [editLocationDrawerStatus, setEditLocationDrawerStatus] =
    useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const handleCloseClick = () => {
    setCreateLocationDrawerStatus(false);
    setEditLocationDrawerStatus(false);
  };

  const handleRefresh = () => {
    setLoadingData(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const location = await fetchAssemblyLocations();
      if (location) {
        location.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLocationData(location);
      }
    } catch (error) {
      Alert("Error fetching Location Data", "error");
      console.error("Error fetching Location data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
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
          <p className="PageHeader">Assembly Locations</p>
          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.ASSEMBLYLOCATIONS.MODIFY)) {
                Alert("You do not have access to create.", "warning");
                return;
              }
              setCreateLocationDrawerStatus(true);
            }}
          >
            + Add New
          </Button>
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={locationData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedLocation(params.row);
              setEditLocationDrawerStatus(true);
            }}
            className="DataGrid"
            pageSize={5}
            loading={loadingData}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createLocationDrawerStatus}
          onClose={handleCloseClick}
        >
          <NewAssemblyLocation
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editLocationDrawerStatus}
          onClose={handleCloseClick}
          variant="persistent"
        >
          <EditAssemblyLocation
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            selectedLocation={selectedLocation}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default AssemblyLocation;
