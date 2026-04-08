import React, { useContext, useEffect, useState } from "react";
import { fetchOptionSetByAppName } from "../../../services/optionSetService";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { Button, Drawer } from "@mui/material";
import NewOptionSet from "./NewOptionSet";
import EditOptionSet from "./EditOptionSet";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const OptionSet = () => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [OptionSetData, setOptionSetData] = useState([]);
  const [createDrawerStatus, setCreateDrawerStatus] = useState(false);
  const [editDrawerStatus, setEditDrawerStatus] = useState(false);
  const [selectedOptionSet, setSelectedOptionSet] = useState(null);
  const [optionSetNames, setOptionSetNames] = useState([]);
  const [optionSetDisplayNames, setOptionSetDisplayNames] = useState([]);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonError, setJsonError] = useState("");

  const handleCloseClick = async () => {
    setCreateDrawerStatus(false);
    setEditDrawerStatus(false);
  };

  useEffect(() => {
    fetchOptionSetData();
  }, []);

  const fetchOptionSetData = async () => {
    try {
      const data = await fetchOptionSetByAppName();

      setOptionSetData(
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );

      setOptionSetNames(data.map((item) => item.name));
      setOptionSetDisplayNames(data.map((item) => item.displayName));
    } catch (error) {
      Alert("Error fetching data", "error");
      console.error("Error fetching data", error);
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
    {
      field: "displayName",
      headerName: "Display Name",
      flex: 1,
    },
  ];
  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">Option Sets</p>
          </div>
          <Button onClick={() => setCreateDrawerStatus(true)}>+ Add New</Button>
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={OptionSetData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedOptionSet(params.row);
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
          onClose={handleCloseClick}
        >
          <NewOptionSet
            handleCloseClick={handleCloseClick}
            fetchOptionSetData={fetchOptionSetData}
            optionSetNames={optionSetNames}
            optionSetDisplayNames={optionSetDisplayNames}
            jsonMode={jsonMode}
            setJsonMode={setJsonMode}
            jsonError={jsonError}
            setJsonError={setJsonError}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editDrawerStatus}
          onClose={handleCloseClick}
          variant="persistent"
        >
          <EditOptionSet
            handleCloseClick={handleCloseClick}
            fetchOptionSetData={fetchOptionSetData}
            optionSetNames={optionSetNames}
            optionSetDisplayNames={optionSetDisplayNames}
            selectedOptionSet={selectedOptionSet}
            jsonMode={jsonMode}
            setJsonMode={setJsonMode}
            jsonError={jsonError}
            setJsonError={setJsonError}
          />
        </ResizableDrawer>
      </div>
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </>
  );
};

export default OptionSet;
