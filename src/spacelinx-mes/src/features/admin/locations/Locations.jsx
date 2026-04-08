import React, { useState, useEffect, useContext } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import "../../../features/features.css";
import { fetchLocations } from "../../../services/locationService";
import NewLocation from "./NewLocations";
import EditLocation from "./EditLocations";
import ImportComponent from "../ImportComponent";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const Locations = () => {
  const { Alert } = useContext(AlertsContext);
  const [locationsData, setlocationsData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [createlocationDrawerStatus, setCreatelocationDrawerStatus] =
    useState(false);
  const [editlocationDrawerStatus, setEditlocationDrawerStatus] =
    useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [locationNumbersData, setLocationNumberData] = useState();

  const handleCloseClick = () => {
    setCreatelocationDrawerStatus(false);
    setEditlocationDrawerStatus(false);
  };

  const handleRefresh = () => {
    setLoadingData(true);
    fetchData();
  };
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const locationsData = await fetchLocations();
      if (locationsData) {
        locationsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setlocationsData(locationsData);
        setLocationNumberData(locationsData.map((location) => location.number));
      }
    } catch (error) {
      Alert("Error fetching Location Data", "error");
      console.error("Error fetching Location data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      field: "number",
      headerName: "Number",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">Locations</p>
          </div>
          <ImportComponent
            entityName="Location"
            uploadKey="location"
            setLoadData={setLoadingData}
            setCreateDrawerStatus={setCreatelocationDrawerStatus}
            handleRefresh={handleRefresh}
          />
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={locationsData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedId(params.row.id);
              setSelectedRowData(params.row);
              setEditlocationDrawerStatus(true);
            }}
            className="DataGrid"
            pageSize={5}
            loading={loadingData}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createlocationDrawerStatus}
          onClose={handleCloseClick}
        >
          <NewLocation
            setMainLoadingData={setLoadingData}
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            locationsData={locationsData}
            setCreatelocationDrawerStatus={setCreatelocationDrawerStatus}
            setlocationsData={setlocationsData}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editlocationDrawerStatus}
          onClose={handleCloseClick}
          variant="persistent"
        >
          <EditLocation
            setMainLoadingData={setLoadingData}
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            selectedId={selectedId}
            selectedLocationData={selectedRowData}
            locationNumbersData={locationNumbersData}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Locations;
