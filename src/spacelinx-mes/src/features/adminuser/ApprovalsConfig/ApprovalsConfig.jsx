import React, { useEffect, useState, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchApprovalConfigs } from "../../../services/approvalsConfigService";
import { useUserContext } from "../../userContext/UserContext";
import NewApprovalConfig from "./NewApprovalConfig";
import EditApprovalConfig from "./EditApprovalConfig.jsx";
import { PERMISSIONS } from "../../../constants/PagePermissions.js";

const ApprovalsConfig = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission, isSuperAdmin } = useUserContext();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const fetchConfigsData = async () => {
    setLoading(true);
    try {
      const data = await fetchApprovalConfigs();
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setConfigs(sorted);
    } catch (error) {
      console.error(error);
      Alert("Failed to load approval configurations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigsData();
  }, []);

  const columns = [
    {
      field: "entityType",
      headerName: "Entity Type",
      flex: 0.3,
    },
    {
      field: "numberOfLevels",
      headerName: "Approval Levels",
      flex: 0.2,
    },
    {
      field: "description",
      headerName: "Status",
      flex: 0.2,
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Approval Configurations</p>
          <Button
            onClick={() => {
              if (hasPermission(PERMISSIONS.ApprovalsConfig.CREATE)) {
                setCreateDrawerOpen(true);
              } else {
                Alert("You do not have access to add..!", "warning");
              }
            }}
          >
            + Add New
          </Button>
        </div>

        <div className="DataGridDiv">
          <StyledDataGrid
            rows={configs}
            columns={columns}
            loading={loading}
            className="DataGrid"
            onRowClick={(params) => {
              setSelectedConfig(params.row);
              setEditDrawerOpen(true);
            }}
          />
        </div>

        <ResizableDrawer
          anchor="right"
          open={createDrawerOpen}
          onClose={() => setCreateDrawerOpen(false)}
        >
          <NewApprovalConfig
            handleCloseClick={() => setCreateDrawerOpen(false)}
            fetchConfigsData={fetchConfigsData}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editDrawerOpen}
          onClose={() => setEditDrawerOpen(false)}
        >
          <EditApprovalConfig
            selectedConfig={selectedConfig}
            handleCloseClick={() => setEditDrawerOpen(false)}
            fetchConfigsData={fetchConfigsData}
          />
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default ApprovalsConfig;
