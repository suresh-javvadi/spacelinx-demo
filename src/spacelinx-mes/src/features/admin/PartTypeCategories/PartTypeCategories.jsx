import React, { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import "../../../features/features.css";

import NewPartTypeCategory from "./NewPartTypeCategory";
import EditPartTypeCategory from "./EditPartTypeCategory";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

// make sure this path matches your service file
import { fetchPartTypeCategories } from "../../../services/PartTypeCategoriesService";

const PartTypeCategories = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();

  const [categoriesData, setCategoriesData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchPartTypeCategories();
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setCategoriesData(sortedData);
    } catch (error) {
      console.error("Error fetching Part Type Categories:", error);
      Alert("Error fetching Part Type Categories", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setCreateDrawerOpen(false);
    setEditDrawerOpen(false);
  };

  const handleRefresh = () => {
    setLoadingData(true);
    fetchData();
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
  ];

  return (
    <div className="AdminChildren">
      <div className="AdminChildrenHeader">
        <p className="PageHeader">Part Type Categories</p>
        <Button
          onClick={() => {
            if (!hasPermission(PERMISSIONS.PARTTYPECATEGORIES?.MODIFY)) {
              Alert("You do not have access to create.", "warning");
              return;
            }
            setCreateDrawerOpen(true);
          }}
        >
          + Add New
        </Button>
      </div>

      <div className="MasterDataDataGridDiv">
        <StyledDataGrid
          rows={categoriesData}
          columns={columns}
          onRowClick={(params) => {
            setSelectedCategory(params.row);
            setEditDrawerOpen(true);
          }}
          className="DataGrid"
          pageSize={5}
          loading={loadingData}
        />
      </div>

      <ResizableDrawer
        anchor="right"
        open={createDrawerOpen}
        onClose={handleClose}
      >
        <NewPartTypeCategory
          handleCloseClick={handleClose}
          handleRefresh={handleRefresh}
        />
      </ResizableDrawer>

      <ResizableDrawer
        anchor="right"
        open={editDrawerOpen}
        onClose={handleClose}
        variant="persistent"
      >
        <EditPartTypeCategory
          handleCloseClick={handleClose}
          handleRefresh={handleRefresh}
          selectedCategory={selectedCategory}
        />
      </ResizableDrawer>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default PartTypeCategories;
