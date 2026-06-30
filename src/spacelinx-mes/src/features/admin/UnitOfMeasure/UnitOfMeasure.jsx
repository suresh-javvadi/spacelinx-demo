import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { fetchUnitOfMeasure } from "../../../services/unitOfMeasureService";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import NewUnitOfMeasure from "./NewUnitOfMeasure";
import EditUnitOfMeasure from "./EditUnitOfMeasure";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";

const UnitOfMeasure = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [uomData, setUomData] = useState([]);
  const [createDrawerStatus, setCreateDrawerStatus] = useState(false);
  const [editDrawerStatus, setEditDrawerStatus] = useState(false);
  const [selectedUom, setSelectedUom] = useState(null);

  const handleCloseDrawer = () => {
    setCreateDrawerStatus(false);
    setEditDrawerStatus(false);
  };

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const data = await fetchUnitOfMeasure();
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setUomData(sorted);
    } catch (error) {
      console.error("Error fetching unit of measure data:", error);
      Alert("Error fetching unit of measure data", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
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
          <p className="PageHeader">Unit of Measure</p>

          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.UNITOFMEASURE.MODIFY)) {
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
            rows={uomData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedUom(params.row);
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
          <NewUnitOfMeasure
            handleCloseClick={handleCloseDrawer}
            fetchUomData={fetchData}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editDrawerStatus}
          onClose={handleCloseDrawer}
        >
          <EditUnitOfMeasure
            selectedUom={selectedUom}
            handleCloseClick={handleCloseDrawer}
            fetchUomData={fetchData}
          />
        </ResizableDrawer>
      </div>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </>
  );
};

export default UnitOfMeasure;
