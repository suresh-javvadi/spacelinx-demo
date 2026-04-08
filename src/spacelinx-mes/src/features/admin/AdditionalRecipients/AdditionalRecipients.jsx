import { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import "../../../features/features.css";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import {
  deleteAdditionalRecipient,
  fetchAdditionalRecipients,
} from "../../../services/additionalRecipientService";
import NewAdditionalRecipient from "./NewAdditionalRecipient";
import EditAdditionalRecipient from "./EditAdditionalRecipients";
import { fetchEmailTemplates } from "../../../services/emailTemplateService";
import { fetchUserLookup } from "../../../services/userService";
import { showConfirmation } from "../../../Components/ConfirmationDialog/ConfirmationDialog";

const AdditionalRecipients = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [additionalRecipientData, setAdditionalRecipientData] = useState([]);
  const [selectedAdditionalRecipient, setSelectedAdditionalRecipient] =
    useState(null);
  const [
    createAdditionalRecipientDrawerStatus,
    setCreateAdditionalRecipientDrawerStatus,
  ] = useState(false);
  const [
    editAdditionalRecipientDrawerStatus,
    setEditAdditionalRecipientDrawerStatus,
  ] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [templateCodeData, setTemplateCodeData] = useState("");
  const [loadingTemplateCodes, setLoadingTemplateCodes] = useState(false);
  const [emailRecipientsData, setEmailRecipientsData] = useState("");
  const [loadingEmailRecipients, setLoadingEmailRecipients] = useState(false);

  const fetchTemplateCodes = async () => {
    setLoadingTemplateCodes(true);
    try {
      const templates = await fetchEmailTemplates();
      setTemplateCodeData(templates);
    } catch (error) {
      console.error("Error fetching template codes:", error);
    } finally {
      setLoadingTemplateCodes(false);
    }
  };

  const fetchEmailRecipients = async () => {
    setLoadingEmailRecipients(true);
    try {
      const data = await fetchUserLookup();
      setEmailRecipientsData(data);
    } catch (error) {
      console.error("Error fetching email recipients:", error);
    } finally {
      setLoadingEmailRecipients(false);
    }
  };

  useEffect(() => {
    fetchTemplateCodes();
    fetchEmailRecipients();
  }, []);

  const handleCloseClick = () => {
    setCreateAdditionalRecipientDrawerStatus(false);
    setEditAdditionalRecipientDrawerStatus(false);
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
      const additionalRecipients = await fetchAdditionalRecipients();
      if (additionalRecipients) {
        additionalRecipients.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAdditionalRecipientData(additionalRecipients);
      }
    } catch (error) {
      Alert("Error fetching Additional Recipients", "error");
      console.error("Error fetching Additional Recipients data:", error);
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
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "recipientName",
      headerName: "Recipient Name",
      flex: 1,
    },
    {
      field: "recipientType",
      headerName: "Recipient Type",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      renderCell: (params) => {
        const handleDelete = async (e) => {
          e.stopPropagation();
          if (!hasPermission(PERMISSIONS.ADDITIONALRECIPIENTS.DELETE)) {
            Alert("You do not have access to delete.", "warning");
            return;
          }
          const isConfirmed = await showConfirmation(
            "Are you sure?",
            "You won't be able to undo this action!"
          );

          if (isConfirmed) {
            try {
              await deleteAdditionalRecipient(params.row.id);
              handleRefresh();
              showAlert("success", "Deleted!", "Part removed from selection.");
            } catch (error) {
              showAlert("error", "Error!", "Failed to delete part. Try again.");
              console.error("Delete error:", error);
            }
          }
        };

        return (
          <ion-icon name="trash-outline" onClick={handleDelete}></ion-icon>
        );
      },
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Additional Recipients</p>
          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.ADDITIONALRECIPIENTS.MODIFY)) {
                Alert("You do not have access to create.", "warning");
                return;
              }
              setCreateAdditionalRecipientDrawerStatus(true);
            }}
          >
            + Add New
          </Button>
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={additionalRecipientData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedAdditionalRecipient(params.row);
              setEditAdditionalRecipientDrawerStatus(true);
            }}
            className="DataGrid"
            pageSize={5}
            loading={loadingData}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createAdditionalRecipientDrawerStatus}
          onClose={handleCloseClick}
        >
          <NewAdditionalRecipient
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            templateCodeData={templateCodeData}
            loadingTemplateCodes={loadingTemplateCodes}
            emailRecipientsData={emailRecipientsData}
            loadingEmailRecipients={loadingEmailRecipients}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editAdditionalRecipientDrawerStatus}
          onClose={handleCloseClick}
        >
          <EditAdditionalRecipient
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            selectedAdditionalRecipient={selectedAdditionalRecipient}
            templateCodeData={templateCodeData}
            loadingTemplateCodes={loadingTemplateCodes}
            emailRecipientsData={emailRecipientsData}
            loadingEmailRecipients={loadingEmailRecipients}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default AdditionalRecipients;
