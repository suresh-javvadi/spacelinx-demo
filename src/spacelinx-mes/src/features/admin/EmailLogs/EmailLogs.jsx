import React, { useEffect, useState, useContext } from "react";

import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

import { fetchEmailLogs } from "../../../services/emailLogService";

const EmailLogs = () => {
  const { Alert } = useContext(AlertsContext);

  const [loadingData, setLoadingData] = useState(true);
  const [emailLogs, setEmailLogs] = useState([]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchEmailLogs();
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEmailLogs(data);
    } catch (error) {
      Alert("Error fetching Email Logs", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { field: "entityType", headerName: "Entity", flex: 0.7 },
    { field: "recipientEmail", headerName: "Recipient", flex: 1.5 },
    { field: "status", headerName: "Status", flex: 0.7 },
    { field: "subject", headerName: "Subject", flex: 2 },
    { field: "templateCode", headerName: "Template", flex: 1 },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Email Logs</p>
        </div>

        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={emailLogs}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loadingData}
            pageSize={10}
            className="DataGrid"
          />
        </div>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default EmailLogs;
