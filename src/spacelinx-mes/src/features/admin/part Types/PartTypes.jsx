import React, { useState, useEffect, useContext } from "react";
import { Drawer, Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import "../../../features/features.css";
import { fetchPartTypes } from "../../../services/partTypeService";
import NewPartType from "./NewPartType";
import EditPartType from "./EditPartType";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchPartTypeCategories } from "../../../services/PartTypeCategoriesService";
import { fetchPartLevels } from "../../../services/partLevelService";

const PartTypes = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [partTypesData, setPartTypesData] = useState([]);
  const [selectedPartType, setSelectedPartType] = useState(null);
  const [createPartTypeDrawerStatus, setCreatePartTypeDrawerStatus] =
    useState(false);
  const [editPartTypeDrawerStatus, setEditPartTypeDrawerStatus] =
    useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [partLevelData, setPartLevelData] = useState([]);
  const [loadingPartLevels, setLoadingPartLevels] = useState(true);

  useEffect(() => {
    fecthCatagoriesData();
    fetchPartLevelData();
  }, []);

  const fecthCatagoriesData = async () => {
    setLoadingCategories(true);
    try {
      const data = await fetchPartTypeCategories();
      setCategoriesData(data);
    } catch (error) {
      console.error("Error fetching Part Type Categories:", error);
      Alert("Error fetching Part Type Categories", "error");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchPartLevelData = async () => {
    setLoadingPartLevels(true);
    try {
      const data = await fetchPartLevels();
      setPartLevelData(data);
    } catch (error) {
      console.error("Error fetching Part Levels:", error);
      Alert("Error fetching Part Levels", "error");
    } finally {
      setLoadingPartLevels(false);
    }
  };

  const handleCloseClick = () => {
    setCreatePartTypeDrawerStatus(false);
    setEditPartTypeDrawerStatus(false);
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
      const partTypes = await fetchPartTypes();
      if (partTypes) {
        partTypes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPartTypesData(partTypes);
      }
    } catch (error) {
      Alert("Error fetching Part Types Data", "error");
      console.error("Error fetching Part Types data:", error);
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
      field: "partNumberPrefix",
      headerName: "Part Number Prefix",
      flex: 1,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      valueGetter: (_value, row) => row?.partTypeCategory?.name,
    },
    {
      field: "partLevel",
      headerName: "Part Level",
      flex: 1,
      valueGetter: (_value, row) => row?.partLevel?.name || "",
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Part Types</p>
          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.PARTTYPES.MODIFY)) {
                Alert("You do not have access to create.", "warning");
                return;
              }
              setCreatePartTypeDrawerStatus(true);
            }}
          >
            + Add New
          </Button>
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={partTypesData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedPartType(params.row);
              setEditPartTypeDrawerStatus(true);
            }}
            className="DataGrid"
            pageSize={5}
            loading={loadingData}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createPartTypeDrawerStatus}
          onClose={handleCloseClick}
        >
          <NewPartType
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            categoriesData={categoriesData}
            loadingCategories={loadingCategories}
            partLevelData={partLevelData}
            loadingPartLevels={loadingPartLevels}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editPartTypeDrawerStatus}
          onClose={handleCloseClick}
          variant="persistent"
        >
          <EditPartType
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            selectedPartType={selectedPartType}
            categoriesData={categoriesData}
            loadingCategories={loadingCategories}
            partLevelData={partLevelData}
            loadingPartLevels={loadingPartLevels}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default PartTypes;
