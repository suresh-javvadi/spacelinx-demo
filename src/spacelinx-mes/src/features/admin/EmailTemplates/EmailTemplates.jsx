import { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import "../../../features/features.css";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchEmailTemplates } from "../../../services/emailTemplateService";
import NewEmailTemplate from "./NewEmailTemplate";
import EditEmailTemplate from "./EditEmailTemplate";

const EmailTemplates = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [emailData, setEmailData] = useState([]);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState(null);
  const [createEmailTemplateDrawerStatus, setCreateEmailTemplateDrawerStatus] =
    useState(false);
  const [editEmailTemplateDrawerStatus, setEditEmailTemplateDrawerStatus] =
    useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const handleCloseClick = () => {
    setCreateEmailTemplateDrawerStatus(false);
    setEditEmailTemplateDrawerStatus(false);
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
      const emailTemplates = await fetchEmailTemplates();
      if (emailTemplates) {
        emailTemplates.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setEmailData(emailTemplates);
      }
    } catch (error) {
      Alert("Error fetching Email Templates", "error");
      console.error("Error fetching Email Templates data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "templateCode",
      headerName: "Template Code",
      flex: 1,
    },
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
          <p className="PageHeader">Email Templates</p>
          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.EMAILTEMPLATES.MODIFY)) {
                Alert("You do not have access to create.", "warning");
                return;
              }
              setCreateEmailTemplateDrawerStatus(true);
            }}
          >
            + Add New
          </Button>
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={emailData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedEmailTemplate(params.row);
              setEditEmailTemplateDrawerStatus(true);
            }}
            className="DataGrid"
            pageSize={5}
            loading={loadingData}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createEmailTemplateDrawerStatus}
          onClose={handleCloseClick}
        >
          <NewEmailTemplate
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editEmailTemplateDrawerStatus}
          onClose={handleCloseClick}
        >
          <EditEmailTemplate
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            selectedEmailTemplate={selectedEmailTemplate}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default EmailTemplates;
